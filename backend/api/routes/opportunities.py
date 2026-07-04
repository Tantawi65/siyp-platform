from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional

from core.database import get_db
from models.opportunity import Opportunity, Category, Tag
from models.user import User
from schemas.opportunity import (
    OpportunityCreate,
    OpportunityUpdate,
    OpportunityResponse,
    CategoryCreate,
    CategoryResponse,
    TagCreate,
    TagResponse
)
from api.deps import get_current_user, get_current_admin_user

router = APIRouter()

# --- Categories ---
@router.get("/categories", response_model=List[CategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    return db.query(Category).all()

@router.post("/categories", response_model=CategoryResponse)
def create_category(category_in: CategoryCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
    category = db.query(Category).filter(Category.name == category_in.name).first()
    if category:
        raise HTTPException(status_code=400, detail="Category already exists")
    new_category = Category(name=category_in.name)
    db.add(new_category)
    db.commit()
    db.refresh(new_category)
    return new_category

# --- Tags ---
@router.get("/tags", response_model=List[TagResponse])
def get_tags(db: Session = Depends(get_db)):
    return db.query(Tag).all()

@router.post("/tags", response_model=TagResponse)
def create_tag(tag_in: TagCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
    tag = db.query(Tag).filter(Tag.name == tag_in.name).first()
    if tag:
        raise HTTPException(status_code=400, detail="Tag already exists")
    new_tag = Tag(name=tag_in.name)
    db.add(new_tag)
    db.commit()
    db.refresh(new_tag)
    return new_tag

# --- Opportunities ---
@router.get("/", response_model=List[OpportunityResponse])
def get_opportunities(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    category_id: Optional[int] = None,
    country: Optional[str] = None,
    funding_type: Optional[str] = None,
    tag_id: Optional[int] = None
):
    query = db.query(Opportunity).filter(Opportunity.status == "approved")
    
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            or_(
                Opportunity.title.ilike(search_filter),
                Opportunity.organization.ilike(search_filter),
                Opportunity.description.ilike(search_filter)
            )
        )
    if category_id:
        query = query.filter(Opportunity.category_id == category_id)
    if country:
        query = query.filter(Opportunity.country.ilike(f"%{country}%"))
    if funding_type:
        query = query.filter(Opportunity.funding_type == funding_type)
    if tag_id:
        query = query.filter(Opportunity.tags.any(id=tag_id))
        
    return query.order_by(Opportunity.published_date.desc()).offset(skip).limit(limit).all()

@router.get("/{id}", response_model=OpportunityResponse)
def get_opportunity(id: int, db: Session = Depends(get_db)):
    opportunity = db.query(Opportunity).filter(Opportunity.id == id).first()
    if not opportunity:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    
    # Increment view count
    opportunity.views += 1
    db.commit()
    db.refresh(opportunity)
    
    return opportunity

@router.post("/", response_model=OpportunityResponse)
def create_opportunity(
    opp_in: OpportunityCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    # Verify category exists
    category = db.query(Category).filter(Category.id == opp_in.category_id).first()
    if not category:
        raise HTTPException(status_code=400, detail="Invalid category ID")
    
    tags = []
    if opp_in.tag_ids:
        tags = db.query(Tag).filter(Tag.id.in_(opp_in.tag_ids)).all()
        
    # Auto-approve if author is admin/owner
    status = "approved" if current_user.role in ["admin", "owner"] else "pending"
    
    new_opp = Opportunity(
        title=opp_in.title,
        organization=opp_in.organization,
        country=opp_in.country,
        opportunity_type=opp_in.opportunity_type,
        funding_type=opp_in.funding_type,
        deadline=opp_in.deadline,
        eligibility=opp_in.eligibility,
        description=opp_in.description,
        benefits=opp_in.benefits,
        requirements=opp_in.requirements,
        application_process=opp_in.application_process,
        official_website=str(opp_in.official_website) if opp_in.official_website else None,
        application_link=str(opp_in.application_link) if opp_in.application_link else None,
        cover_image_url=opp_in.cover_image_url,
        category_id=opp_in.category_id,
        author_id=current_user.id,
        status=status
    )
    new_opp.tags = tags
    
    db.add(new_opp)
    db.commit()
    db.refresh(new_opp)
    return new_opp

@router.put("/{id}", response_model=OpportunityResponse)
def update_opportunity(
    id: int, 
    opp_in: OpportunityUpdate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    opportunity = db.query(Opportunity).filter(Opportunity.id == id).first()
    if not opportunity:
        raise HTTPException(status_code=404, detail="Opportunity not found")
        
    # Check permissions (only author or admin/owner can update)
    if opportunity.author_id != current_user.id and current_user.role not in ["admin", "owner"]:
        raise HTTPException(status_code=403, detail="Not authorized to update this opportunity")
        
    update_data = opp_in.dict(exclude_unset=True)
    
    # Handle tags separately
    if "tag_ids" in update_data:
        tags = db.query(Tag).filter(Tag.id.in_(update_data.pop("tag_ids"))).all()
        opportunity.tags = tags
        
    # Handle status: only admins can change status to approved
    if "status" in update_data and current_user.role not in ["admin", "owner"]:
        update_data.pop("status") # Ignore status update from normal user
        
    for key, value in update_data.items():
        if key in ["official_website", "application_link"] and value:
            setattr(opportunity, key, str(value))
        else:
            setattr(opportunity, key, value)
            
    db.commit()
    db.refresh(opportunity)
    return opportunity
