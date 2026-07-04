from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from backend.core.database import get_db
from backend.models.user import User, Profile
from backend.models.program import ProgramCatalog
from backend.models.opportunity import Opportunity
from backend.schemas.profile import ProfileUpdate, ProfileResponse, ProgramCreate, ProgramResponse
from backend.api.deps import get_current_user, get_current_admin_user

router = APIRouter()

# --- Profiles ---
@router.get("/me", response_model=ProfileResponse)
def get_my_profile(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    response_data = profile.__dict__.copy()
    response_data["accepted_programs"] = current_user.accepted_programs
    response_data["published_opportunities"] = db.query(Opportunity).filter(Opportunity.author_id == current_user.id).all()
    return response_data

@router.put("/me", response_model=ProfileResponse)
def update_my_profile(
    profile_in: ProfileUpdate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    
    update_data = profile_in.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(profile, key, value)
        
    db.commit()
    db.refresh(profile)
    response_data = profile.__dict__.copy()
    response_data["accepted_programs"] = current_user.accepted_programs
    response_data["published_opportunities"] = db.query(Opportunity).filter(Opportunity.author_id == current_user.id).all()
    return response_data

@router.get("/community", response_model=List[ProfileResponse])
def get_community_profiles(db: Session = Depends(get_db)):
    # Only return public profiles
    profiles = db.query(Profile).filter(Profile.privacy_level == "public").all()
    result = []
    for p in profiles:
        user = db.query(User).filter(User.id == p.user_id).first()
        data = p.__dict__.copy()
        data["accepted_programs"] = user.accepted_programs if user else []
        data["published_opportunities"] = db.query(Opportunity).filter(Opportunity.author_id == p.user_id, Opportunity.status == "approved").all()
        result.append(data)
    return result

# --- Programs Catalog ---
@router.get("/programs", response_model=List[ProgramResponse])
def get_programs(db: Session = Depends(get_db)):
    return db.query(ProgramCatalog).all()

@router.post("/programs", response_model=ProgramResponse)
def create_program(
    program_in: ProgramCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    # Verify logic: if admin creates it, auto-verify. Otherwise False.
    is_verified = current_user.role in ["admin", "owner"]
    
    program = db.query(ProgramCatalog).filter(ProgramCatalog.name == program_in.name).first()
    if program:
        return program # Return existing if name matches
        
    new_program = ProgramCatalog(
        name=program_in.name,
        organization=program_in.organization,
        country=program_in.country,
        description=program_in.description,
        verified=is_verified
    )
    db.add(new_program)
    db.commit()
    db.refresh(new_program)
    return new_program

@router.get("/{user_id}", response_model=ProfileResponse)
def get_user_profile(user_id: int, db: Session = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.user_id == user_id).first()
    if not profile or profile.privacy_level != "public":
        raise HTTPException(status_code=404, detail="Profile not found or is private")
    user = db.query(User).filter(User.id == user_id).first()
    data = profile.__dict__.copy()
    data["accepted_programs"] = user.accepted_programs if user else []
    data["published_opportunities"] = db.query(Opportunity).filter(Opportunity.author_id == user_id, Opportunity.status == "approved").all()
    return data

@router.post("/me/programs/{program_id}", response_model=ProfileResponse)
def add_accepted_program(
    program_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    program = db.query(ProgramCatalog).filter(ProgramCatalog.id == program_id).first()
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")
        
    if any(p.id == program.id for p in current_user.accepted_programs):
        raise HTTPException(status_code=400, detail="Program is already added to your profile")
        
    # Execute raw SQL insert for foolproof association adding, handling duplicates safely
    from sqlalchemy import text
    try:
        db.execute(
            text("INSERT INTO user_accepted_programs (user_id, program_id) VALUES (:user_id, :program_id)"),
            {"user_id": current_user.id, "program_id": program.id}
        )
        db.commit()
    except Exception:
        db.rollback()
        pass # Already added or other constraint error

    # Reload current_user to ensure accepted_programs is up to date for response
    current_user = db.query(User).filter(User.id == current_user.id).first()
    
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    response_data = profile.__dict__.copy()
    response_data["accepted_programs"] = current_user.accepted_programs
    response_data["published_opportunities"] = db.query(Opportunity).filter(Opportunity.author_id == current_user.id).all()
    return response_data

@router.delete("/me/programs/{program_id}", response_model=ProfileResponse)
def remove_accepted_program(
    program_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    program = db.query(ProgramCatalog).filter(ProgramCatalog.id == program_id).first()
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")
        
    program_to_remove = next((p for p in current_user.accepted_programs if p.id == program_id), None)
    if not program_to_remove:
        raise HTTPException(status_code=400, detail="Program is not in your profile")
        
    # Execute raw SQL or SQLAlchemy delete for foolproof association removal
    from sqlalchemy import text
    db.execute(
        text("DELETE FROM user_accepted_programs WHERE user_id = :user_id AND program_id = :program_id"),
        {"user_id": current_user.id, "program_id": program_id}
    )
    db.commit()
    
    # Reload current_user to ensure accepted_programs is up to date for response
    current_user = db.query(User).filter(User.id == current_user.id).first()
    
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    response_data = profile.__dict__.copy()
    response_data["accepted_programs"] = current_user.accepted_programs
    response_data["published_opportunities"] = db.query(Opportunity).filter(Opportunity.author_id == current_user.id).all()
    return response_data

import uuid
import cloudinary
import cloudinary.uploader
from backend.core.config import settings
from fastapi import UploadFile, File

cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True
)

@router.post("/me/avatar", response_model=ProfileResponse)
async def upload_avatar(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
        
    try:
        content = await file.read()
        res = cloudinary.uploader.upload(content, folder="siyp_avatars")
        avatar_url = res.get("secure_url")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload image: {str(e)}")
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    profile.avatar_url = avatar_url
    db.commit()
    db.refresh(profile)
    
    response_data = profile.__dict__.copy()
    response_data["accepted_programs"] = current_user.accepted_programs
    response_data["published_opportunities"] = db.query(Opportunity).filter(Opportunity.author_id == current_user.id).all()
    return response_data

@router.delete("/me/avatar", response_model=ProfileResponse)
def remove_avatar(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    profile.avatar_url = None
    db.commit()
    db.refresh(profile)
    
    response_data = profile.__dict__.copy()
    response_data["accepted_programs"] = current_user.accepted_programs
    response_data["published_opportunities"] = db.query(Opportunity).filter(Opportunity.author_id == current_user.id).all()
    return response_data
