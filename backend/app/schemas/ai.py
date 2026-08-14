from pydantic import BaseModel


class HintRequest(BaseModel):
    exercise_id: int


class HintResponse(BaseModel):
    hint: str
