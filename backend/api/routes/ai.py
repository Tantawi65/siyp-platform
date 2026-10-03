from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from core.database import get_db
from api.deps import get_current_active_user
from models.user import User
from models.ai import AIRecommendation, AIChatHistory
from schemas.ai import AIRecommendationResponse, AIChatMessageResponse, AIChatRequest
from core.ai_service import generate_recommendations, chat_with_ai

router = APIRouter(tags=["ai"])

@router.post("/recommendations/generate")
def generate_ai_recommendations(page: int = 0, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    """
    Manually triggers the generation of new AI recommendations based on the user's profile
    and currently active opportunities.
    """
    result = generate_recommendations(db, current_user.id, page)
    if isinstance(result, str): # returned a string message if no opportunities
        raise HTTPException(status_code=404, detail=result)
    
    rec, has_more = result
    return {
        "id": rec.id,
        "user_id": rec.user_id,
        "raw_recommendation": rec.raw_recommendation,
        "created_at": rec.created_at,
        "has_more": has_more
    }

@router.get("/recommendations", response_model=AIRecommendationResponse)
def get_latest_recommendation(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    """
    Fetches the most recently cached AI recommendation for the user.
    """
    rec = db.query(AIRecommendation).filter(AIRecommendation.user_id == current_user.id).order_by(AIRecommendation.created_at.desc()).first()
    if not rec:
        raise HTTPException(status_code=404, detail="No AI recommendations found. Please generate one first.")
    return rec

@router.post("/chat")
def chat_with_ai_endpoint(request: AIChatRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    """
    Sends a message to the AI Assistant.
    """
    response, has_more = chat_with_ai(db, current_user.id, request.message, request.page)
    return {"reply": response, "has_more": has_more}

@router.get("/chat/history", response_model=List[AIChatMessageResponse])
def get_chat_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    """
    Retrieves the user's AI chat history.
    """
    history = db.query(AIChatHistory).filter(AIChatHistory.user_id == current_user.id).order_by(AIChatHistory.created_at.asc()).all()
    return history

@router.delete("/chat/history")
def clear_chat_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    """
    Clears the user's AI chat history.
    """
    db.query(AIChatHistory).filter(AIChatHistory.user_id == current_user.id).delete()
    db.commit()
    return {"message": "Chat history cleared"}
