from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.gamification import LeaderboardResponse, AchievementResponse
from app.services import gamification_service
from app.services import user_service
from app.schemas.user import UserResponse
from app.core.config import settings
from fastapi import Depends
from app.api.deps import get_current_user

router = APIRouter(tags=["gamification"])


@router.get("/leaderboard", response_model=LeaderboardResponse)
def get_leaderboard(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return gamification_service.get_leaderboard(db, current_user.id)


@router.get("/achievements", response_model=list[AchievementResponse])
def get_achievements(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return gamification_service.get_achievements(db, current_user.id)


@router.post("/streak/check", response_model=UserResponse)
def check_streak(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    user = user_service.check_and_update_streak(db, current_user.id)
    return user
