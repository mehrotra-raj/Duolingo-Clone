from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.database import init_db
from app.api import users, courses, lessons, gamification


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Routers
    app.include_router(users.router, prefix=settings.API_V1_PREFIX)
    app.include_router(courses.router, prefix=settings.API_V1_PREFIX)
    app.include_router(lessons.router, prefix=settings.API_V1_PREFIX)
    app.include_router(gamification.router, prefix=settings.API_V1_PREFIX)

    @app.on_event("startup")
    def on_startup():
        init_db()
        # Auto-seed on first deploy so evaluators get a working demo
        import sys
        from pathlib import Path
        backend_root = Path(__file__).resolve().parent.parent
        if str(backend_root) not in sys.path:
            sys.path.insert(0, str(backend_root))
        from seed import seed_if_empty
        seed_if_empty()

    @app.get("/")
    def health():
        return {"status": "ok", "app": settings.PROJECT_NAME}

    return app


app = create_app()
