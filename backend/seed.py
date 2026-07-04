import asyncio
from core.database import SessionLocal, engine, Base
from models.user import User, Profile
from core.security import get_password_hash

def seed_owner():
    db = SessionLocal()
    
    # Check if owner exists
    owner = db.query(User).filter(User.email == "mohamedkoko32111@gmail.com").first()
    if not owner:
        hashed_password = get_password_hash("Mmohamed_652006")
        new_owner = User(
            email="mohamedkoko32111@gmail.com",
            hashed_password=hashed_password,
            role="owner",
            is_active=True,
            is_verified=True
        )
        db.add(new_owner)
        db.commit()
        db.refresh(new_owner)
        
        # Create profile
        profile = Profile(
            user_id=new_owner.id,
            name="SIYP Owner",
            privacy_level="public"
        )
        db.add(profile)
        db.commit()
        print("Owner account created.")
    else:
        print("Owner account already exists.")
    
    db.close()

if __name__ == "__main__":
    # Ensure migrations are applied instead of create_all
    seed_owner()
