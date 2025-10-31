# Focus App - Goal Tracking with AI-Powered Video Recommendations

A full-stack productivity application that helps users achieve their goals through task management and personalized YouTube video recommendations.

## Tech Stack

**Backend:**
- FastAPI (Python)
- PostgreSQL (Neon)
- SQLAlchemy ORM
- JWT Authentication
- YouTube Data API v3

**Frontend:**
- React 18
- Vite
- React Router
- Axios

## Features

### Core Productivity Flow:
- 🎯 **Goal Management** - Set and track your objectives
- ✅ **Todo Management** - Break goals into actionable tasks
- ⚡ **Focus Timer** - Pomodoro & Custom timers with premium visuals
  - Choose Coffee ☕ or Hourglass ⏳ animation
  - Customizable work/break durations
  - Select which todo you're working on
- 📊 **Smart Tracking** - Auto-links Goals → Todos → Focus Sessions
- 📈 **Premium Dashboard** - See focus time per goal, todo completion rates

### Boost Features:
- 🚀 **YouTube Recommendations** - AI-powered videos based on your goals
- 🎵 **Focus Music** - Lofi, Rain, Ambient, Nature & Classical (YouTube streams)

### Premium Experience:
- 🎨 Dark theme UI (developer-friendly)
- 🔐 Secure JWT authentication
- 🔗 Everything interconnected
- ✨ Smooth animations throughout

## Prerequisites

- Python 3.8+
- Node.js 16+
- PostgreSQL database (or Neon account)
- YouTube Data API key

## Setup

### 1. Clone Repository

```bash
git clone <your-repo-url>
cd focus-app
```

### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Edit .env with your credentials:
# DATABASE_URL=postgresql://...
# SECRET_KEY=your-secret-key
# YOUTUBE_API_KEY=your-youtube-api-key
```

### 3. Frontend Setup

```bash
# Navigate to frontend
cd ../frontend

# Install dependencies
npm install
```

## Running the Application

### Start Backend Server

```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload
```

Backend will run at: http://localhost:8000
API Docs available at: http://localhost:8000/docs

### Start Frontend Server

```bash
cd frontend
npm run dev
```

Frontend will run at: http://localhost:3000

## Usage

1. Open http://localhost:3000
2. Register a new account
3. Login with your credentials
4. Create your first goal
5. Add todos linked to your goals
6. Visit the Boost section to get personalized YouTube video recommendations!

## API Endpoints

### Authentication
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users/me` - Get current user

### Goals
- `GET /api/goals/` - List all goals
- `POST /api/goals/` - Create new goal
- `PUT /api/goals/{id}` - Update goal
- `DELETE /api/goals/{id}` - Delete goal

### Todos
- `GET /api/todos/` - List all todos
- `POST /api/todos/` - Create new todo
- `PUT /api/todos/{id}` - Update todo
- `DELETE /api/todos/{id}` - Delete todo

### Activities
- `GET /api/activities/` - List activities
- `POST /api/activities/` - Log new activity
- `GET /api/activities/stats/summary` - Get activity statistics

### Boost (Video Recommendations)
- `GET /api/boost/recommendations` - Get personalized recommendations
- `GET /api/boost/goal/{id}/videos` - Get videos for specific goal
- `GET /api/boost/search` - Search YouTube videos

### Music (Focus Music)
- `GET /api/music/playlists` - List all focus playlists (Lofi, Rain, Ambient, Nature, Classical)
- `GET /api/music/playlists/{id}` - Get specific playlist with tracks
- `GET /api/music/recommended` - Get time-based music recommendations

## Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://user:pass@host:port/database
SECRET_KEY=your-secret-key-here
YOUTUBE_API_KEY=your-youtube-api-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Frontend (Optional)
```env
VITE_API_URL=http://localhost:8000
```

## Project Structure

```
focus-app/
├── backend/
│   ├── app/
│   │   ├── db/              # Database configuration
│   │   ├── models/          # SQLAlchemy models
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── routers/         # API endpoints
│   │   ├── services/        # Business logic (YouTube API)
│   │   ├── utils/           # Utilities (Auth)
│   │   └── main.py          # FastAPI app
│   ├── requirements.txt
│   └── .env
│
└── frontend/
    ├── src/
    │   ├── components/      # React components
    │   ├── pages/           # Page components
    │   ├── contexts/        # React contexts
    │   ├── services/        # API services
    │   ├── App.jsx
    │   └── main.jsx
    ├── package.json
    └── vite.config.js
```

## Testing

### Backend
Import the Postman collection from `backend/Focus_App_API.postman_collection.json`

### Frontend
1. Start both backend and frontend servers
2. Open http://localhost:3000
3. Register and test all features

## Deployment

### Backend
Deploy to Railway, Render, or any Python hosting platform.

### Frontend
Deploy to Vercel, Netlify, or any static hosting platform.

**Important:** Update `API_URL` in frontend to point to your deployed backend.

## Troubleshooting

### Backend Issues

**ModuleNotFoundError:**
```bash
# Make sure virtual environment is activated
source venv/bin/activate
pip install -r requirements.txt
```

**Database Connection Error:**
- Verify DATABASE_URL in .env
- Ensure PostgreSQL is running

**YouTube API Error:**
- Verify YOUTUBE_API_KEY is set
- Check API quota at Google Cloud Console

### Frontend Issues

**npm install fails:**
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
npm install
```

**CORS Errors:**
- Ensure backend is running on port 8000
- Check vite.config.js proxy settings

**Cannot connect to API:**
- Verify backend is running
- Check API_URL in frontend

## License

MIT

## Support

For issues or questions, please create an issue in the repository.

---

**Built with ❤️ using FastAPI, React, and YouTube Data API**
