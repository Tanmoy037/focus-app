from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta

from app.db.database import get_db
from app.models.user import User
from app.models.activity import Activity
from app.schemas.activity import ActivityCreate, ActivityResponse
from app.utils.auth import get_current_active_user

router = APIRouter(prefix="/api/activities", tags=["activities"])

@router.post("/", response_model=ActivityResponse, status_code=status.HTTP_201_CREATED)
async def create_activity(
    activity: ActivityCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new activity (track focus session, completed todo, etc.)"""
    db_activity = Activity(**activity.model_dump(), user_id=current_user.id)
    db.add(db_activity)
    db.commit()
    db.refresh(db_activity)
    return db_activity

@router.get("/", response_model=List[ActivityResponse])
async def get_activities(
    skip: int = 0,
    limit: int = 100,
    activity_type: str = None,
    days: int = None,  # Get activities from last N days
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all activities for the current user"""
    query = db.query(Activity).filter(Activity.user_id == current_user.id)
    
    if activity_type:
        query = query.filter(Activity.activity_type == activity_type)
    
    if days:
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        query = query.filter(Activity.created_at >= cutoff_date)
    
    activities = query.order_by(Activity.created_at.desc()).offset(skip).limit(limit).all()
    return activities

@router.get("/{activity_id}", response_model=ActivityResponse)
async def get_activity(
    activity_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get a specific activity"""
    activity = db.query(Activity).filter(
        Activity.id == activity_id,
        Activity.user_id == current_user.id
    ).first()
    
    if not activity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Activity not found"
        )
    return activity

@router.delete("/{activity_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_activity(
    activity_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete an activity"""
    activity = db.query(Activity).filter(
        Activity.id == activity_id,
        Activity.user_id == current_user.id
    ).first()
    
    if not activity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Activity not found"
        )
    
    db.delete(activity)
    db.commit()
    return None

@router.get("/stats/summary", response_model=dict)
async def get_activity_stats(
    days: int = 7,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get activity statistics for the current user"""
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    
    activities = db.query(Activity).filter(
        Activity.user_id == current_user.id,
        Activity.created_at >= cutoff_date
    ).all()
    
    total_activities = len(activities)
    total_focus_time = sum(a.duration_minutes or 0 for a in activities if a.activity_type == "focus_session")
    
    activity_breakdown = {}
    for activity in activities:
        activity_type = activity.activity_type
        activity_breakdown[activity_type] = activity_breakdown.get(activity_type, 0) + 1
    
    return {
        "total_activities": total_activities,
        "total_focus_time_minutes": total_focus_time,
        "activity_breakdown": activity_breakdown,
        "period_days": days
    }

