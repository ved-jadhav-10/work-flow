from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
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


# ── File download proxy (Appwrite Storage) ───────────────────────────────────
from fastapi import Depends
from middleware.auth import get_current_user
from services import file_storage


@app.get("/api/files/{file_id}/download")
async def download_file(file_id: str, current_user=Depends(get_current_user)):
    """Proxy file downloads from Appwrite Storage — keeps API key server-side."""
    try:
        meta = await file_storage.get_file_metadata(file_id)
        content = await file_storage.download_file(file_id)
        return Response(
            content=content,
            media_type=meta.get("mimeType", "application/octet-stream"),
            headers={
                "Content-Disposition": f'attachment; filename="{meta.get("name", file_id)}"',
            },
        )
    except Exception as exc:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail=f"File not found: {exc}")


# ── Routers ───────────────────────────────────────────────────────────────────
from routers import auth as auth_router
from routers import projects as projects_router
from routers import learning as learning_router
from routers import developer as developer_router

app.include_router(auth_router.router, prefix="/api/auth", tags=["auth"])
app.include_router(projects_router.router, prefix="/api/projects", tags=["projects"])
app.include_router(
    learning_router.router,
    prefix="/api/projects/{project_id}/documents",
    tags=["learning"],
)
app.include_router(
    developer_router.router,
    prefix="/api/projects/{project_id}/code",
    tags=["developer"],
)

# Future phase routers:
# from routers import workflow, chat
