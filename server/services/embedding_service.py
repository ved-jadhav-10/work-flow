"""
Embedding generation (Gemini text-embedding-004) and pgvector similarity search.
"""

from __future__ import annotations

import logging
from uuid import UUID

from google import genai
from sqlalchemy.orm import Session
from sqlalchemy import text as sql_text

from config import settings

logger = logging.getLogger(__name__)

EMBEDDING_MODEL = "text-embedding-004"
EMBEDDING_DIM = 768

_client: genai.Client | None = None


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        _client = genai.Client(api_key=settings.gemini_api_key)
    return _client


# ── Single embedding ──────────────────────────────────────────────────────────

async def generate_embedding(text: str) -> list[float]:
    """Generate a 768-d embedding for a single text string."""
    client = _get_client()
    response = client.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=text,
    )
    vector = response.embeddings[0].values
    if len(vector) != EMBEDDING_DIM:
        logger.warning("Expected %d dims, got %d", EMBEDDING_DIM, len(vector))
    return list(vector)


# ── Batch embeddings ──────────────────────────────────────────────────────────

async def generate_embeddings_batch(texts: list[str]) -> list[list[float]]:
    """Generate embeddings for multiple texts in one call."""
    if not texts:
        return []
    client = _get_client()
    response = client.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=texts,
    )
    return [list(e.values) for e in response.embeddings]


# ── Similarity search ─────────────────────────────────────────────────────────

async def similarity_search(
    db: Session,
    project_id: str,
    query_embedding: list[float],
    top_k: int = 5,
) -> list[dict]:
    """
    Find the closest embeddings in the project using pgvector <=> (cosine distance).
    Returns list of dicts: {source_type, source_id, content_chunk, distance}
    """
    vec_literal = "[" + ",".join(str(v) for v in query_embedding) + "]"
    query = sql_text("""
        SELECT
            source_type,
            source_id,
            content_chunk,
            embedding <=> :vec AS distance
        FROM embeddings
        WHERE project_id = :pid
        ORDER BY embedding <=> :vec
        LIMIT :k
    """)
    rows = db.execute(
        query,
        {"vec": vec_literal, "pid": project_id, "k": top_k},
    ).fetchall()

    results = [
        {
            "source_type": row.source_type,
            "source_id": str(row.source_id),
            "content_chunk": row.content_chunk,
            "distance": float(row.distance),
        }
        for row in rows
    ]
    logger.info("Similarity search: project=%s top_k=%d results=%d", project_id, top_k, len(results))
    return results
