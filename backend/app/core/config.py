from pydantic_settings import BaseSettings
from pathlib import Path


class Settings(BaseSettings):
    PROJECT_NAME: str = "Duolingo Clone API"
    API_V1_PREFIX: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = f"sqlite:///{Path(__file__).resolve().parent.parent.parent / 'duolingo.db'}"
    
    # CORS — comma-separated in .env, e.g. http://localhost:3000,https://your-app.vercel.app
    CORS_ORIGINS: str = "http://localhost:3000"

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]
    
    # Gamification
    MAX_HEARTS: int = 5
    HEARTS_REGEN_SECONDS: int = 14400  # 4 hours
    XP_PER_LESSON: int = 10
    HEART_REFILL_COST_GEMS: int = 350
    
    # Default user
    DEFAULT_USER_ID: int = 1

    class Config:
        env_file = ".env"


settings = Settings()
