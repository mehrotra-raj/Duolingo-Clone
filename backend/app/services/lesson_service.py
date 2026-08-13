from sqlalchemy.orm import Session, joinedload
from datetime import datetime
from typing import Optional

from app.models.course import Lesson, Exercise, Skill
from app.models.progress import UserLessonProgress, UserSkillProgress
from app.models.user import User
from app.schemas.course import (
    LessonResponse, ExercisePublicResponse,
    CheckAnswerResponse, LessonCompleteResponse,
    SkillProgressResponse,
)
from app.services import user_service
from app.services import gamification_service
from app.core.config import settings


def get_next_lesson(db: Session, skill_id: int, user_id: int) -> Optional[Lesson]:
    """Get the next incomplete lesson for a skill."""
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        return None

    # Get completed lesson IDs for this user and skill
    completed_lesson_ids = set(
        lp.lesson_id for lp in
        db.query(UserLessonProgress)
        .filter(
            UserLessonProgress.user_id == user_id,
            UserLessonProgress.completed == True,
        ).all()
    )

    # Find first incomplete lesson
    lessons = (
        db.query(Lesson)
        .filter(Lesson.skill_id == skill_id)
        .order_by(Lesson.order_index)
        .all()
    )

    for lesson in lessons:
        if lesson.id not in completed_lesson_ids:
            return lesson

    # All lessons complete — return first lesson for practice
    return lessons[0] if lessons else None


def get_lesson_with_exercises(db: Session, lesson_id: int) -> Optional[LessonResponse]:
    """Get a lesson with all its exercises (without correct answers)."""
    lesson = (
        db.query(Lesson)
        .options(joinedload(Lesson.exercises))
        .filter(Lesson.id == lesson_id)
        .first()
    )

    if not lesson:
        return None

    exercises = [
        ExercisePublicResponse(
            id=e.id,
            order_index=e.order_index,
            type=e.type,
            prompt=e.prompt,
            options=e.options,
            word_bank=e.word_bank,
            match_pairs=e.match_pairs,
            sentence_with_blank=e.sentence_with_blank,
            hint=e.hint,
        )
        for e in sorted(lesson.exercises, key=lambda x: x.order_index)
    ]

    return LessonResponse(
        id=lesson.id,
        skill_id=lesson.skill_id,
        order_index=lesson.order_index,
        xp_reward=lesson.xp_reward,
        exercises=exercises,
    )


def check_answer(db: Session, exercise_id: int, user_answer: str) -> Optional[CheckAnswerResponse]:
    """Check if an answer is correct."""
    exercise = db.query(Exercise).filter(Exercise.id == exercise_id).first()
    if not exercise:
        return None

    # Normalize answers for comparison
    correct = exercise.correct_answer.strip().lower()
    submitted = user_answer.strip().lower()

    is_correct = correct == submitted

    return CheckAnswerResponse(
        correct=is_correct,
        correct_answer=exercise.correct_answer,
        message="Great job!" if is_correct else f"Correct answer: {exercise.correct_answer}",
    )


def complete_lesson(
    db: Session,
    lesson_id: int,
    user_id: int,
    hearts_lost: int = 0,
    correct_answers: int = 0,
    total_exercises: int = 0,
) -> Optional[LessonCompleteResponse]:
    """Complete a lesson: award XP, update progress, check achievements."""
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    user = db.query(User).filter(User.id == user_id).first()
    if not lesson or not user:
        return None

    # Deduct hearts for wrong answers
    user.hearts = max(0, user.hearts - hearts_lost)

    # Mark lesson as completed
    lesson_progress = (
        db.query(UserLessonProgress)
        .filter(
            UserLessonProgress.user_id == user_id,
            UserLessonProgress.lesson_id == lesson_id,
        )
        .first()
    )

    xp_earned = lesson.xp_reward
    is_first_completion = False

    if not lesson_progress:
        is_first_completion = True
        lesson_progress = UserLessonProgress(
            user_id=user_id,
            lesson_id=lesson_id,
            completed=True,
            xp_earned=xp_earned,
            completed_at=datetime.utcnow(),
        )
        db.add(lesson_progress)
    else:
        if not lesson_progress.completed:
            is_first_completion = True
        lesson_progress.completed = True
        lesson_progress.xp_earned = xp_earned
        lesson_progress.completed_at = datetime.utcnow()

    # Update skill progress
    skill = lesson.skill
    skill_progress = (
        db.query(UserSkillProgress)
        .filter(
            UserSkillProgress.user_id == user_id,
            UserSkillProgress.skill_id == skill.id,
        )
        .first()
    )

    if not skill_progress:
        skill_progress = UserSkillProgress(
            user_id=user_id,
            skill_id=skill.id,
            lessons_completed=1 if is_first_completion else 0,
            crown_level=0,
            is_unlocked=True,
        )
        db.add(skill_progress)
    elif is_first_completion:
        skill_progress.lessons_completed += 1

    # Check if skill is now complete (all lessons done)
    if skill_progress.lessons_completed >= skill.total_lessons:
        if skill_progress.crown_level < 1:
            skill_progress.crown_level = 1
        skill_progress.completed_at = datetime.utcnow()

        # Unlock next skill
        _unlock_next_skill(db, user_id, skill)

    db.commit()

    # Add XP and update streak only on first completion
    if is_first_completion:
        user_service.add_xp(db, user, xp_earned)
    else:
        xp_earned = 0

    # Check achievements
    earned_achievements = gamification_service.check_and_award_achievements(db, user_id)

    skill_prog_response = SkillProgressResponse(
        lessons_completed=skill_progress.lessons_completed,
        crown_level=skill_progress.crown_level,
        is_unlocked=skill_progress.is_unlocked,
        total_lessons=skill.total_lessons,
    )

    return LessonCompleteResponse(
        xp_earned=xp_earned,
        total_xp=user.total_xp,
        hearts_remaining=user.hearts,
        streak=user.current_streak,
        skill_progress=skill_prog_response,
        achievements_earned=earned_achievements,
    )


def _unlock_next_skill(db: Session, user_id: int, current_skill: Skill) -> None:
    """Unlock the next skill in the sequence."""
    from app.models.course import Unit

    # Find next skill in same unit
    next_skill = (
        db.query(Skill)
        .filter(
            Skill.unit_id == current_skill.unit_id,
            Skill.order_index == current_skill.order_index + 1,
        )
        .first()
    )

    if next_skill:
        _ensure_skill_unlocked(db, user_id, next_skill.id)
        return

    # No more skills in this unit — check if unit is complete, unlock first skill of next unit
    unit = db.query(Unit).filter(Unit.id == current_skill.unit_id).first()
    if not unit:
        return

    next_unit = (
        db.query(Unit)
        .filter(
            Unit.course_id == unit.course_id,
            Unit.order_index == unit.order_index + 1,
        )
        .first()
    )

    if next_unit:
        first_skill = (
            db.query(Skill)
            .filter(Skill.unit_id == next_unit.id)
            .order_by(Skill.order_index)
            .first()
        )
        if first_skill:
            _ensure_skill_unlocked(db, user_id, first_skill.id)


def _ensure_skill_unlocked(db: Session, user_id: int, skill_id: int) -> None:
    """Ensure a skill is unlocked for a user."""
    sp = (
        db.query(UserSkillProgress)
        .filter(
            UserSkillProgress.user_id == user_id,
            UserSkillProgress.skill_id == skill_id,
        )
        .first()
    )

    if sp:
        sp.is_unlocked = True
    else:
        sp = UserSkillProgress(
            user_id=user_id,
            skill_id=skill_id,
            lessons_completed=0,
            crown_level=0,
            is_unlocked=True,
        )
        db.add(sp)
    db.commit()
