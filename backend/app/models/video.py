from sqlalchemy import Column, Integer, String, DateTime, Text, JSON, Float
from datetime import datetime
from app.db.database import Base

class Video(Base):
    __tablename__ = "videos"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    url = Column(String, nullable=False)
    thumbnail_url = Column(String, nullable=True)
    duration_minutes = Column(Integer, nullable=True)
    category = Column(String, nullable=True)  # e.g., "motivation", "productivity", "skill-building"
    tags = Column(JSON, nullable=True)  # Array of tags for AI matching
    relevance_score = Column(Float, nullable=True)  # AI-calculated relevance
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # For AI recommendations - store which goals/activities this video is relevant for
    target_goals = Column(JSON, nullable=True)  # Array of goal categories
    target_activities = Column(JSON, nullable=True)  # Array of activity types

