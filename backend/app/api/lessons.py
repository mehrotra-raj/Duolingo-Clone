from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.course import (
    LessonResponse,
    CheckAnswerRequest, CheckAnswerResponse,
    LessonCompleteRequest, LessonCompleteResponse,
)
from app.services import lesson_service
from app.core.config import settings

router = APIRouter(tags=["lessons"])


@router.get("/skills/{skill_id}/next-lesson", response_model=LessonResponse)
def get_next_lesson(
    skill_id: int,
    db: Session = Depends(get_db),
    user_id: int = settings.DEFAULT_USER_ID,
):
    lesson = lesson_service.get_next_lesson(db, skill_id, user_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="No lessons found for this skill")
    result = lesson_service.get_lesson_with_exercises(db, lesson.id)
    if not result:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return result


@router.get("/lessons/{lesson_id}", response_model=LessonResponse)
def get_lesson(lesson_id: int, db: Session = Depends(get_db)):
    result = lesson_service.get_lesson_with_exercises(db, lesson_id)
    if not result:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return result


@router.post("/lessons/{lesson_id}/complete", response_model=LessonCompleteResponse)
def complete_lesson(
    lesson_id: int,
    body: LessonCompleteRequest,
    db: Session = Depends(get_db),
    user_id: int = settings.DEFAULT_USER_ID,
):
    result = lesson_service.complete_lesson(
        db,
        lesson_id=lesson_id,
        user_id=user_id,
        hearts_lost=body.hearts_lost,
        correct_answers=body.correct_answers,
        total_exercises=body.total_exercises,
    )
    if not result:
        raise HTTPException(status_code=404, detail="Lesson or user not found")
    return result


@router.post("/exercises/{exercise_id}/check", response_model=CheckAnswerResponse)
def check_answer(
    exercise_id: int,
    body: CheckAnswerRequest,
    db: Session = Depends(get_db),
):
    result = lesson_service.check_answer(db, exercise_id, body.answer)
    if not result:
        raise HTTPException(status_code=404, detail="Exercise not found")
    return result
