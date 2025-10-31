from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.db.database import get_db
from app.models.user import User
from app.models.todo import Todo
from app.schemas.todo import TodoCreate, TodoUpdate, TodoResponse
from app.utils.auth import get_current_active_user

router = APIRouter(prefix="/api/todos", tags=["todos"])

@router.post("/", response_model=TodoResponse, status_code=status.HTTP_201_CREATED)
async def create_todo(
    todo: TodoCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new todo"""
    db_todo = Todo(**todo.model_dump(), user_id=current_user.id)
    db.add(db_todo)
    db.commit()
    db.refresh(db_todo)
    return db_todo

@router.get("/", response_model=List[TodoResponse])
async def get_todos(
    skip: int = 0,
    limit: int = 100,
    completed: bool = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all todos for the current user"""
    query = db.query(Todo).filter(Todo.user_id == current_user.id)
    
    if completed is not None:
        query = query.filter(Todo.is_completed == completed)
    
    todos = query.offset(skip).limit(limit).all()
    return todos

@router.get("/{todo_id}", response_model=TodoResponse)
async def get_todo(
    todo_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get a specific todo"""
    todo = db.query(Todo).filter(
        Todo.id == todo_id,
        Todo.user_id == current_user.id
    ).first()
    
    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found"
        )
    return todo

@router.put("/{todo_id}", response_model=TodoResponse)
async def update_todo(
    todo_id: int,
    todo_update: TodoUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update a todo"""
    todo = db.query(Todo).filter(
        Todo.id == todo_id,
        Todo.user_id == current_user.id
    ).first()
    
    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found"
        )
    
    update_data = todo_update.model_dump(exclude_unset=True)
    
    # If marking as completed, set completed_at
    if "is_completed" in update_data and update_data["is_completed"] and not todo.is_completed:
        update_data["completed_at"] = datetime.utcnow()
    
    for field, value in update_data.items():
        setattr(todo, field, value)
    
    db.commit()
    db.refresh(todo)
    return todo

@router.delete("/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_todo(
    todo_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete a todo"""
    todo = db.query(Todo).filter(
        Todo.id == todo_id,
        Todo.user_id == current_user.id
    ).first()
    
    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found"
        )
    
    db.delete(todo)
    db.commit()
    return None

