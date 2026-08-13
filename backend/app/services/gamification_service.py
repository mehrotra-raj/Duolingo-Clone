from sqlalchemy.orm import Session
from datetime import date, timedelta
from typing import Optional

from app.models.user import User
from app.models.gamification import Achievement, UserAchievement, LeaderboardEntry
from app.models.progress import UserLessonProgress
from app.schemas.gamification import (
    AchievementResponse, LeaderboardEntryResponse, LeaderboardResponse,
)
from app.core.config import settings


def get_leaderboard(db: Session, user_id: int) -> LeaderboardResponse:
    """Get the weekly leaderboard."""
    today = date.today()
    # Find start of current week (Monday)
    week_start = today - timedelta(days=today.weekday())

    entries = (
        db.query(LeaderboardEntry)
        .filter(LeaderboardEntry.week_start == week_start)
        .order_by(LeaderboardEntry.weekly_xp.desc())
        .all()
    )

    # If no entries for this week, get the most recent week's entries
    if not entries:
        latest_entry = (
            db.query(LeaderboardEntry)
            .order_by(LeaderboardEntry.week_start.desc())
            .first()
        )
        if latest_entry:
            entries = (
                db.query(LeaderboardEntry)
                .filter(LeaderboardEntry.week_start == latest_entry.week_start)
                .order_by(LeaderboardEntry.weekly_xp.desc())
                .all()
            )

    league = entries[0].league if entries else "Bronze"
    current_user_rank = 0

    response_entries = []
    for i, entry in enumerate(entries):
        rank = i + 1
        user = db.query(User).filter(User.id == entry.user_id).first()
        if not user:
            continue

        is_current = entry.user_id == user_id
        if is_current:
            current_user_rank = rank

        response_entries.append(LeaderboardEntryResponse(
            rank=rank,
            user_id=entry.user_id,
            username=user.username,
            display_name=user.display_name,
            avatar_url=user.avatar_url,
            weekly_xp=entry.weekly_xp,
            league=entry.league,
            is_current_user=is_current,
        ))

    return LeaderboardResponse(
        league=league,
        entries=response_entries,
        current_user_rank=current_user_rank,
    )


def get_achievements(db: Session, user_id: int) -> list[AchievementResponse]:
    """Get all achievements with user unlock status."""
    achievements = db.query(Achievement).all()
    user_achievement_ids = set(
        ua.achievement_id for ua in
        db.query(UserAchievement)
        .filter(UserAchievement.user_id == user_id)
        .all()
    )

    result = []
    for a in achievements:
        earned = a.id in user_achievement_ids
        ua = None
        if earned:
            ua = (
                db.query(UserAchievement)
                .filter(
                    UserAchievement.user_id == user_id,
                    UserAchievement.achievement_id == a.id,
                )
                .first()
            )

        result.append(AchievementResponse(
            id=a.id,
            name=a.name,
            description=a.description,
            icon_name=a.icon_name,
            criteria_type=a.criteria_type,
            criteria_value=a.criteria_value,
            earned=earned,
            earned_at=ua.earned_at if ua else None,
        ))

    return result


def check_and_award_achievements(db: Session, user_id: int) -> list[str]:
    """Check all achievement criteria and award any newly earned ones."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return []

    achievements = db.query(Achievement).all()
    existing = set(
        ua.achievement_id for ua in
        db.query(UserAchievement)
        .filter(UserAchievement.user_id == user_id)
        .all()
    )

    lessons_completed = (
        db.query(UserLessonProgress)
        .filter(
            UserLessonProgress.user_id == user_id,
            UserLessonProgress.completed == True,
        )
        .count()
    )

    earned = []
    for a in achievements:
        if a.id in existing:
            continue

        value = 0
        if a.criteria_type == "xp_total":
            value = user.total_xp
        elif a.criteria_type == "streak":
            value = user.current_streak
        elif a.criteria_type == "lessons_completed":
            value = lessons_completed
        elif a.criteria_type == "hearts_refill":
            value = 1  # Simplified: always meets criteria when checked

        if value >= a.criteria_value:
            ua = UserAchievement(
                user_id=user_id,
                achievement_id=a.id,
            )
            db.add(ua)
            earned.append(a.name)

    if earned:
        db.commit()

    return earned
