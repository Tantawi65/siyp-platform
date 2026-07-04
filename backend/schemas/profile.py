from pydantic import BaseModel, HttpUrl
from typing import List, Optional

class ProgramBase(BaseModel):
    name: str
    organization: str
    country: Optional[str] = None
    description: Optional[str] = None

class ProgramCreate(ProgramBase):
    pass

class ProgramResponse(ProgramBase):
    id: int
    verified: bool
    class Config:
        from_attributes = True

class ProfileBase(BaseModel):
    name: Optional[str] = None
    country: Optional[str] = None
    university: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    privacy_level: str = "public"
    social_github: Optional[str] = None
    social_linkedin: Optional[str] = None
    social_instagram: Optional[str] = None

class ProfileUpdate(ProfileBase):
    pass

class ProfileOpportunityResponse(BaseModel):
    id: int
    title: str
    organization: str
    country: str
    opportunity_type: str
    status: str
    class Config:
        from_attributes = True

class ProfileResponse(ProfileBase):
    id: int
    user_id: int
    accepted_programs: List[ProgramResponse] = []
    published_opportunities: List[ProfileOpportunityResponse] = []
    
    class Config:
        from_attributes = True
