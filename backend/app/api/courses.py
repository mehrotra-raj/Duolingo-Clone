from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.course import CourseResponse, LearningPathResponse
from app.services import course_service
from app.core.config import settings

router = APIRouter(prefix="/courses", tags=["courses"])


@router.get("", response_model=list[CourseResponse])
def list_courses(db: Session = Depends(get_db)):
    return course_service.get_courses(db)


@router.get("/{course_id}/path", response_model=LearningPathResponse)
def get_learning_path(
    course_id: int,
    db: Session = Depends(get_db),
    user_id: int = settings.DEFAULT_USER_ID,
):
    path = course_service.get_learning_path(db, course_id, user_id)
    if not path:
        raise HTTPException(status_code=404, detail="Course not found")
    return path
