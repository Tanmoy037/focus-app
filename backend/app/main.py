from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import engine, Base
from app.routers import users, todos, goals, activities, boost

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Focus App API",
    description="API for a focus and productivity tracking app with AI-powered video recommendations",
    version="1.0.0"
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(users.router)
app.include_router(todos.router)
app.include_router(goals.router)
app.include_router(activities.router)
app.include_router(boost.router)

@app.get("/")
async def root():
    return {
        "status_code": 200,
        "message": "Welcome to Focus App API!",
        "docs": "/docs",
        "redoc": "/redoc"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "Focus App API is running"}
