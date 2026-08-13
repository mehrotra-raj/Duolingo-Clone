from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date


class UserResponse(BaseModel):
    id: int
    username: str
    display_name: str
    avatar_url: str
    total_xp: int
    current_streak: int
    longest_streak: int
    last_activity_date: Optional[date] = None
    hearts: int
    max_hearts: int
    hearts_updated_at: Optional[datetime] = None
    gems: int
    daily_xp_goal: int
    daily_xp_earned: int
    daily_xp_date: Optional[date] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    display_name: Optional[str] = None
    daily_xp_goal: Optional[int] = None
    avatar_url: Optional[str] = None
