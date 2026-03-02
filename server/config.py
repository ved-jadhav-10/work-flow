from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
from pathlib import Path
import json

# Try server/.env first, then fall back to root .env
_env_file = Path(__file__).parent / ".env"
if not _env_file.exists():
    _env_file = Path(__file__).parent.parent / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(_env_file),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Database (Neon PostgreSQL)
    database_url: str

    # Appwrite (File Storage)
    appwrite_endpoint: str = "https://cloud.appwrite.io/v1"
    appwrite_project_id: str
    appwrite_api_key: str
    appwrite_bucket_id: str

    # AI providers
    gemini_api_key: str
    groq_api_key: str

    # Auth
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24 * 7  # 7 days

    # Ollama (optional)
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "phi3:mini"

    # CORS
    backend_cors_origins: list[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
    ]

    @field_validator("backend_cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: object) -> list[str]:
        if isinstance(v, list):
            return v
        if isinstance(v, str):
            v = v.strip()
            # JSON array: ["https://...","https://..."]
            if v.startswith("["):
                return json.loads(v)
            # Comma-separated: https://a.com,https://b.com
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v


settings = Settings()
