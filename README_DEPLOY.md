# Deployment guide (quick, free-ish, interview-friendly)

This repo can be deployed quickly with minimal friction and without paying for Render. Recommended combination for no cold starts and free tiers:

- Backend: Fly.io (small VM, low cold-starts)
- Database: Supabase (free Postgres tier)
- Frontend: Vercel (Next.js optimized) or Netlify (static)

High-level steps
1. Push the repo to GitHub.
2. Create a Supabase project and get the `DATABASE_URL` (Postgres).
3. Deploy backend to Fly.io:
   - Install `flyctl` and log in.
   - Run `fly launch` and follow prompts (choose backend/ directory as app).
   - Set environment variables in Fly dashboard: `DATABASE_URL`, `SECRET_KEY`, `ALLOW_DEV_AUTH=false`, `ALGORITHM`, `ACCESS_TOKEN_EXPIRE_MINUTES`.
   - Deploy with `fly deploy`.
   - Fly will build your app using builders (no Dockerfile required).
4. Deploy frontend to Vercel:
   - Connect the `frontend/` folder to Vercel.
   - Set `NEXT_PUBLIC_API_URL` to your backend URL.

Notes
- We updated Alembic to read `DATABASE_URL` from environment variables. The app uses `start.sh` which runs migrations before starting.
- For interviews, run locally and expose via `ngrok` or `localtunnel` if you prefer not to push — but for a persistent public URL, Fly.io + Supabase is recommended.

Commands (summary)
```bash
# local migration + run
cd backend
alembic -c alembic.ini upgrade head
bash start.sh

# deploy (Fly)
flyctl launch --copy-config --path backend
flyctl deploy
```

If you want, I can:
- Create `fly.toml` and a GitHub Actions workflow to auto-deploy to Fly on push to `main`.
- Add a `Procfile` or small `fly` config to simplify deployment.
