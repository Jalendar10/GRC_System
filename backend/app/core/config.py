import secrets
from pydantic_settings import BaseSettings
from typing import Optional, List


class Settings(BaseSettings):
    app_name: str = "GRC Engineering Platform"
    app_version: str = "1.0.0"
    debug: bool = True
    environment: str = "development"  # development | staging | production

    # Database - SQLite for dev, PostgreSQL/CockroachDB for prod
    database_url: str = "sqlite:///./grc_platform.db"
    # PostgreSQL: "postgresql://user:pass@localhost/grc"
    # CockroachDB: "cockroachdb://root@localhost:26257/grc?sslmode=disable"

    # ChromaDB
    chroma_host: str = "localhost"
    chroma_port: int = 8001
    chroma_persist_dir: str = "./chroma_data"

    # Anthropic Claude
    anthropic_api_key: Optional[str] = None

    # Auth — ALWAYS override SECRET_KEY via env var in production
    secret_key: str = secrets.token_urlsafe(32)   # auto-generated fallback (dev only)
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 480         # 8 hours
    refresh_token_expire_days: int = 30

    # CORS — comma-separated list of allowed origins
    cors_origins_str: str = "http://localhost:3000,http://localhost:3001,http://localhost:5173"

    @property
    def cors_origins(self) -> List[str]:
        return [o.strip() for o in self.cors_origins_str.split(",") if o.strip()]

    # Organization
    org_name: str = "Acme Bank Corp"
    org_type: str = "financial_services"

    class Config:
        env_file = ".env"
        # Allow extra env vars without crashing
        extra = "ignore"


settings = Settings()
