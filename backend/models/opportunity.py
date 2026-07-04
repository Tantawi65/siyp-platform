from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Table
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.core.database import Base
from backend.models.user import User

# Association table for opportunities and tags
opportunity_tags = Table(
    'opportunity_tags',
    Base.metadata,
    Column('opportunity_id', Integer, ForeignKey('opportunities.id'), primary_key=True),
    Column('tag_id', Integer, ForeignKey('tags.id'), primary_key=True)
)

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    
    opportunities = relationship("Opportunity", back_populates="category")

class Tag(Base):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    
    opportunities = relationship("Opportunity", secondary=opportunity_tags, back_populates="tags")

class Opportunity(Base):
    __tablename__ = "opportunities"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    organization = Column(String, nullable=False, index=True)
    country = Column(String, index=True)
    opportunity_type = Column(String)  # E.g., Scholarship, Internship
    funding_type = Column(String)      # Fully Funded, Partially Funded, etc.
    deadline = Column(DateTime)
    eligibility = Column(Text)
    description = Column(Text, nullable=False)
    benefits = Column(Text)
    requirements = Column(Text)
    application_process = Column(Text)
    official_website = Column(String)
    application_link = Column(String)
    cover_image_url = Column(String)
    
    status = Column(String, default="pending")  # pending, approved, rejected
    views = Column(Integer, default=0)
    
    published_date = Column(DateTime, default=datetime.utcnow)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    
    category = relationship("Category", back_populates="opportunities")
    tags = relationship("Tag", secondary=opportunity_tags, back_populates="opportunities")
    author = relationship("User")
