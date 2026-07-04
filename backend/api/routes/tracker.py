from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from backend.core.database import get_db
from backend.models.user import User
from backend.models.tracker import SavedOpportunity
from backend.models.opportunity import Opportunity
from backend.schemas.tracker import SavedOpportunityCreate, SavedOpportunityUpdate, SavedOpportunityResponse
from backend.api.deps import get_current_user

router = APIRouter()

@router.get("/", response_model=List[SavedOpportunityResponse])
def get_saved_opportunities(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Need to manually join or ensure the opportunity relationship is loaded if we added it,
    # but since we didn't define a relationship on the model, we can fetch them and populate.
    # To keep it simple, let's just return the saved opportunities and the frontend can fetch details if needed, 
    # or we can modify the model to include the relationship.
    # Actually, SQLAlchemy allows us to manually fetch the opportunity and attach it to the response if needed.
    
    saved = db.query(SavedOpportunity).filter(SavedOpportunity.user_id == current_user.id).all()
    
    # Attach opportunities manually for the response
    for s in saved:
        s.opportunity = db.query(Opportunity).filter(Opportunity.id == s.opportunity_id).first()
        
    return saved

@router.post("/", response_model=SavedOpportunityResponse)
def save_opportunity(
    save_in: SavedOpportunityCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    opportunity = db.query(Opportunity).filter(Opportunity.id == save_in.opportunity_id).first()
    if not opportunity:
        raise HTTPException(status_code=404, detail="Opportunity not found")
        
    saved = db.query(SavedOpportunity).filter(
        SavedOpportunity.user_id == current_user.id,
        SavedOpportunity.opportunity_id == save_in.opportunity_id
    ).first()
    
    if saved:
        raise HTTPException(status_code=400, detail="Opportunity already saved")
        
    new_saved = SavedOpportunity(
        user_id=current_user.id,
        opportunity_id=save_in.opportunity_id,
        status=save_in.status
    )
    db.add(new_saved)
    db.commit()
    db.refresh(new_saved)
    
    new_saved.opportunity = opportunity
    return new_saved

@router.put("/{id}", response_model=SavedOpportunityResponse)
def update_saved_status(
    id: int, 
    update_in: SavedOpportunityUpdate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    saved = db.query(SavedOpportunity).filter(
        SavedOpportunity.id == id,
        SavedOpportunity.user_id == current_user.id
    ).first()
    
    if not saved:
        raise HTTPException(status_code=404, detail="Saved opportunity not found")
        
    saved.status = update_in.status
    db.commit()
    db.refresh(saved)
    
    saved.opportunity = db.query(Opportunity).filter(Opportunity.id == saved.opportunity_id).first()
    return saved

@router.delete("/{id}")
def delete_saved_opportunity(
    id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    saved = db.query(SavedOpportunity).filter(
        SavedOpportunity.id == id,
        SavedOpportunity.user_id == current_user.id
    ).first()
    
    if not saved:
        raise HTTPException(status_code=404, detail="Saved opportunity not found")
        
    db.delete(saved)
    db.commit()
    return {"message": "Successfully removed saved opportunity"}
