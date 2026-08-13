from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.user import UserResponse, UserUpdate
from app.services import user_service
from app.core.config import settings

router = APIRouter(prefix="/users", tags=["users"])


def get_current_user_id() -> int:
    """Returns the hardcoded default user ID (simplified auth)."""
    return settings.DEFAULT_USER_ID


@router.get("/me", response_model=UserResponse)
def read_me(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    user = user_service.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.patch("/me", response_model=UserResponse)
def update_me(
    update_data: UserUpdate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    user = user_service.update_user(db, user_id, update_data)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.post("/me/refill-hearts", response_model=UserResponse)
def refill_hearts(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    user = user_service.refill_hearts(db, user_id)
    if not user:
        raise HTTPException(
            status_code=400,
            detail=f"Not enough gems. Refill costs {settings.HEART_REFILL_COST_GEMS} gems.",
        )
    return user
