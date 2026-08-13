from sqlalchemy import Column, Integer, String, DateTime, Date
from sqlalchemy.orm import relationship
from datetime import datetime, date

from app.db.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    display_name = Column(String, nullable=False)
    avatar_url = Column(String, default="")
    total_xp = Column(Integer, default=0)
    current_streak = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    last_activity_date = Column(Date, nullable=True)
    hearts = Column(Integer, default=5)
    max_hearts = Column(Integer, default=5)
    hearts_updated_at = Column(DateTime, default=datetime.utcnow)
    gems = Column(Integer, default=500)
    daily_xp_goal = Column(Integer, default=20)
    daily_xp_earned = Column(Integer, default=0)
    daily_xp_date = Column(Date, default=date.today)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    course_progress = relationship("UserCourseProgress", back_populates="user")
    skill_progress = relationship("UserSkillProgress", back_populates="user")
    lesson_progress = relationship("UserLessonProgress", back_populates="user")
    leaderboard_entries = relationship("LeaderboardEntry", back_populates="user")
    user_achievements = relationship("UserAchievement", back_populates="user")
