# Deploying backend to Fly.io (step-by-step)

This guide automates what you need to deploy the `backend/` service to Fly.io and attach a managed Postgres instance. It assumes you have `flyctl` installed.

High level
- Build the Fly app using buildpacks (no Dockerfile required).
- Provision a managed Postgres on Fly and attach it to your app.
- Set necessary environment variables via `fly secrets set` or the Fly dashboard.

Commands
```bash
# 1) Install and login
curl -L https://fly.io/install.sh | sh
flyctl auth login

# 2) Create an app (select region when prompted) and set path to backend
cd /path/to/DUOLINGO
flyctl launch --name duolingo-backend --region iad --path backend --no-deploy

# 3) Create a managed Postgres database
flyctl postgres create --name duolingo-db --region iad

# 4) Attach the Postgres DB to your app
flyctl postgres attach --postgres-app duolingo-db --app duolingo-backend

# 5) Set secrets (SECRET_KEY and other runtime config)
flyctl secrets set SECRET_KEY=$(openssl rand -hex 32) ALLOW_DEV_AUTH=false ALGORITHM=HS256 ACCESS_TOKEN_EXPIRE_MINUTES=10080

# 6) Deploy
flyctl deploy --app duolingo-backend --path backend

# 7) Open the app
flyctl open --app duolingo-backend
```

Notes and details for any AI or engineer
- Repo structure: backend/ (FastAPI), frontend/ (Next.js). Backend uses `app.main:create_app()` and `start.sh` runs Alembic migrations then starts Uvicorn.
- Migrations: Alembic config `backend/alembic.ini` points to a default SQLite DB but `backend/alembic/env.py` now reads `DATABASE_URL` from the environment.
- DB: Fly-managed Postgres will provide the `DATABASE_URL` env var automatically when attached. The backend `app/db/database.py` only sets SQLite-specific `connect_args` when the URL starts with `sqlite`, so Postgres is supported out of the box.
- Start command: we use `bash start.sh` which runs `alembic -c alembic.ini upgrade head` then `uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}`.
- Health: root endpoint `/` returns a simple health JSON. Consider adding `/health` if you want a dedicated probe.
- Seeds: do not run `seed.py` automatically in production; run via `flyctl ssh console` or `flyctl run` / `flyctl ssh` one-off.

Troubleshooting
- If migrations fail, check `flyctl logs` for stack traces and confirm `DATABASE_URL` is set.
- If the app cannot connect to Postgres, ensure the DB is in the same region or network and that the Postgres role/password are correct (Fly handles this when attaching).

If you want, I can add a GitHub Actions workflow to auto-deploy to Fly on push to `main`.
