from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Dict, Any

class VideoBase(BaseModel):
    title: str
    description: Optional[str] = None
    url: str
    thumbnail_url: Optional[str] = None
    duration_minutes: Optional[int] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    target_goals: Optional[List[str]] = None
    target_activities: Optional[List[str]] = None

class VideoCreate(VideoBase):
    pass

class VideoResponse(VideoBase):
    id: int
    relevance_score: Optional[float] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class VideoRecommendation(BaseModel):
    videos: List[VideoResponse]
    reason: str  # AI-generated explanation for why these videos are recommended

