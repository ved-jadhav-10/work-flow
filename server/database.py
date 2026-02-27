from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config import settings
import logging

logger = logging.getLogger(__name__)

engine = create_engine(
    settings.supabase_db_url,
    pool_pre_ping=True,      # Reconnect if connection dropped
    pool_size=5,
    max_overflow=10,
    echo=False,               # Set True to log all SQL
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Dependency — yields a DB session and closes it after the request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_db_connection() -> bool:
    """Verify DB is reachable. Called on startup."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        logger.info("✅ Connected to Supabase PostgreSQL")
        return True
    except Exception as e:
        logger.warning(
            f"⚠️  Database connection failed: {e}\n"
            "    Check SUPABASE_DB_URL format: "
            "postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres\n"
            "    Server will still start — DB calls will fail until this is fixed."
        )
        return False
