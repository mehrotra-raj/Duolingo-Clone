from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class AchievementResponse(BaseModel):
    id: int
    name: str
    description: str
    icon_name: str
    criteria_type: str
    criteria_value: int
    earned: bool = False
    earned_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class LeaderboardEntryResponse(BaseModel):
    rank: int
    user_id: int
    username: str
    display_name: str
    avatar_url: str
    weekly_xp: int
    league: str
    is_current_user: bool = False


class LeaderboardResponse(BaseModel):
    league: str
    entries: list[LeaderboardEntryResponse] = []
    current_user_rank: int = 0
