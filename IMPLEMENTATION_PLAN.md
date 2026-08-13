# Implementation Plan — Campus Drive Threshold (~72–78/100)

**Goal:** Pass submission screening + be explainable in interview.  
**Not in scope:** Auth, dark mode, audio, pixel-perfect UI, crown levels 2–5, full gem economy.

---

## Module 1 — Foundation & Configuration ✅
**Target score lift:** +4

| Task | Done |
|------|------|
| Frontend API URL from env | ✅ |
| Backend CORS from env | ✅ |
| Root `.gitignore` | ✅ |
| Env example files | ✅ |
| README env pointer | ✅ |

---

## Module 2 — Core State Sync (Hearts & Lesson Flow) ✅
**Target score lift:** +6

| Task | Done |
|------|------|
| Lesson hearts from API | ✅ |
| Block lesson at 0 hearts | ✅ |
| Use completeLesson response | ✅ |
| Refresh home after lesson | ✅ |
| checkStreak on app load | ✅ |

---

## Module 3 — Wire Stub Pages (Settings & Shop) ✅
**Target score lift:** +5

| Task | Done |
|------|------|
| Settings: load + save via PATCH /users/me | ✅ |
| Shop: real gem balance | ✅ |
| Shop: heart refill wired | ✅ |
| Other shop items → "Coming soon" | ✅ |

---

## Module 4 — Backend Gamification Fixes ✅
**Target score lift:** +4

| Task | Done |
|------|------|
| Leaderboard weekly_xp updates on XP gain | ✅ |
| No repeat XP on re-completed lessons | ✅ |
| Match pairs calls checkAnswer | ✅ |

---

## Module 5 — Documentation & Deployment ⚠️ (your action)
**Target score lift:** +8

| Task | Done |
|------|------|
| Full README (architecture, schema, API, assumptions) | ✅ |
| Backend Procfile for Railway/Render | ✅ |
| Public GitHub repo | ☐ **You do this** |
| Deploy backend | ☐ **You do this** |
| Deploy frontend on Vercel | ☐ **You do this** |
| Add live demo links to README | ☐ **After deploy** |

See README → **Deployment** section for step-by-step.

---

## Module 6 — Mobile Bottom Nav ✅
**Target score lift:** +2

| Task | Done |
|------|------|
| Bottom nav (Learn, League, Profile) | ✅ |
| Hidden on lesson pages | ✅ |

---

## Expected score

| Stage | Approx score |
|-------|--------------|
| Before modules | 58 |
| After Modules 1–4 + 6 (code) | ~77 |
| After Module 5 deploy + GitHub | ~85 (submission-ready) |

---

## Study checklist (before interview)

- [ ] Request flow: skill → lesson → check → complete
- [ ] DB: Course → Unit → Skill → Lesson → Exercise
- [ ] Streak logic in `user_service.add_xp`
- [ ] Unlock logic in `lesson_service._unlock_next_skill`
- [ ] Why `DEFAULT_USER_ID = 1`
- [ ] Bug you fixed: hearts desync
- [ ] Env vars: `NEXT_PUBLIC_API_URL`, `CORS_ORIGINS`
