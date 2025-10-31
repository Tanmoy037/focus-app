from fastapi import APIRouter, Depends
from typing import List, Dict, Any
from app.models.user import User
from app.utils.auth import get_current_active_user

router = APIRouter(prefix="/api/music", tags=["music"])

# Predefined playlists for focus music
FOCUS_PLAYLISTS = {
    "lofi": {
        "name": "Lofi Hip Hop",
        "description": "Chill beats to focus and relax",
        "tracks": [
            {
                "id": "lofi_1",
                "title": "Lofi Study Beats",
                "artist": "Chillhop Music",
                "duration": 180,
                "url": "https://www.youtube.com/watch?v=jfKfPfyJRdk",  # Lofi Girl - beats to relax/study to
                "embed_id": "jfKfPfyJRdk"
            },
            {
                "id": "lofi_2",
                "title": "Cozy Lofi",
                "artist": "Lofi Girl",
                "duration": 240,
                "url": "https://www.youtube.com/watch?v=rUxyKA_-grg",
                "embed_id": "rUxyKA_-grg"
            }
        ]
    },
    "rain": {
        "name": "Rain Sounds",
        "description": "Natural rain sounds for deep focus",
        "tracks": [
            {
                "id": "rain_1",
                "title": "Gentle Rain",
                "artist": "Nature Sounds",
                "duration": 600,
                "url": "https://www.youtube.com/watch?v=q76bMs-NwRk",
                "embed_id": "q76bMs-NwRk"
            },
            {
                "id": "rain_2",
                "title": "Thunderstorm",
                "artist": "Ambient Sounds",
                "duration": 480,
                "url": "https://www.youtube.com/watch?v=nDq6TstdEi8",
                "embed_id": "nDq6TstdEi8"
            }
        ]
    },
    "ambient": {
        "name": "Ambient Music",
        "description": "Calm instrumental music for concentration",
        "tracks": [
            {
                "id": "ambient_1",
                "title": "Deep Focus",
                "artist": "Spotify",
                "duration": 300,
                "url": "https://www.youtube.com/watch?v=lTRiuFIWV54",
                "embed_id": "lTRiuFIWV54"
            },
            {
                "id": "ambient_2",
                "title": "Peaceful Piano",
                "artist": "Spotify",
                "duration": 280,
                "url": "https://www.youtube.com/watch?v=4oStw0r33so",
                "embed_id": "4oStw0r33so"
            }
        ]
    },
    "nature": {
        "name": "Nature Sounds",
        "description": "Forest, ocean, and nature ambience",
        "tracks": [
            {
                "id": "nature_1",
                "title": "Forest Ambience",
                "artist": "Nature Sounds",
                "duration": 420,
                "url": "https://www.youtube.com/watch?v=xNN7iTA57jM",
                "embed_id": "xNN7iTA57jM"
            },
            {
                "id": "nature_2",
                "title": "Ocean Waves",
                "artist": "Relaxing Sounds",
                "duration": 360,
                "url": "https://www.youtube.com/watch?v=V1bFr2SWP1I",
                "embed_id": "V1bFr2SWP1I"
            }
        ]
    },
    "classical": {
        "name": "Classical Focus",
        "description": "Classical music for enhanced concentration",
        "tracks": [
            {
                "id": "classical_1",
                "title": "Classical Study Music",
                "artist": "Various Artists",
                "duration": 320,
                "url": "https://www.youtube.com/watch?v=jgpJVI3tDbY",
                "embed_id": "jgpJVI3tDbY"
            }
        ]
    }
}

@router.get("/playlists")
async def get_playlists(
    current_user: User = Depends(get_current_active_user)
) -> Dict[str, Any]:
    """Get all available focus music playlists"""
    return {
        "playlists": [
            {
                "id": key,
                "name": value["name"],
                "description": value["description"],
                "track_count": len(value["tracks"])
            }
            for key, value in FOCUS_PLAYLISTS.items()
        ]
    }

@router.get("/playlists/{playlist_id}")
async def get_playlist(
    playlist_id: str,
    current_user: User = Depends(get_current_active_user)
) -> Dict[str, Any]:
    """Get specific playlist with tracks"""
    playlist = FOCUS_PLAYLISTS.get(playlist_id)
    
    if not playlist:
        return {"error": "Playlist not found"}
    
    return {
        "id": playlist_id,
        "name": playlist["name"],
        "description": playlist["description"],
        "tracks": playlist["tracks"]
    }

@router.get("/recommended")
async def get_recommended_music(
    current_user: User = Depends(get_current_active_user)
) -> Dict[str, Any]:
    """Get recommended focus music based on time of day"""
    from datetime import datetime
    
    hour = datetime.now().hour
    
    # Morning: Classical or Lofi
    # Afternoon: Ambient or Lofi
    # Evening: Rain or Nature
    
    if 6 <= hour < 12:
        recommended = ["classical", "lofi"]
    elif 12 <= hour < 18:
        recommended = ["ambient", "lofi"]
    else:
        recommended = ["rain", "nature"]
    
    playlists = [
        {
            "id": playlist_id,
            **FOCUS_PLAYLISTS[playlist_id]
        }
        for playlist_id in recommended
    ]
    
    return {
        "recommended": playlists,
        "reason": f"Recommended for {hour}:00 - optimal focus music for this time of day"
    }

# Future: Integrate with Spotify API, YouTube Music API, or SoundCloud
# This is a placeholder structure ready for real API integration

