from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class AIRecommendationResponse(BaseModel):
    id: int
    user_id: int
    raw_recommendation: str
    created_at: datetime
    has_more: bool = False
    
    class Config:
        from_attributes = True

class AIChatMessageBase(BaseModel):
    role: str
    content: str

class AIChatMessageCreate(AIChatMessageBase):
    pass

class AIChatMessageResponse(AIChatMessageBase):
    id: int
    user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class AIChatRequest(BaseModel):
    message: str
    page: int = 0
