from sqlalchemy.orm import Session, joinedload
from typing import Optional

from app.models.course import Course, Unit, Skill
from app.models.progress import UserCourseProgress, UserSkillProgress
from app.schemas.course import (
    CourseResponse, LearningPathResponse, UnitPathResponse,
    SkillPathResponse, SkillProgressResponse,
)


def get_courses(db: Session) -> list[CourseResponse]:
    """Get all available courses."""
    courses = db.query(Course).all()
    return [CourseResponse.from_orm(c) for c in courses]


def get_learning_path(db: Session, course_id: int, user_id: int) -> Optional[LearningPathResponse]:
    """Build the full learning path with user progress overlaid."""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        return None

    units = (
        db.query(Unit)
        .filter(Unit.course_id == course_id)
        .options(joinedload(Unit.skills))
        .order_by(Unit.order_index)
        .all()
    )

    # Get all skill progress for this user
    skill_progress_map = {}
    progress_records = (
        db.query(UserSkillProgress)
        .filter(UserSkillProgress.user_id == user_id)
        .all()
    )
    for p in progress_records:
        skill_progress_map[p.skill_id] = p

    # Build path with unlock logic
    unit_responses = []
    prev_unit_complete = True  # First unit is always accessible

    for unit in units:
        skill_responses = []
        prev_skill_complete = prev_unit_complete  # First skill in unit depends on prev unit

        for skill in sorted(unit.skills, key=lambda s: s.order_index):
            sp = skill_progress_map.get(skill.id)

            if sp:
                progress = SkillProgressResponse(
                    lessons_completed=sp.lessons_completed,
                    crown_level=sp.crown_level,
                    is_unlocked=sp.is_unlocked,
                    total_lessons=skill.total_lessons,
                )
            else:
                # Determine if this skill should be unlocked
                is_unlocked = prev_skill_complete and (unit.order_index == 0 or prev_unit_complete)

                # Auto-unlock the very first skill
                if unit.order_index == 0 and skill.order_index == 0:
                    is_unlocked = True

                progress = SkillProgressResponse(
                    lessons_completed=0,
                    crown_level=0,
                    is_unlocked=is_unlocked,
                    total_lessons=skill.total_lessons,
                )

            skill_responses.append(SkillPathResponse(
                id=skill.id,
                order_index=skill.order_index,
                title=skill.title,
                icon_name=skill.icon_name,
                total_lessons=skill.total_lessons,
                progress=progress,
            ))

            # Determine if this skill is complete for unlock chain
            if sp and sp.lessons_completed >= skill.total_lessons:
                prev_skill_complete = True
            elif sp and sp.lessons_completed > 0:
                prev_skill_complete = True  # At least started
            else:
                prev_skill_complete = False

        unit_responses.append(UnitPathResponse(
            id=unit.id,
            order_index=unit.order_index,
            title=unit.title,
            description=unit.description,
            color=unit.color,
            skills=skill_responses,
        ))

        # Check if entire unit is complete
        all_unit_skills_complete = all(
            skill_progress_map.get(s.id) and
            skill_progress_map[s.id].lessons_completed >= s.total_lessons
            for s in unit.skills
        )
        prev_unit_complete = all_unit_skills_complete

    return LearningPathResponse(
        course=CourseResponse.from_orm(course),
        units=unit_responses,
    )
