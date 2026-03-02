"""
File storage via Appwrite Storage.

Uploads/deletes files in the 'documents' bucket on Appwrite Cloud.
Downloads are proxied through the backend to keep the API key server-side.
"""

from __future__ import annotations

import io
import logging
import uuid
from pathlib import PurePosixPath

from appwrite.client import Client
from appwrite.services.storage import Storage
from appwrite.input_file import InputFile
from appwrite.id import ID

from config import settings

logger = logging.getLogger(__name__)

_client: Client | None = None
_storage: Storage | None = None


def _get_storage() -> Storage:
    """Lazy-init and return the Appwrite Storage service."""
    global _client, _storage
    if _storage is None:
        _client = Client()
        _client.set_endpoint(settings.appwrite_endpoint)
        _client.set_project(settings.appwrite_project_id)
        _client.set_key(settings.appwrite_api_key)
        _storage = Storage(_client)
    return _storage


# ── Upload ────────────────────────────────────────────────────────────────────

async def upload_file(file_bytes: bytes, filename: str, project_id: str) -> str:
    """
    Upload a file to Appwrite Storage.
    Returns the Appwrite **file ID** — use get_file_download() or the proxy
    endpoint to retrieve the file content.
    """
    storage = _get_storage()
    safe_name = PurePosixPath(filename).name  # strip directory parts
    file_id = f"{project_id[:8]}-{uuid.uuid4().hex[:8]}"

    input_file = InputFile.from_bytes(
        file_bytes,
        file_id + "_" + safe_name,
        _guess_content_type(filename),
    )

    storage.create_file(
        bucket_id=settings.appwrite_bucket_id,
        file_id=file_id,
        file=input_file,
    )

    logger.info("Uploaded %s → appwrite bucket %s / %s", filename, settings.appwrite_bucket_id, file_id)
    return file_id


# ── Download (bytes) ──────────────────────────────────────────────────────────

async def download_file(file_id: str) -> bytes:
    """Download file content from Appwrite Storage. Returns raw bytes."""
    storage = _get_storage()
    result = storage.get_file_download(
        bucket_id=settings.appwrite_bucket_id,
        file_id=file_id,
    )
    return result


# ── File metadata ─────────────────────────────────────────────────────────────

async def get_file_metadata(file_id: str) -> dict:
    """Get file metadata (name, size, mimeType, etc.) from Appwrite."""
    storage = _get_storage()
    return storage.get_file(
        bucket_id=settings.appwrite_bucket_id,
        file_id=file_id,
    )


# ── Delete ────────────────────────────────────────────────────────────────────

async def delete_file(file_id: str) -> None:
    """Delete a file from Appwrite Storage given its file ID."""
    storage = _get_storage()
    storage.delete_file(
        bucket_id=settings.appwrite_bucket_id,
        file_id=file_id,
    )
    logger.info("Deleted file %s from Appwrite", file_id)


# ── Helpers ───────────────────────────────────────────────────────────────────

def _guess_content_type(filename: str) -> str:
    ext = PurePosixPath(filename).suffix.lower()
    return {
        ".pdf": "application/pdf",
        ".txt": "text/plain",
        ".md": "text/markdown",
        ".csv": "text/csv",
    }.get(ext, "application/octet-stream")
