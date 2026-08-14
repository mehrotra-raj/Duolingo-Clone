export interface User {
  id: number;
  username: string;
  display_name: string;
  avatar_url: string;
  total_xp: number;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  hearts: number;
  max_hearts: number;
  hearts_updated_at: string | null;
  gems: number;
  daily_xp_goal: number;
  daily_xp_earned: number;
  daily_xp_date: string | null;
  created_at: string | null;
}

export interface Course {
  id: number;
  language_name: string;
  language_code: string;
  from_language: string;
  flag_emoji: string;
  description: string;
}

export interface SkillProgress {
  lessons_completed: number;
  crown_level: number;
  is_unlocked: boolean;
  total_lessons: number;
}

export interface Skill {
  id: number;
  order_index: number;
  title: string;
  icon_name: string;
  total_lessons: number;
  progress: SkillProgress | null;
}

export interface Unit {
  id: number;
  order_index: number;
  title: string;
  description: string;
  color: string;
  skills: Skill[];
}

export interface LearningPath {
  course: Course;
  units: Unit[];
}

export interface Exercise {
  id: number;
  order_index: number;
  type: 'multiple_choice' | 'translate_word_bank' | 'match_pairs' | 'fill_blank' | 'type_answer';
  prompt: string;
  options?: string[];
  word_bank?: string[];
  match_pairs?: { left: string; right: string }[];
  sentence_with_blank?: string;
  hint?: string;
}

export interface Lesson {
  id: number;
  skill_id: number;
  order_index: number;
  xp_reward: number;
  exercises: Exercise[];
}

export interface CheckAnswerResponse {
  correct: boolean;
  correct_answer: string;
  message: string;
  hearts_remaining: number;
}

export interface LessonCompleteResponse {
  xp_earned: number;
  total_xp: number;
  hearts_remaining: number;
  streak: number;
  skill_progress: SkillProgress;
  achievements_earned: string[];
}

export interface Achievement {
  id: number;
  name: string;
  description: string;
  icon_name: string;
  criteria_type: string;
  criteria_value: number;
  earned: boolean;
  earned_at: string | null;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: number;
  username: string;
  display_name: string;
  avatar_url: string;
  weekly_xp: number;
  league: string;
  is_current_user: boolean;
}

export interface Leaderboard {
  league: string;
  entries: LeaderboardEntry[];
  current_user_rank: number;
}
