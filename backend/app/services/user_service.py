from sqlalchemy.orm import Session
from datetime import datetime, date, timedelta
from typing import Optional

from app.models.user import User
from app.models.gamification import LeaderboardEntry
from app.schemas.user import UserUpdate
from app.core.config import settings


def get_user(db: Session, user_id: int) -> Optional[User]:
    """Get user by ID with heart regeneration applied."""
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        _regenerate_hearts(db, user)
        _check_daily_xp_reset(db, user)
    return user


def update_user(db: Session, user_id: int, update_data: UserUpdate) -> Optional[User]:
    """Update user profile fields."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None

    update_dict = update_data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(user, key, value)

    db.commit()
    db.refresh(user)
    return user


def deduct_heart(db: Session, user: User) -> int:
    """Deduct one heart. Returns remaining hearts."""
    if user.hearts > 0:
        user.hearts -= 1
        db.commit()
    return user.hearts


def refill_hearts(db: Session, user_id: int) -> Optional[User]:
    """Refill hearts using gems."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None

    if user.gems < settings.HEART_REFILL_COST_GEMS:
        return None  # Not enough gems

    user.gems -= settings.HEART_REFILL_COST_GEMS
    user.hearts = settings.MAX_HEARTS
    user.hearts_updated_at = datetime.utcnow()
    db.commit()
    db.refresh(user)
    return user


def add_xp(db: Session, user: User, xp: int) -> User:
    """Add XP to user, update daily XP, streak, and weekly leaderboard."""
    user.total_xp += xp
    user.daily_xp_earned += xp

    today = date.today()

    # Update streak
    if user.last_activity_date is None:
        user.current_streak = 1
    elif user.last_activity_date == today:
        pass  # Already active today
    elif user.last_activity_date == today - timedelta(days=1):
        user.current_streak += 1
    else:
        user.current_streak = 1  # Streak broken, restart

    user.last_activity_date = today
    user.longest_streak = max(user.longest_streak, user.current_streak)

    if xp > 0:
        _update_weekly_leaderboard_xp(db, user.id, xp)

    db.commit()
    db.refresh(user)
    return user


def _update_weekly_leaderboard_xp(db: Session, user_id: int, xp: int) -> None:
    """Increment the user's weekly XP on the current week's leaderboard."""
    today = date.today()
    week_start = today - timedelta(days=today.weekday())

    entry = (
        db.query(LeaderboardEntry)
        .filter(
            LeaderboardEntry.user_id == user_id,
            LeaderboardEntry.week_start == week_start,
        )
        .first()
    )

    if not entry:
        latest = (
            db.query(LeaderboardEntry)
            .filter(LeaderboardEntry.user_id == user_id)
            .order_by(LeaderboardEntry.week_start.desc())
            .first()
        )
        league = latest.league if latest else "Gold"
        entry = LeaderboardEntry(
            user_id=user_id,
            week_start=week_start,
            weekly_xp=0,
            league=league,
        )
        db.add(entry)

    entry.weekly_xp += xp


def check_and_update_streak(db: Session, user_id: int) -> Optional[User]:
    """Check streak status on login/page load."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None

    today = date.today()
    if user.last_activity_date and user.last_activity_date < today - timedelta(days=1):
        # Streak broken
        user.current_streak = 0
        db.commit()
        db.refresh(user)

    return user


def _regenerate_hearts(db: Session, user: User) -> None:
    """Regenerate hearts based on time elapsed."""
    if user.hearts >= settings.MAX_HEARTS:
        return

    now = datetime.utcnow()
    elapsed = (now - user.hearts_updated_at).total_seconds()
    hearts_to_add = int(elapsed // settings.HEARTS_REGEN_SECONDS)

    if hearts_to_add > 0:
        user.hearts = min(user.hearts + hearts_to_add, settings.MAX_HEARTS)
        user.hearts_updated_at = now
        db.commit()


def _check_daily_xp_reset(db: Session, user: User) -> None:
    """Reset daily XP if it's a new day."""
    today = date.today()
    if user.daily_xp_date != today:
        user.daily_xp_earned = 0
        user.daily_xp_date = today
        db.commit()
