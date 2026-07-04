from sqlalchemy import Column, Integer, String, Boolean
from backend.core.database import Base
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="user") # guest, user, admin, owner
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    reset_token = Column(String, index=True, nullable=True)
    reset_token_expires = Column(String, nullable=True) # Storing ISO format datetime
    
    profile = relationship("Profile", primaryjoin="User.id == foreign(Profile.user_id)", uselist=False, viewonly=True)
    
class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=False)
    name = Column(String)
    country = Column(String)
    university = Column(String)
    bio = Column(String)
    avatar_url = Column(String)
    privacy_level = Column(String, default="public")
    social_github = Column(String)
    social_linkedin = Column(String)
    social_instagram = Column(String)
