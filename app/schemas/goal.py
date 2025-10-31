from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class GoalBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: Optional[str] = None  # e.g., "career", "health", "learning", "personal"
    target_date: Optional[datetime] = None

class GoalCreate(GoalBase):
    pass

class GoalUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    target_date: Optional[datetime] = None
    is_achieved: Optional[bool] = None
    progress_percentage: Optional[int] = None

class GoalResponse(GoalBase):
    id: int
    user_id: int
    is_achieved: bool
    progress_percentage: int
    created_at: datetime
    updated_at: datetime
    achieved_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

