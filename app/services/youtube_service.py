import os
import requests
from typing import List, Dict, Optional
from dotenv import load_dotenv

load_dotenv()

YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")
YOUTUBE_API_BASE_URL = "https://www.googleapis.com/youtube/v3"

class YouTubeService:
    """Service to interact with YouTube Data API v3"""
    
    def __init__(self, api_key: str = YOUTUBE_API_KEY):
        self.api_key = api_key
        if not self.api_key:
            raise ValueError("YouTube API key not found. Please set YOUTUBE_API_KEY in .env")
    
    def search_videos(
        self,
        query: str,
        max_results: int = 10,
        order: str = "relevance",
        video_duration: str = "medium"  # any, short (< 4min), medium (4-20min), long (> 20min)
    ) -> List[Dict]:
        """
        Search for videos on YouTube
        
        Args:
            query: Search query string
            max_results: Maximum number of results to return (max 50)
            order: Sort order (relevance, date, rating, viewCount)
            video_duration: Filter by video duration
            
        Returns:
            List of video dictionaries with relevant information
        """
        url = f"{YOUTUBE_API_BASE_URL}/search"
        
        params = {
            "key": self.api_key,
            "part": "snippet",
            "q": query,
            "type": "video",
            "maxResults": min(max_results, 50),
            "order": order,
            "videoDuration": video_duration,
            "relevanceLanguage": "en",
            "safeSearch": "moderate"
        }
        
        try:
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            videos = []
            for item in data.get("items", []):
                video = self._format_video_data(item)
                videos.append(video)
            
            return videos
        
        except requests.exceptions.RequestException as e:
            print(f"Error fetching videos from YouTube: {e}")
            return []
    
    def get_video_details(self, video_ids: List[str]) -> List[Dict]:
        """
        Get detailed information about specific videos
        
        Args:
            video_ids: List of YouTube video IDs
            
        Returns:
            List of detailed video information
        """
        if not video_ids:
            return []
        
        url = f"{YOUTUBE_API_BASE_URL}/videos"
        
        params = {
            "key": self.api_key,
            "part": "snippet,contentDetails,statistics",
            "id": ",".join(video_ids[:50])  # Max 50 IDs per request
        }
        
        try:
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            videos = []
            for item in data.get("items", []):
                video = self._format_detailed_video_data(item)
                videos.append(video)
            
            return videos
        
        except requests.exceptions.RequestException as e:
            print(f"Error fetching video details: {e}")
            return []
    
    def search_videos_for_goal(
        self,
        goal_title: str,
        goal_category: str,
        max_results: int = 5
    ) -> List[Dict]:
        """
        Search for videos relevant to a specific goal
        
        Args:
            goal_title: Title of the goal
            goal_category: Category of the goal (e.g., "career", "health", "learning")
            max_results: Maximum number of results
            
        Returns:
            List of relevant videos
        """
        # Create a targeted search query
        search_terms = {
            "career": "career development professional growth",
            "health": "health fitness wellness motivation",
            "learning": "learning education skill development",
            "personal": "personal development self improvement",
            "productivity": "productivity time management focus",
            "finance": "financial success money management"
        }
        
        category_keywords = search_terms.get(goal_category.lower(), "motivation success")
        query = f"{goal_title} {category_keywords} tutorial guide"
        
        return self.search_videos(query, max_results=max_results, order="relevance")
    
    def _format_video_data(self, item: Dict) -> Dict:
        """Format video data from search response"""
        snippet = item.get("snippet", {})
        video_id = item.get("id", {}).get("videoId", "")
        
        return {
            "video_id": video_id,
            "title": snippet.get("title", ""),
            "description": snippet.get("description", ""),
            "channel_title": snippet.get("channelTitle", ""),
            "published_at": snippet.get("publishedAt", ""),
            "thumbnail_url": snippet.get("thumbnails", {}).get("high", {}).get("url", ""),
            "url": f"https://www.youtube.com/watch?v={video_id}"
        }
    
    def _format_detailed_video_data(self, item: Dict) -> Dict:
        """Format detailed video data from videos endpoint"""
        snippet = item.get("snippet", {})
        content_details = item.get("contentDetails", {})
        statistics = item.get("statistics", {})
        video_id = item.get("id", "")
        
        # Parse ISO 8601 duration (e.g., PT15M33S)
        duration_str = content_details.get("duration", "PT0S")
        duration_minutes = self._parse_duration_to_minutes(duration_str)
        
        return {
            "video_id": video_id,
            "title": snippet.get("title", ""),
            "description": snippet.get("description", ""),
            "channel_title": snippet.get("channelTitle", ""),
            "published_at": snippet.get("publishedAt", ""),
            "thumbnail_url": snippet.get("thumbnails", {}).get("high", {}).get("url", ""),
            "url": f"https://www.youtube.com/watch?v={video_id}",
            "duration_minutes": duration_minutes,
            "view_count": int(statistics.get("viewCount", 0)),
            "like_count": int(statistics.get("likeCount", 0)),
            "tags": snippet.get("tags", [])
        }
    
    def _parse_duration_to_minutes(self, duration: str) -> int:
        """
        Parse ISO 8601 duration to minutes
        Example: PT15M33S -> 15 minutes (rounded down)
        """
        import re
        
        # Extract hours, minutes, seconds
        hours = re.search(r'(\d+)H', duration)
        minutes = re.search(r'(\d+)M', duration)
        seconds = re.search(r'(\d+)S', duration)
        
        total_minutes = 0
        if hours:
            total_minutes += int(hours.group(1)) * 60
        if minutes:
            total_minutes += int(minutes.group(1))
        if seconds and not minutes:
            total_minutes += 1  # Round up if only seconds
        
        return total_minutes
    
    def get_trending_motivational_videos(self, max_results: int = 10) -> List[Dict]:
        """Get trending motivational and productivity videos"""
        queries = [
            "motivation success mindset",
            "productivity life improvement",
            "goal achievement personal development"
        ]
        
        all_videos = []
        results_per_query = max_results // len(queries) + 1
        
        for query in queries:
            videos = self.search_videos(query, max_results=results_per_query, order="viewCount")
            all_videos.extend(videos)
            
            if len(all_videos) >= max_results:
                break
        
        return all_videos[:max_results]

