from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.user import UserResponse, UserUpdate
from app.services import user_service
from app.core.config import settings
from fastapi import Depends
from app.api.deps import get_current_user
from app.schemas.auth import Token, LoginRequest
from app.core.security import create_access_token
from datetime import timedelta
from app.models.user import User

router = APIRouter(prefix="/users", tags=["users"])


@router.post('/auth/login', response_model=Token)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    """Simple login that issues a JWT for a valid username. Passwords are omitted
    for the assignment; this is a convenience dev flow.
    """
    user = db.query(User).filter(User.username == req.username).first()
    if not user:
        raise HTTPException(status_code=401, detail='Invalid username or password')

    from app.core.security import verify_password

    if not verify_password(req.password, user.password_hash or ""):
        raise HTTPException(status_code=401, detail='Invalid username or password')

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token = create_access_token({"sub": str(user.id)}, expires_delta=access_token_expires)
    return Token(access_token=token)


@router.get("/me", response_model=UserResponse)
def read_me(current_user=Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=UserResponse)
def update_me(
    update_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    user = user_service.update_user(db, current_user.id, update_data)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.post("/me/refill-hearts", response_model=UserResponse)
def refill_hearts(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    user = user_service.refill_hearts(db, current_user.id)
    if not user:
        raise HTTPException(
            status_code=400,
            detail=f"Not enough gems. Refill costs {settings.HEART_REFILL_COST_GEMS} gems.",
        )
    return user


@router.post("/me/deduct-heart", response_model=UserResponse)
def deduct_heart(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Deduct one heart (e.g. wrong match-pair attempt). Idempotent at zero."""
    user = user_service.get_user(db, current_user.id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user_service.deduct_heart(db, user)
    db.refresh(user)
    return user
