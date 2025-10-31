from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, Any

class ActivityBase(BaseModel):
    activity_type: str  # e.g., "focus_session", "todo_completed", "goal_updated"
    title: str
    description: Optional[str] = None
    duration_minutes: Optional[int] = None
    extra_data: Optional[Dict[str, Any]] = None  # Renamed from metadata

class ActivityCreate(ActivityBase):
    pass

class ActivityResponse(ActivityBase):
    id: int
    user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

