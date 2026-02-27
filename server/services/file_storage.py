"""
File storage via Supabase Storage.

Uploads/deletes files in the private 'documents' bucket.
Uses signed URLs for secure time-limited access.
"""

from __future__ import annotations

import logging
import uuid
from pathlib import PurePosixPath

from supabase import create_client, Client

from config import settings

logger = logging.getLogger(__name__)

BUCKET = "documents"
SIGNED_URL_EXPIRY = 60 * 60  # 1 hour in seconds

_client: Client | None = None


def _get_supabase() -> Client:
    global _client
    if _client is None:
        _client = create_client(settings.supabase_url, settings.supabase_service_role_key)
    return _client


# ── Upload ────────────────────────────────────────────────────────────────────

async def upload_file(file_bytes: bytes, filename: str, project_id: str) -> str:
    """
    Upload a file to Supabase Storage under `documents/<project_id>/<uuid>_<filename>`.
    Returns the **storage path** (not a URL) — use get_signed_url() to generate
    a time-limited download link when needed.
    """
    sb = _get_supabase()
    safe_name = PurePosixPath(filename).name  # strip directory parts
    storage_path = f"{project_id}/{uuid.uuid4().hex[:8]}_{safe_name}"

    sb.storage.from_(BUCKET).upload(
        path=storage_path,
        file=file_bytes,
        file_options={"content-type": _guess_content_type(filename)},
    )

    logger.info("Uploaded %s → %s/%s", filename, BUCKET, storage_path)
    return storage_path


# ── Signed URL ────────────────────────────────────────────────────────────────

async def get_signed_url(storage_path: str, expires_in: int = SIGNED_URL_EXPIRY) -> str:
    """Generate a time-limited signed URL for a private file."""
    sb = _get_supabase()
    result = sb.storage.from_(BUCKET).create_signed_url(storage_path, expires_in)
    return result["signedURL"]


# ── Delete ────────────────────────────────────────────────────────────────────

async def delete_file(storage_path: str) -> None:
    """Delete a file from Supabase Storage given its storage path."""
    sb = _get_supabase()
    sb.storage.from_(BUCKET).remove([storage_path])
    logger.info("Deleted %s", storage_path)


# ── Helpers ───────────────────────────────────────────────────────────────────

def _guess_content_type(filename: str) -> str:
    ext = PurePosixPath(filename).suffix.lower()
    return {
        ".pdf": "application/pdf",
        ".txt": "text/plain",
        ".md": "text/markdown",
        ".csv": "text/csv",
    }.get(ext, "application/octet-stream")
