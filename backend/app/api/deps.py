from typing import Optional, Dict, Any

from fastapi import Depends, Header, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.services import user_service
from app.core.config import settings
from app.core.security import decode_access_token


security = HTTPBearer(auto_error=False)


def get_current_user(
    db: Session = Depends(get_db),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    x_user_id: Optional[int] = Header(None),
) :
    """Resolve current user: prefer Bearer token; fallback to X-User-Id (dev).

    Raises 401 on invalid token or missing user.
    """
    user = None
    if credentials and credentials.scheme.lower() == "bearer":
        token = credentials.credentials
        try:
            payload: Dict[str, Any] = decode_access_token(token)
            user_id = int(payload.get("sub"))
            user = user_service.get_user(db, user_id)
            if not user:
                raise HTTPException(status_code=401, detail="Invalid authentication token")
            return user
        except Exception:
            raise HTTPException(status_code=401, detail="Invalid or expired token")

    # Fallback for development/testing: X-User-Id header or default
    user_id = x_user_id or settings.DEFAULT_USER_ID
    user = user_service.get_user(db, int(user_id))
    if not user:
        raise HTTPException(status_code=401, detail="User not authenticated")
    return user
