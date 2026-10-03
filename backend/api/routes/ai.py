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

@router.post("/recommendations/generate", response_model=AIRecommendationResponse)
def generate_ai_recommendations(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    """
    Manually triggers the generation of new AI recommendations based on the user's profile
    and currently active opportunities.
    """
    rec = generate_recommendations(db, current_user.id)
    if isinstance(rec, str): # returned a string message if no opportunities
        raise HTTPException(status_code=404, detail=rec)
    return rec

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
    response = chat_with_ai(db, current_user.id, request.message)
    return {"reply": response}

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
