import type {
  User, LearningPath, Lesson,
  CheckAnswerResponse, LessonCompleteResponse,
  Achievement, Leaderboard,
} from './types';

const BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? 'http://localhost:8000/api/v1';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ── User ──────────────────────────────────────────────────────────────────────
export const fetchUser = (): Promise<User> => request('/users/me');

export const updateUser = (data: Partial<Pick<User, 'display_name' | 'daily_xp_goal'>>): Promise<User> =>
  request('/users/me', { method: 'PATCH', body: JSON.stringify(data) });

export const refillHearts = (): Promise<User> =>
  request('/users/me/refill-hearts', { method: 'POST' });

export const deductHeart = (): Promise<User> =>
  request('/users/me/deduct-heart', { method: 'POST' });

// ── Learning Path ─────────────────────────────────────────────────────────────
export const fetchLearningPath = (courseId = 1): Promise<LearningPath> =>
  request(`/courses/${courseId}/path`);

// ── Lessons & Exercises ───────────────────────────────────────────────────────
export const fetchNextLesson = (skillId: number): Promise<Lesson> =>
  request(`/skills/${skillId}/next-lesson`);

export const fetchLesson = (lessonId: number): Promise<Lesson> =>
  request(`/lessons/${lessonId}`);

export const checkAnswer = (
  exerciseId: number,
  answer: string,
): Promise<CheckAnswerResponse> =>
  request(`/exercises/${exerciseId}/check`, {
    method: 'POST',
    body: JSON.stringify({ answer }),
  });

export const completeLesson = (
  lessonId: number,
  payload: { correct_answers: number; total_exercises: number },
): Promise<LessonCompleteResponse> =>
  request(`/lessons/${lessonId}/complete`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

// ── Gamification ──────────────────────────────────────────────────────────────
export const fetchLeaderboard = (): Promise<Leaderboard> => request('/leaderboard');
export const fetchAchievements = (): Promise<Achievement[]> => request('/achievements');
export const checkStreak = (): Promise<User> =>
  request('/streak/check', { method: 'POST' });
