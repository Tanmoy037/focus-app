# Focus App - Productivity & Goal Tracking API

A production-ready FastAPI backend for tracking goals, todos, and activities with YouTube-powered video recommendations to help users achieve their objectives.

## Features

- 🔐 **User Authentication**: Secure JWT-based authentication
- ✅ **Todo Management**: Create, update, and track todos linked to goals
- 🎯 **Goal Tracking**: Set and monitor progress towards your goals
- 📊 **Activity Tracking**: Log focus sessions and track productivity
- 🚀 **Boost Section**: YouTube API integration for personalized video recommendations
  - Videos dynamically fetched based on user goals
  - Search for specific motivation/learning content
  - Get videos tailored to each goal category
  - Trending motivational content
- 📈 **Analytics**: Get insights on your productivity patterns
- 🆓 **Free Hosting**: Works with free PostgreSQL (Neon, Supabase)

## Tech Stack

- **FastAPI**: Modern, fast web framework for building APIs
- **PostgreSQL**: Robust relational database (supports free hosting: Neon, Supabase)
- **SQLAlchemy**: SQL toolkit and ORM
- **JWT**: Secure token-based authentication
- **Pydantic**: Data validation using Python type annotations
- **YouTube Data API v3**: Dynamic video recommendations
- **Requests**: HTTP library for API calls

## Database Schema

```
Users
├── Todos (linked to Goals)
├── Goals
└── Activities (focus sessions, completed tasks, etc.)

Videos (for AI recommendations)
```

## Quick Start

### Prerequisites
- Python 3.8+
- PostgreSQL database
- YouTube API key

### Installation

```bash
# Clone repository
git clone <your-repo>
cd focus-app

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables (edit .env with your credentials)
# DATABASE_URL, SECRET_KEY, YOUTUBE_API_KEY

# Run the application
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Testing with Postman

Import the `Focus_App_API.postman_collection.json` file into Postman:

1. Open Postman
2. Click Import → Upload Files
3. Select `Focus_App_API.postman_collection.json`
4. The collection includes all endpoints with sample payloads
5. Start with "Register User" → "Login" → Other endpoints

**Note**: The login request automatically saves the access token for subsequent requests.

## API Documentation

Once the server is running, access:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## API Endpoints

### Authentication
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login and get access token
- `GET /api/users/me` - Get current user info
- `PUT /api/users/me` - Update user info
- `DELETE /api/users/me` - Delete user account

### Todos
- `POST /api/todos/` - Create todo
- `GET /api/todos/` - List todos (with filters)
- `GET /api/todos/{id}` - Get specific todo
- `PUT /api/todos/{id}` - Update todo
- `DELETE /api/todos/{id}` - Delete todo

### Goals
- `POST /api/goals/` - Create goal
- `GET /api/goals/` - List goals (with filters)
- `GET /api/goals/{id}` - Get specific goal
- `PUT /api/goals/{id}` - Update goal
- `DELETE /api/goals/{id}` - Delete goal

### Activities
- `POST /api/activities/` - Log activity
- `GET /api/activities/` - List activities
- `GET /api/activities/{id}` - Get specific activity
- `GET /api/activities/stats/summary` - Get activity statistics
- `DELETE /api/activities/{id}` - Delete activity

### Boost (YouTube Video Recommendations)
- `GET /api/boost/recommendations` - Get personalized YouTube videos based on goals
- `GET /api/boost/goal/{goal_id}/videos` - Get videos for specific goal
- `GET /api/boost/search?query=motivation` - Search YouTube videos
- `GET /api/boost/trending` - Get trending motivational videos
- `GET /api/boost/video/{video_id}/details` - Get detailed video info

## API Testing

### Using Postman (Recommended)

The project includes a complete Postman collection with all endpoints and sample payloads.

**Import Instructions:**
1. Open Postman
2. Import → `Focus_App_API.postman_collection.json`
3. Collection includes automatic token management
4. All request bodies are pre-filled with examples

**Quick Test Flow:**
1. `Authentication` → `Register User`
2. `Authentication` → `Login` (token auto-saved)
3. `Goals` → `Create Goal`
4. `Boost` → `Get Personalized Recommendations`

### Using cURL

```bash
# 1. Register
curl -X POST "http://localhost:8000/api/users/register" \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "username": "johndoe", "password": "pass123", "full_name": "John Doe"}'

# 2. Login
curl -X POST "http://localhost:8000/api/users/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=user@example.com&password=pass123"

# 3. Create Goal (replace YOUR_TOKEN)
curl -X POST "http://localhost:8000/api/goals/" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Learn Python", "category": "learning"}'

# 4. Get Video Recommendations
curl -X GET "http://localhost:8000/api/boost/recommendations" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Database Models

### User
- Email, username, password (hashed)
- Profile information
- Timestamps

### Todo
- Title, description, priority
- Completion status
- Due date
- Linked to goal (optional)

### Goal
- Title, description, category
- Achievement status
- Progress percentage
- Target date

### Activity
- Activity type (focus_session, todo_completed, etc.)
- Duration
- Metadata (flexible JSON field)
- Timestamp

### YouTube Integration
- Videos fetched dynamically from YouTube API
- Personalized based on user goals and categories
- 10,000 free searches per day
- Real-time trending content

## Project Structure

```
focus-app/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application entry
│   ├── db/
│   │   └── database.py      # Database connection
│   ├── models/              # SQLAlchemy models
│   │   ├── user.py
│   │   ├── goal.py
│   │   ├── todo.py
│   │   ├── activity.py
│   │   └── video.py
│   ├── schemas/             # Pydantic schemas
│   │   ├── user.py
│   │   ├── goal.py
│   │   ├── todo.py
│   │   ├── activity.py
│   │   └── video.py
│   ├── routers/             # API endpoints
│   │   ├── users.py
│   │   ├── goals.py
│   │   ├── todos.py
│   │   ├── activities.py
│   │   └── boost.py
│   ├── services/
│   │   └── youtube_service.py
│   └── utils/
│       └── auth.py          # Authentication utilities
├── Focus_App_API.postman_collection.json
├── requirements.txt
├── .env
├── .gitignore
└── README.md
```

## Technologies

- **FastAPI** - Modern Python web framework
- **PostgreSQL** - Relational database
- **SQLAlchemy** - ORM
- **Pydantic** - Data validation
- **JWT** - Authentication
- **YouTube Data API v3** - Video recommendations
- **bcrypt** - Password hashing

## Deployment

### Environment Variables

Required environment variables (`.env`):

```env
DATABASE_URL=postgresql://user:pass@host:port/database
SECRET_KEY=your-secret-key-here
YOUTUBE_API_KEY=your-youtube-api-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
API_HOST=0.0.0.0
API_PORT=8000
```

### Production Checklist

- ✅ Use strong SECRET_KEY (32+ characters)
- ✅ Restrict CORS origins in `app/main.py`
- ✅ Enable HTTPS/SSL
- ✅ Use managed PostgreSQL service
- ✅ Implement API rate limiting
- ✅ Set up monitoring and logging
- ✅ Configure database backups
- ✅ Monitor YouTube API quota
- ✅ Add error tracking (e.g., Sentry)

### Hosting Options

**Database**: Neon, Supabase, AWS RDS, Google Cloud SQL  
**Backend**: Railway, Render, Fly.io, AWS, Google Cloud  
**Recommended**: Railway (backend) + Neon (database)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for learning and development.

## Support

For questions or issues, please create an issue in the repository.

