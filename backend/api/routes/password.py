from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
import resend
import secrets
from datetime import datetime, timedelta

from core.database import get_db
from core.config import settings
from core.security import get_password_hash
from models.user import User

router = APIRouter()
resend.api_key = settings.RESEND_API_KEY

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

@router.post("/forgot-password")
def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="No account found with that email address.")
        
    # Generate token
    token = secrets.token_urlsafe(32)
    user.reset_token = token
    # Expiration: 1 hour from now
    user.reset_token_expires = (datetime.utcnow() + timedelta(hours=1)).isoformat()
    db.commit()
    
    # Send email
    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
    try:
        resend.Emails.send({
            "from": settings.RESEND_FROM_EMAIL,
            "to": [user.email],
            "subject": "Reset your SIYP Team password",
            "html": f"<p>Hello,</p><p>Click the link below to reset your password:</p><p><a href='{reset_url}'>{reset_url}</a></p><p>This link will expire in 1 hour.</p>"
        })
    except Exception as e:
        print("Failed to send email:", e)
        
    return {"message": "Check your email for a reset link."}

@router.post("/reset-password")
def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.reset_token == request.token).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
        
    # Check expiration
    if user.reset_token_expires:
        expires = datetime.fromisoformat(user.reset_token_expires)
        if datetime.utcnow() > expires:
            raise HTTPException(status_code=400, detail="Reset token has expired")
            
    # Hash new password and save
    user.hashed_password = get_password_hash(request.new_password)
    user.reset_token = None
    user.reset_token_expires = None
    db.commit()
    
    return {"message": "Password successfully reset"}
