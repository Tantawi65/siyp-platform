from pydantic import BaseModel
from typing import Optional
from backend.schemas.opportunity import OpportunityResponse

class SavedOpportunityBase(BaseModel):
    opportunity_id: int
    status: str = "interested" # interested, preparing, applied, accepted

class SavedOpportunityCreate(SavedOpportunityBase):
    pass

class SavedOpportunityUpdate(BaseModel):
    status: str

class SavedOpportunityResponse(SavedOpportunityBase):
    id: int
    user_id: int
    opportunity: Optional[OpportunityResponse] = None
    
    class Config:
        from_attributes = True
