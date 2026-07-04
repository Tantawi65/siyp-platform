from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from backend.core.database import get_db
from backend.models.user import User
from backend.models.opportunity import Opportunity
from backend.models.program import ProgramCatalog, user_accepted_programs
from backend.schemas.user import UserResponse, UserCreate
from backend.schemas.opportunity import OpportunityResponse
from backend.schemas.profile import ProgramResponse
from pydantic import BaseModel
from backend.api.deps import get_current_admin_user, get_current_user
from backend.core.security import get_password_hash

router = APIRouter()

def get_current_owner(current_user: User = Depends(get_current_user)):
    if current_user.role != "owner":
        raise HTTPException(status_code=403, detail="Not enough permissions. Owner role required.")
    return current_user

# --- Opportunities Review ---
@router.get("/opportunities", response_model=List[OpportunityResponse])
def get_all_opportunities(db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin_user)):
    return db.query(Opportunity).all()

@router.get("/opportunities/pending", response_model=List[OpportunityResponse])
def get_pending_opportunities(db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin_user)):
    # Both admins and owner can see pending opportunities
    return db.query(Opportunity).filter(Opportunity.status == "pending").all()

@router.put("/opportunities/{id}/approve", response_model=OpportunityResponse)
def approve_opportunity(id: int, db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin_user)):
    opportunity = db.query(Opportunity).filter(Opportunity.id == id).first()
    if not opportunity:
        raise HTTPException(status_code=404, detail="Opportunity not found")
        
    opportunity.status = "approved"
    db.commit()
    db.refresh(opportunity)
    return opportunity

@router.put("/opportunities/{id}/reject", response_model=OpportunityResponse)
def reject_opportunity(id: int, db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin_user)):
    opportunity = db.query(Opportunity).filter(Opportunity.id == id).first()
    if not opportunity:
        raise HTTPException(status_code=404, detail="Opportunity not found")
        
    opportunity.status = "rejected"
    db.commit()
    db.refresh(opportunity)
    return opportunity

@router.delete("/opportunities/{id}")
def delete_opportunity(id: int, db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin_user)):
    opportunity = db.query(Opportunity).filter(Opportunity.id == id).first()
    if not opportunity:
        raise HTTPException(status_code=404, detail="Opportunity not found")
        
    db.delete(opportunity)
    db.commit()
    return {"message": "Opportunity deleted"}

# --- Programs Review (Owner Only) ---

class MergeRequest(BaseModel):
    master_program_id: int

@router.get("/programs/pending", response_model=List[ProgramResponse])
def get_pending_programs(db: Session = Depends(get_db), current_owner: User = Depends(get_current_owner)):
    return db.query(ProgramCatalog).filter(ProgramCatalog.verified == False).all()

@router.put("/programs/{id}/approve", response_model=ProgramResponse)
def approve_program(id: int, db: Session = Depends(get_db), current_owner: User = Depends(get_current_owner)):
    program = db.query(ProgramCatalog).filter(ProgramCatalog.id == id).first()
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")
    
    program.verified = True
    db.commit()
    db.refresh(program)
    return program

@router.delete("/programs/{id}/reject")
def reject_program(id: int, db: Session = Depends(get_db), current_owner: User = Depends(get_current_owner)):
    program = db.query(ProgramCatalog).filter(ProgramCatalog.id == id).first()
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")
        
    # Deleting the program will cascade if relationships are set, 
    # but to be safe, we can delete from user_accepted_programs directly
    db.execute(user_accepted_programs.delete().where(user_accepted_programs.c.program_id == id))
    db.delete(program)
    db.commit()
    return {"message": "Program rejected and deleted"}

@router.post("/programs/{id}/merge")
def merge_program(id: int, request: MergeRequest, db: Session = Depends(get_db), current_owner: User = Depends(get_current_owner)):
    pending_prog = db.query(ProgramCatalog).filter(ProgramCatalog.id == id).first()
    master_prog = db.query(ProgramCatalog).filter(ProgramCatalog.id == request.master_program_id).first()
    
    if not pending_prog or not master_prog:
        raise HTTPException(status_code=404, detail="One or both programs not found")
        
    if pending_prog.id == master_prog.id:
        raise HTTPException(status_code=400, detail="Cannot merge program into itself")

    # For users who had the pending program, switch them to the master program.
    # To prevent unique constraint violations (if they somehow had both), 
    # we first delete any master entries for users that have the pending entry,
    # OR we ignore duplicate errors. Let's do it safely:
    
    users_with_pending = db.execute(user_accepted_programs.select().where(user_accepted_programs.c.program_id == pending_prog.id)).fetchall()
    
    for row in users_with_pending:
        user_id = row.user_id
        # Check if user already has the master program
        has_master = db.execute(user_accepted_programs.select().where(
            (user_accepted_programs.c.user_id == user_id) & 
            (user_accepted_programs.c.program_id == master_prog.id)
        )).first()
        
        if not has_master:
            # Re-assign to master
            db.execute(user_accepted_programs.update().where(
                (user_accepted_programs.c.user_id == user_id) & 
                (user_accepted_programs.c.program_id == pending_prog.id)
            ).values(program_id=master_prog.id))
        else:
            # User already has master, just delete the pending record
            db.execute(user_accepted_programs.delete().where(
                (user_accepted_programs.c.user_id == user_id) & 
                (user_accepted_programs.c.program_id == pending_prog.id)
            ))
            
    # Delete the duplicate program
    db.delete(pending_prog)
    db.commit()
    
    return {"message": "Program successfully merged and deleted"}

# --- Admin Management (Owner Only) ---
@router.get("/admins", response_model=List[UserResponse])
def get_admins(db: Session = Depends(get_db), current_owner: User = Depends(get_current_owner)):
    return db.query(User).filter(User.role.in_(["admin", "owner"])).all()

@router.get("/users", response_model=List[UserResponse])
def get_all_users(db: Session = Depends(get_db), current_owner: User = Depends(get_current_owner)):
    return db.query(User).all()

@router.put("/admins/{id}")
def promote_user_to_admin(id: int, db: Session = Depends(get_db), current_owner: User = Depends(get_current_owner)):
    user = db.query(User).filter(User.id == id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role == "owner":
        raise HTTPException(status_code=400, detail="User is already owner")
    
    user.role = "admin"
    db.commit()
    return {"message": "User promoted to admin"}

@router.delete("/users/{id}")
def delete_user(id: int, db: Session = Depends(get_db), current_owner: User = Depends(get_current_owner)):
    user = db.query(User).filter(User.id == id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role == "owner":
        raise HTTPException(status_code=400, detail="Cannot delete owner")
        
    db.delete(user)
    db.commit()
    return {"message": "User deleted"}

@router.delete("/admins/{id}")
def remove_admin(id: int, db: Session = Depends(get_db), current_owner: User = Depends(get_current_owner)):
    user = db.query(User).filter(User.id == id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role == "owner":
        raise HTTPException(status_code=400, detail="Cannot remove owner")
        
    user.role = "user"
    db.commit()
    return {"message": "Admin privileges removed"}
