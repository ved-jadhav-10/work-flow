from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from config import settings
from database import check_db_connection

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Run startup/shutdown logic."""
    logger.info("🚀 Workflow API starting up…")
    check_db_connection()
    yield
    logger.info("Workflow API shutting down.")


app = FastAPI(
    title="Workflow API",
    description="Persistent AI Context Layer — Backend API",
    version="0.1.0",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.backend_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Health ────────────────────────────────────────────────────────────────────
@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "Workflow API"}


# ── Routers ───────────────────────────────────────────────────────────────────
from routers import auth as auth_router
from routers import projects as projects_router

app.include_router(auth_router.router, prefix="/api/auth", tags=["auth"])
app.include_router(projects_router.router, prefix="/api/projects", tags=["projects"])

# Future phase routers:
# from routers import learning, developer, workflow, chat
