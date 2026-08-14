from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.services.ai_agent import generate_hint_for_exercise
from app.schemas.ai import HintRequest, HintResponse
from app.api.deps import get_current_user

router = APIRouter(tags=["ai"])


@router.post("/hint", response_model=HintResponse)
def hint(body: HintRequest, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    hint_text = generate_hint_for_exercise(db, body.exercise_id)
    if hint_text is None:
        raise HTTPException(status_code=404, detail="Exercise not found")
    return HintResponse(hint=hint_text)
