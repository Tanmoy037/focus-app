from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base

class Goal(Base):
    __tablename__ = "goals"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String, nullable=True)  # e.g., "career", "health", "learning", "personal"
    target_date = Column(DateTime, nullable=True)
    is_achieved = Column(Boolean, default=False)
    progress_percentage = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    achieved_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="goals")
    todos = relationship("Todo", back_populates="goal")

