# Postman Collection Guide

## Import the Collection

1. Open Postman
2. Click **Import** (top left)
3. Click **Upload Files**
4. Select `Focus_App_API.postman_collection.json`
5. Click **Import**

## Test Flow

### 1. Setup
The collection includes environment variables that are automatically set:
- `base_url` - http://localhost:8000
- `access_token` - Automatically saved after login
- `user_id`, `goal_id`, `todo_id`, `activity_id` - Auto-saved when creating resources

### 2. Authentication Flow

**Step 1: Register User**
- Navigate to `Authentication` → `Register User`
- Click **Send**
- User ID is automatically saved to environment

**Step 2: Login**
- Navigate to `Authentication` → `Login`
- Click **Send**
- Access token is **automatically saved** for all subsequent requests

**Step 3: Verify Authentication**
- Navigate to `Authentication` → `Get Current User`
- Click **Send**
- Should return your user profile

### 3. Working with Goals

**Create a Goal**
- Navigate to `Goals` → `Create Goal`
- Default body:
```json
{
  "title": "Learn Python Programming",
  "description": "Master Python for backend development and data science",
  "category": "learning",
  "target_date": "2025-12-31T23:59:59"
}
```
- Click **Send**
- Goal ID is automatically saved

**Get All Goals**
- Navigate to `Goals` → `Get All Goals`
- Optional query parameters:
  - `achieved=false` - Filter by completion
  - `category=learning` - Filter by category

**Update Goal Progress**
- Navigate to `Goals` → `Update Goal`
- Modify body to update fields

### 4. Creating Todos

**Create a Todo**
- Navigate to `Todos` → `Create Todo`
- Uses saved `goal_id` automatically
- Click **Send**

**Mark Todo as Completed**
- Navigate to `Todos` → `Mark Todo as Completed`
- Uses saved `todo_id`
- Click **Send**

### 5. Track Activities

**Log a Focus Session**
- Navigate to `Activities` → `Log Activity`
- Default body logs a 90-minute focus session
- Click **Send**

**Get Activity Statistics**
- Navigate to `Activities` → `Get Activity Statistics`
- Query param: `days=7` (last 7 days)
- Returns:
  - Total activities
  - Total focus time
  - Activity breakdown by type

### 6. Get Video Recommendations 🎥

**Get Personalized Videos**
- Navigate to `Boost (YouTube Videos)` → `Get Personalized Recommendations`
- Returns YouTube videos based on YOUR goals
- Response includes:
  - Video ID, title, description
  - YouTube URL
  - Thumbnail URL
  - Channel name
  - Reason for recommendation

**Get Videos for Specific Goal**
- Navigate to `Boost (YouTube Videos)` → `Get Videos for Specific Goal`
- Uses saved `goal_id`
- Returns targeted videos for that goal

**Search YouTube**
- Navigate to `Boost (YouTube Videos)` → `Search YouTube Videos`
- Change query parameter: `query=motivation`
- Max results: 10

**Get Trending Videos**
- Navigate to `Boost (YouTube Videos)` → `Get Trending Videos`
- Returns popular motivational/productivity content

## Collection Features

### Automatic Token Management
The login request includes a test script that automatically saves your access token:
```javascript
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    pm.environment.set("access_token", jsonData.access_token);
}
```

### Automatic ID Saving
Create requests automatically save IDs for subsequent requests:
- Register → saves `user_id`
- Create Goal → saves `goal_id`
- Create Todo → saves `todo_id`
- Log Activity → saves `activity_id`

### Pre-filled Request Bodies
All POST/PUT requests include example bodies with realistic data.

### Query Parameters
GET requests include commented query parameters showing available filters.

## Tips

1. **Test in Order**: Run requests from top to bottom for best results
2. **Check Environment**: Click the eye icon to see saved variables
3. **Copy Variables**: Use `{{variable_name}}` in any request
4. **Multiple Users**: Create a separate Postman environment for each user

## Common Query Parameters

### Goals
- `skip` - Pagination offset (default: 0)
- `limit` - Results per page (default: 100)
- `achieved` - Filter by status (true/false)
- `category` - Filter by category

### Todos
- `skip` - Pagination offset
- `limit` - Results per page
- `completed` - Filter by status (true/false)

### Activities
- `skip` - Pagination offset
- `limit` - Results per page
- `activity_type` - Filter by type
- `days` - Get recent activities (e.g., 7)

### Boost
- `max_results` - Number of videos (default: 5, max: 50)
- `query` - Search term for video search

## Response Status Codes

- `200` - Success
- `201` - Created
- `204` - No Content (deleted)
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `404` - Not Found
- `500` - Server Error

## Example Complete Flow

1. **Register** → `POST /api/users/register`
2. **Login** → `POST /api/users/login` (token saved)
3. **Create Goal** → `POST /api/goals/` 
   - Goal: "Learn FastAPI"
4. **Get Videos** → `GET /api/boost/recommendations`
   - Returns FastAPI tutorials
5. **Create Todo** → `POST /api/todos/`
   - Todo: "Complete FastAPI tutorial"
6. **Log Activity** → `POST /api/activities/`
   - 60-minute focus session
7. **Get Stats** → `GET /api/activities/stats/summary`
   - See your progress!

## Troubleshooting

### "Could not get any response"
- Make sure the server is running: `uvicorn app.main:app --reload`
- Check `base_url` is set to `http://localhost:8000`

### "401 Unauthorized"
- Run the Login request again
- Check the access token is saved (eye icon → `access_token`)

### "YouTube API not configured"
- Make sure `YOUTUBE_API_KEY` is set in `.env` file
- Restart the server after adding the key

### "404 Not Found" on Goal/Todo/Activity
- Make sure you created the resource first
- Check the saved ID in environment variables

---

**Happy Testing! 🚀**

