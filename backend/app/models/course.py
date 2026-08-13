from sqlalchemy import Column, Integer, String, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship

from app.db.database import Base


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    language_name = Column(String, nullable=False)
    language_code = Column(String, nullable=False)
    from_language = Column(String, default="English")
    flag_emoji = Column(String, default="🇪🇸")
    description = Column(Text, default="")

    # Relationships
    units = relationship("Unit", back_populates="course", order_by="Unit.order_index")
    enrollments = relationship("UserCourseProgress", back_populates="course")


class Unit(Base):
    __tablename__ = "units"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    order_index = Column(Integer, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, default="")
    color = Column(String, default="#58CC02")  # Duolingo green default

    # Relationships
    course = relationship("Course", back_populates="units")
    skills = relationship("Skill", back_populates="unit", order_by="Skill.order_index")


class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    unit_id = Column(Integer, ForeignKey("units.id"), nullable=False)
    order_index = Column(Integer, nullable=False)
    title = Column(String, nullable=False)
    icon_name = Column(String, default="star")
    total_lessons = Column(Integer, default=3)

    # Relationships
    unit = relationship("Unit", back_populates="skills")
    lessons = relationship("Lesson", back_populates="skill", order_by="Lesson.order_index")
    user_progress = relationship("UserSkillProgress", back_populates="skill")


class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False)
    order_index = Column(Integer, nullable=False)
    xp_reward = Column(Integer, default=10)

    # Relationships
    skill = relationship("Skill", back_populates="lessons")
    exercises = relationship("Exercise", back_populates="lesson", order_by="Exercise.order_index")
    user_progress = relationship("UserLessonProgress", back_populates="lesson")


class Exercise(Base):
    __tablename__ = "exercises"

    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False)
    order_index = Column(Integer, nullable=False)
    type = Column(String, nullable=False)  # multiple_choice, translate_word_bank, match_pairs, fill_blank, type_answer
    prompt = Column(Text, nullable=False)
    correct_answer = Column(String, nullable=False)
    options = Column(JSON, nullable=True)          # For multiple_choice: ["opt1", "opt2", ...]
    word_bank = Column(JSON, nullable=True)         # For word_bank: ["word1", "word2", ...]
    match_pairs = Column(JSON, nullable=True)       # For match_pairs: [{"left": "Hello", "right": "Hola"}, ...]
    sentence_with_blank = Column(Text, nullable=True)  # For fill_blank: "_____ noches"
    hint = Column(String, nullable=True)

    # Relationships
    lesson = relationship("Lesson", back_populates="exercises")
