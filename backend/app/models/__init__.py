# Models — import all so SQLAlchemy relationships resolve correctly
from app.models.user import User  # noqa: F401
from app.models.course import Course, Unit, Skill, Lesson, Exercise  # noqa: F401
from app.models.progress import UserCourseProgress, UserSkillProgress, UserLessonProgress  # noqa: F401
from app.models.gamification import Achievement, UserAchievement, LeaderboardEntry  # noqa: F401
