"""Learning-module router — document upload, summaries, concepts, steps.

All endpoints are scoped to a project and require auth.
Prefix: /api/projects/{project_id}/documents
"""

from __future__ import annotations

import logging
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session

from database import get_db
from middleware.auth import get_current_user
from models.user import User
from models.project import Project
from models.document import Document
from models.embedding import Embedding
from schemas.learning import (
    DocumentResponse,
    DocumentListResponse,
    SummarizeRequest,
    SummaryResponse,
    ConceptsResponse,
    StepsResponse,
)
from services import pdf_service, file_storage, embedding_service, learning_service

logger = logging.getLogger(__name__)

router = APIRouter()

ALLOWED_EXTENSIONS = {".pdf", ".txt", ".md"}
MAX_FILE_SIZE = 20 * 1024 * 1024  # 20 MB


# ── Helpers ───────────────────────────────────────────────────────────────────

def _get_project_or_403(project_id: str, user: User, db: Session) -> Project:
    """Ensure the project exists and belongs to the current user."""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == user.id,
    ).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project


def _get_document_or_404(doc_id: str, project_id: str, db: Session) -> Document:
    doc = db.query(Document).filter(
        Document.id == doc_id,
        Document.project_id == project_id,
    ).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    return doc


def _ext(filename: str) -> str:
    import os
    return os.path.splitext(filename)[1].lower()


# ── POST /upload ──────────────────────────────────────────────────────────────

@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    project_id: str,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Upload a file, extract text, generate embeddings, and store everything."""
    project = _get_project_or_403(project_id, current_user, db)

    # Validate extension
    ext = _ext(file.filename or "file.bin")
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type '{ext}'. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File exceeds 20 MB limit",
        )

    # 1. Extract text
    if ext == ".pdf":
        raw_text = await pdf_service.extract_text(file_bytes, file.filename)
    else:
        raw_text = file_bytes.decode("utf-8", errors="replace")

    # 2. Upload to Supabase Storage
    storage_path = await file_storage.upload_file(file_bytes, file.filename, str(project.id))

    # 3. Create DB record
    doc = Document(
        project_id=project.id,
        filename=file.filename,
        file_url=storage_path,  # storage path, not URL
        doc_type=ext.lstrip("."),
        raw_text=raw_text,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    # 4. Chunk text and generate embeddings (background-ish — still awaited here)
    try:
        chunks = await pdf_service.chunk_text(raw_text, chunk_size=500, overlap=50)
        if chunks:
            vectors = await embedding_service.generate_embeddings_batch(chunks)
            for chunk_text, vector in zip(chunks, vectors):
                emb = Embedding(
                    project_id=project.id,
                    source_type="document",
                    source_id=doc.id,
                    content_chunk=chunk_text,
                    embedding=vector,
                )
                db.add(emb)
            db.commit()
            logger.info("Stored %d chunk embeddings for doc %s", len(chunks), doc.id)
    except Exception:
        logger.exception("Embedding generation failed for doc %s — document saved without embeddings", doc.id)

    return _doc_response(doc)


# ── GET / (list) ──────────────────────────────────────────────────────────────

@router.get("", response_model=DocumentListResponse)
def list_documents(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all documents in a project."""
    _get_project_or_403(project_id, current_user, db)
    docs = (
        db.query(Document)
        .filter(Document.project_id == project_id)
        .order_by(Document.created_at.desc())
        .all()
    )
    return DocumentListResponse(documents=[_doc_response(d) for d in docs])


# ── GET /{doc_id} ─────────────────────────────────────────────────────────────

@router.get("/{doc_id}", response_model=DocumentResponse)
def get_document(
    project_id: str,
    doc_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _get_project_or_403(project_id, current_user, db)
    doc = _get_document_or_404(doc_id, project_id, db)
    return _doc_response(doc)


# ── POST /{doc_id}/summarize ──────────────────────────────────────────────────

@router.post("/{doc_id}/summarize", response_model=SummaryResponse)
async def summarize_document(
    project_id: str,
    doc_id: str,
    body: SummarizeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _get_project_or_403(project_id, current_user, db)
    doc = _get_document_or_404(doc_id, project_id, db)

    if not doc.raw_text:
        raise HTTPException(status_code=400, detail="Document has no text to summarise")

    try:
        summary = await learning_service.summarise(doc.raw_text, body.level)
    except (RuntimeError, Exception) as exc:
        logger.exception("Summarise failed for doc %s", doc_id)
        raise HTTPException(status_code=503, detail=f"LLM service unavailable: {exc}")

    # Persist latest summary
    doc.summary = summary
    db.commit()

    return SummaryResponse(summary=summary, level=body.level)


# ── POST /{doc_id}/concepts ──────────────────────────────────────────────────

@router.post("/{doc_id}/concepts", response_model=ConceptsResponse)
async def extract_concepts(
    project_id: str,
    doc_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _get_project_or_403(project_id, current_user, db)
    doc = _get_document_or_404(doc_id, project_id, db)

    if not doc.raw_text:
        raise HTTPException(status_code=400, detail="Document has no text to analyse")

    try:
        concepts = await learning_service.extract_concepts(doc.raw_text)
    except (RuntimeError, Exception) as exc:
        logger.exception("Concept extraction failed for doc %s", doc_id)
        raise HTTPException(status_code=503, detail=f"LLM service unavailable: {exc}")

    # Persist
    doc.key_concepts = concepts
    db.commit()

    return ConceptsResponse(concepts=concepts)


# ── POST /{doc_id}/steps ─────────────────────────────────────────────────────

@router.post("/{doc_id}/steps", response_model=StepsResponse)
async def generate_steps(
    project_id: str,
    doc_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _get_project_or_403(project_id, current_user, db)
    doc = _get_document_or_404(doc_id, project_id, db)

    if not doc.raw_text:
        raise HTTPException(status_code=400, detail="Document has no text to analyse")

    try:
        steps = await learning_service.generate_steps(doc.raw_text)
    except (RuntimeError, Exception) as exc:
        logger.exception("Step generation failed for doc %s", doc_id)
        raise HTTPException(status_code=503, detail=f"LLM service unavailable: {exc}")

    doc.implementation_steps = steps
    db.commit()

    return StepsResponse(steps=steps)


# ── Response builder ──────────────────────────────────────────────────────────

def _doc_response(doc: Document) -> DocumentResponse:
    """Convert ORM Document to Pydantic response, enriching key_concepts."""
    return DocumentResponse(
        id=doc.id,
        project_id=doc.project_id,
        filename=doc.filename,
        file_url=doc.file_url,
        doc_type=doc.doc_type,
        raw_text=doc.raw_text,
        summary=doc.summary,
        key_concepts=doc.key_concepts or [],
        implementation_steps=doc.implementation_steps or [],
        created_at=doc.created_at,
    )
