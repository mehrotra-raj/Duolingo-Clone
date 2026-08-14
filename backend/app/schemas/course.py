from pydantic import BaseModel
from typing import Optional


class CourseResponse(BaseModel):
    id: int
    language_name: str
    language_code: str
    from_language: str
    flag_emoji: str
    description: str

    class Config:
        from_attributes = True


class ExerciseResponse(BaseModel):
    id: int
    order_index: int
    type: str
    prompt: str
    correct_answer: str  # Will be excluded in some contexts
    options: Optional[list] = None
    word_bank: Optional[list] = None
    match_pairs: Optional[list] = None
    sentence_with_blank: Optional[str] = None
    hint: Optional[str] = None

    class Config:
        from_attributes = True


class ExercisePublicResponse(BaseModel):
    """Exercise response without the correct answer (sent to frontend during lessons)."""
    id: int
    order_index: int
    type: str
    prompt: str
    options: Optional[list] = None
    word_bank: Optional[list] = None
    match_pairs: Optional[list] = None
    sentence_with_blank: Optional[str] = None
    hint: Optional[str] = None

    class Config:
        from_attributes = True


class LessonResponse(BaseModel):
    id: int
    skill_id: int
    order_index: int
    xp_reward: int
    exercises: list[ExercisePublicResponse] = []

    class Config:
        from_attributes = True


class SkillProgressResponse(BaseModel):
    lessons_completed: int
    crown_level: int
    is_unlocked: bool
    total_lessons: int


class SkillPathResponse(BaseModel):
    id: int
    order_index: int
    title: str
    icon_name: str
    total_lessons: int
    progress: Optional[SkillProgressResponse] = None

    class Config:
        from_attributes = True


class UnitPathResponse(BaseModel):
    id: int
    order_index: int
    title: str
    description: str
    color: str
    skills: list[SkillPathResponse] = []

    class Config:
        from_attributes = True


class LearningPathResponse(BaseModel):
    course: CourseResponse
    units: list[UnitPathResponse] = []


class CheckAnswerRequest(BaseModel):
    answer: str


class CheckAnswerResponse(BaseModel):
    correct: bool
    correct_answer: str
    message: str
    hearts_remaining: int


class LessonCompleteRequest(BaseModel):
    correct_answers: int = 0
    total_exercises: int = 0


class LessonCompleteResponse(BaseModel):
    xp_earned: int
    total_xp: int
    hearts_remaining: int
    streak: int
    skill_progress: SkillProgressResponse
    achievements_earned: list[str] = []
