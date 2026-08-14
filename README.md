# Duolingo Clone

A full-stack Duolingo clone — Spanish course, gamified lessons, XP/streaks/hearts.

## Live Demo
- **GitHub:** https://github.com/mehrotra-raj/Duolingo-Clone
- **Frontend:** _(add your Vercel URL after deploy)_
- **Backend API:** _(add your Railway/Render URL after deploy)_

## Stack
| Layer | Tech |
|-------|------|
| Frontend | Next.js 16, TypeScript, App Router, Vanilla CSS |
| Backend | FastAPI, SQLAlchemy, Pydantic |
| Database | SQLite |
| Font | Nunito (Google Fonts) |

## Quick Start (Local)

### 1. Backend
```bash
cd backend
chmod +x run.sh    # first time only
./run.sh
```
Creates venv, installs deps, seeds DB on first run → **http://localhost:8000**

### 2. Frontend
```bash
cd frontend
chmod +x run.sh    # first time only
./run.sh
```

Open **http://localhost:3000**

> Run backend from `backend/` (or use `./run.sh`). Running `uvicorn` from the project root causes `ModuleNotFoundError: No module named 'app'`.

## Environment Variables

| Variable | Where | Default | Purpose |
|----------|-------|---------|---------|
| `NEXT_PUBLIC_API_URL` | frontend | `http://localhost:8000/api/v1` | Backend API base URL |
| `CORS_ORIGINS` | backend | `http://localhost:3000` | Comma-separated allowed frontend URLs |
| `DEFAULT_USER_ID` | backend | `1` | Demo learner (simplified auth) |
| `PORT` | backend | `8000` | Server port (set by host in production) |

## Architecture

```
┌─────────────────┐         REST/JSON          ┌─────────────────┐
│  Next.js        │  ◄──────────────────────►  │  FastAPI        │
│  (frontend/)    │   /api/v1/*                │  (backend/)     │
│                 │                            │                 │
│  Pages:         │                            │  api/ → routes  │
│  /, /lesson,    │                            │  services/ → logic│
│  /profile, etc. │                            │  models/ → ORM  │
└─────────────────┘                            └────────┬────────┘
                                                        │
                                               ┌────────▼────────┐
                                               │  SQLite (duolingo.db) │
                                               └─────────────────┘
```

**Request flow (lesson):**
1. User clicks skill → `GET /skills/{id}/next-lesson`
2. Lesson loads → `GET /lessons/{id}` (exercises, no answers)
3. Each answer → `POST /exercises/{id}/check` (deducts a heart server-side on wrong answers)
4. Wrong match-pair tap → `POST /users/me/deduct-heart`
5. Lesson finish → `POST /lessons/{id}/complete` (XP, progress, achievements; blocked if out of hearts)

## Database Schema

```
Course 1──* Unit 1──* Skill 1──* Lesson 1──* Exercise
  │
  └──* UserCourseProgress

User 1──* UserSkillProgress ──* Skill
  ├──* UserLessonProgress ──* Lesson
  ├──* UserAchievement ──* Achievement
  └──* LeaderboardEntry
```

### Key tables

| Table | Purpose |
|-------|---------|
| `users` | Learner profile: XP, streak, hearts, gems, daily goal |
| `courses` → `units` → `skills` → `lessons` → `exercises` | Course content hierarchy |
| `user_skill_progress` | Per-skill unlock, lessons completed, crown level |
| `user_lesson_progress` | Completed lessons + XP earned |
| `achievements` / `user_achievements` | Badge definitions + earned state |
| `leaderboard_entries` | Weekly XP per user per league |

### Exercise types
`multiple_choice`, `translate_word_bank`, `fill_blank`, `type_answer`, `match_pairs`

## API Overview

Base URL: `http://localhost:8000/api/v1`  
Interactive docs: `http://localhost:8000/docs`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/me` | Current user (hearts regen applied) |
| PATCH | `/users/me` | Update display name, daily XP goal |
| POST | `/users/me/refill-hearts` | Spend 350 gems to refill hearts |
| POST | `/users/me/deduct-heart` | Deduct one heart (e.g. wrong match-pair) |
| GET | `/courses` | List courses |
| GET | `/courses/{id}/path` | Learning path with unlock/progress |
| GET | `/skills/{id}/next-lesson` | Next incomplete lesson for skill |
| GET | `/lessons/{id}` | Lesson + exercises (no correct answers) |
| POST | `/lessons/{id}/complete` | Complete lesson, award XP, update progress |
| POST | `/exercises/{id}/check` | Check a single answer |
| GET | `/leaderboard` | Weekly league leaderboard |
| GET | `/achievements` | All achievements + earned status |
| POST | `/streak/check` | Reset streak if day was missed |

**Auth:** Simplified — all routes use `DEFAULT_USER_ID=1` (no login required).

## Course Content (Seeded)
- **1 language:** Spanish from English
- **3 units:** Basics, Travel, Daily Life
- **9 skills**, **27 lessons**, **~135 exercises**
- **6 demo users** on leaderboard
- Default learner (`id=1`) has Unit 1 complete, Unit 2 in progress

## Deployment

### Backend (Railway or Render)
1. Create new project, connect GitHub repo, set root to `backend/`
2. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
3. Add env var: `CORS_ORIGINS=https://your-app.vercel.app`
4. Run seed once via shell: `python seed.py`
5. Note the public URL (e.g. `https://your-api.railway.app`)

### Frontend (Vercel)
1. Import repo, set root to `frontend/`
2. Add env var: `NEXT_PUBLIC_API_URL=https://your-api.railway.app/api/v1`
3. Deploy

### After deploy
Update the Live Demo links at the top of this README.

## Assumptions
- Single demo user (`learner`, id=1) — no real authentication
- One language course (Spanish) — sufficient per assignment brief
- Audio/speech exercises not implemented (optional per brief)
- Shop: heart refill works; other items are "Coming soon" placeholders
- Hearts are deducted on the server when an answer is wrong (`/exercises/{id}/check`) or a match-pair is incorrect (`/users/me/deduct-heart`)
- Lesson completion is rejected if the learner has zero hearts
- SQLite is fine for demo; production would use PostgreSQL

## Implementation Plan
See [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) for the staged development roadmap.
