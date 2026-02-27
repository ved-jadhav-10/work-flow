from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path

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

    # Supabase
    supabase_url: str
    supabase_anon_key: str
    supabase_service_role_key: str
    supabase_db_url: str

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


settings = Settings()
