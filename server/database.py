from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config import settings
import logging

logger = logging.getLogger(__name__)

engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,      # Reconnect if connection dropped
    pool_size=5,
    max_overflow=10,
    echo=False,               # Set True to log all SQL
    connect_args={"sslmode": "require"},  # Neon requires SSL
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
        logger.info("✅ Connected to Neon PostgreSQL")
        return True
    except Exception as e:
        logger.warning(
            f"⚠️  Database connection failed: {e}\n"
            "    Check DATABASE_URL format: "
            "postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require\n"
            "    Server will still start — DB calls will fail until this is fixed."
        )
        return False
