from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Table
from sqlalchemy.orm import relationship
from core.database import Base

user_accepted_programs = Table(
    'user_accepted_programs',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id'), primary_key=True),
    Column('program_id', Integer, ForeignKey('programs_catalog.id'), primary_key=True)
)

class ProgramCatalog(Base):
    __tablename__ = "programs_catalog"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    organization = Column(String, nullable=False)
    country = Column(String)
    description = Column(String, nullable=True)
    verified = Column(Boolean, default=False)
    
    users_accepted = relationship("User", secondary=user_accepted_programs, backref="accepted_programs")
