from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import datetime, timedelta

from app.db.database import get_db
from app.models.user import User
from app.models.goal import Goal
from app.models.activity import Activity
from app.utils.auth import get_current_active_user
from app.services.youtube_service import YouTubeService

router = APIRouter(prefix="/api/boost", tags=["boost"])

def get_youtube_service():
    """Dependency to get YouTube service instance"""
    try:
        return YouTubeService()
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"YouTube API not configured: {str(e)}"
        )

@router.get("/recommendations")
async def get_video_recommendations(
    max_results: int = 5,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    youtube_service: YouTubeService = Depends(get_youtube_service)
) -> Dict[str, Any]:
    """Get AI-powered video recommendations from YouTube based on user's goals and activities"""
    
    # Get user's active goals
    active_goals = db.query(Goal).filter(
        Goal.user_id == current_user.id,
        Goal.is_achieved == False
    ).all()
    
    # Get user's recent activities (last 7 days)
    cutoff_date = datetime.utcnow() - timedelta(days=7)
    recent_activities = db.query(Activity).filter(
        Activity.user_id == current_user.id,
        Activity.created_at >= cutoff_date
    ).all()
    
    if not active_goals and not recent_activities:
        # Return trending motivational videos if user has no goals yet
        videos = youtube_service.get_trending_motivational_videos(max_results=max_results)
        return {
            "videos": videos,
            "reason": "Welcome! Here are some trending motivational videos to get you started. Create your first goal to get personalized recommendations!",
            "user_goals": [],
            "recommendation_count": len(videos)
        }
    
    # Collect videos based on each goal
    all_videos = []
    goal_info = []
    
    for goal in active_goals[:3]:  # Focus on top 3 active goals
        goal_videos = youtube_service.search_videos_for_goal(
            goal_title=goal.title,
            goal_category=goal.category or "motivation",
            max_results=2  # Get 2 videos per goal
        )
        all_videos.extend(goal_videos)
        goal_info.append({
            "title": goal.title,
            "category": goal.category,
            "video_count": len(goal_videos)
        })
    
    # Remove duplicates based on video_id
    seen_ids = set()
    unique_videos = []
    for video in all_videos:
        if video["video_id"] not in seen_ids:
            seen_ids.add(video["video_id"])
            unique_videos.append(video)
    
    # Limit to requested number
    unique_videos = unique_videos[:max_results]
    
    # Generate personalized reason
    goal_titles = [g.title for g in active_goals[:3]]
    reason = f"Based on your {len(active_goals)} active goal(s)"
    if goal_titles:
        reason += f": '{', '.join(goal_titles)}'"
    if recent_activities:
        reason += f" and {len(recent_activities)} recent activities"
    reason += ", here are YouTube videos to help you achieve your goals!"
    
    return {
        "videos": unique_videos,
        "reason": reason,
        "user_goals": goal_info,
        "recommendation_count": len(unique_videos)
    }

@router.get("/search")
async def search_videos(
    query: str,
    max_results: int = 10,
    current_user: User = Depends(get_current_active_user),
    youtube_service: YouTubeService = Depends(get_youtube_service)
) -> Dict[str, Any]:
    """Search for videos on YouTube"""
    
    if not query or len(query.strip()) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Search query must be at least 2 characters long"
        )
    
    videos = youtube_service.search_videos(query, max_results=max_results)
    
    return {
        "videos": videos,
        "query": query,
        "result_count": len(videos)
    }

@router.get("/goal/{goal_id}/videos")
async def get_videos_for_goal(
    goal_id: int,
    max_results: int = 5,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    youtube_service: YouTubeService = Depends(get_youtube_service)
) -> Dict[str, Any]:
    """Get video recommendations for a specific goal"""
    
    # Get the goal
    goal = db.query(Goal).filter(
        Goal.id == goal_id,
        Goal.user_id == current_user.id
    ).first()
    
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    
    # Search for relevant videos
    videos = youtube_service.search_videos_for_goal(
        goal_title=goal.title,
        goal_category=goal.category or "motivation",
        max_results=max_results
    )
    
    return {
        "videos": videos,
        "goal": {
            "id": goal.id,
            "title": goal.title,
            "category": goal.category,
            "description": goal.description
        },
        "result_count": len(videos)
    }

@router.get("/trending")
async def get_trending_videos(
    max_results: int = 10,
    current_user: User = Depends(get_current_active_user),
    youtube_service: YouTubeService = Depends(get_youtube_service)
) -> Dict[str, Any]:
    """Get trending motivational and productivity videos"""
    
    videos = youtube_service.get_trending_motivational_videos(max_results=max_results)
    
    return {
        "videos": videos,
        "result_count": len(videos),
        "category": "Trending Motivational Content"
    }

@router.get("/video/{video_id}/details")
async def get_video_details(
    video_id: str,
    current_user: User = Depends(get_current_active_user),
    youtube_service: YouTubeService = Depends(get_youtube_service)
) -> Dict[str, Any]:
    """Get detailed information about a specific YouTube video"""
    
    videos = youtube_service.get_video_details([video_id])
    
    if not videos:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video not found or YouTube API error"
        )
    
    return videos[0]

