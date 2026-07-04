from pydantic import BaseModel, HttpUrl
from typing import List, Optional
from datetime import datetime

# Tags
class TagBase(BaseModel):
    name: str

class TagCreate(TagBase):
    pass

class TagResponse(TagBase):
    id: int
    class Config:
        from_attributes = True

# Categories
class CategoryBase(BaseModel):
    name: str

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: int
    class Config:
        from_attributes = True

# Authors
class AuthorProfileResponse(BaseModel):
    name: Optional[str] = None
    class Config:
        from_attributes = True

class AuthorResponse(BaseModel):
    id: int
    email: str
    profile: Optional[AuthorProfileResponse] = None
    class Config:
        from_attributes = True

# Opportunities
class OpportunityBase(BaseModel):
    title: str
    organization: str
    country: Optional[str] = None
    opportunity_type: Optional[str] = None
    funding_type: Optional[str] = None
    deadline: Optional[datetime] = None
    eligibility: Optional[str] = None
    description: str
    benefits: Optional[str] = None
    requirements: Optional[str] = None
    application_process: Optional[str] = None
    official_website: Optional[HttpUrl] = None
    application_link: Optional[HttpUrl] = None
    cover_image_url: Optional[str] = None
    category_id: int

class OpportunityCreate(OpportunityBase):
    tag_ids: List[int] = []

class OpportunityUpdate(BaseModel):
    title: Optional[str] = None
    organization: Optional[str] = None
    country: Optional[str] = None
    opportunity_type: Optional[str] = None
    funding_type: Optional[str] = None
    deadline: Optional[datetime] = None
    eligibility: Optional[str] = None
    description: Optional[str] = None
    benefits: Optional[str] = None
    requirements: Optional[str] = None
    application_process: Optional[str] = None
    official_website: Optional[HttpUrl] = None
    application_link: Optional[HttpUrl] = None
    cover_image_url: Optional[str] = None
    category_id: Optional[int] = None
    status: Optional[str] = None
    tag_ids: Optional[List[int]] = None

class OpportunityResponse(OpportunityBase):
    id: int
    status: str
    views: int
    published_date: datetime
    last_updated: datetime
    author_id: int
    author: Optional[AuthorResponse] = None
    
    category: CategoryResponse
    tags: List[TagResponse] = []

    class Config:
        from_attributes = True
