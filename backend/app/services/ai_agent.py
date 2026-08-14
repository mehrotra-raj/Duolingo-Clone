from typing import Optional

from app.db.database import SessionLocal
from app.models.course import Exercise


def generate_hint_for_exercise(db, exercise_id: int) -> Optional[str]:
    """Lightweight hint generator to demonstrate an AI-agent integration.

    This is deterministic and local — suitable for demos where external LLMs
    aren't allowed. It returns a short hint based on the exercise type.
    """
    ex = db.query(Exercise).filter(Exercise.id == exercise_id).first()
    if not ex:
        return None

    if ex.type == "multiple_choice":
        return "Eliminate obviously wrong options; look for cognates."
    if ex.type == "type_answer" or ex.type == "fill_blank":
        # return first word of correct answer as gentle nudge
        parts = (ex.correct_answer or "").split()
        if parts:
            return f"Think about the word: '{parts[0]}'"
        return "Recall similar words from earlier lessons."
    if ex.type == "translate_word_bank":
        return "Rearrange the word bank to match the English order."
    if ex.type == "match_pairs":
        return "Try matching obvious pairs first, then fill the rest."

    return "Try reading the sentence aloud and identifying key words."
