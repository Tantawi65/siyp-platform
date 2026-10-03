from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from core.database import Base

class AIRecommendation(Base):
    __tablename__ = "ai_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    
    # Store the pre-calculated recommendations as a JSON string or Text
    # For Postgres, JSONB would be ideal, but Text is universally safe for Alembic/SQLite fallback
    raw_recommendation = Column(Text, nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # We can track the user's daily usage for rate limiting
    # but a separate table might be better for detailed tracking.
    
    user = relationship("User")

class AIChatHistory(Base):
    __tablename__ = "ai_chat_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    
    role = Column(String, nullable=False) # "user" or "assistant"
    content = Column(Text, nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User")

class AIUsageLog(Base):
    """ Table to track rate limits per user per day """
    __tablename__ = "ai_usage_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    date = Column(String, index=True, nullable=False) # Store YYYY-MM-DD
    requests_count = Column(Integer, default=0)
    
    user = relationship("User")
