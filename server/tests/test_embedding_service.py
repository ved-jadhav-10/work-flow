"""Tests for embedding service — mocked Gemini calls + similarity search."""

import os
import sys
import pytest
from unittest.mock import MagicMock, patch

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))


# ── Helpers ───────────────────────────────────────────────────────────────────

def _make_fake_embedding(dim: int = 768) -> list[float]:
    """Return a deterministic fake vector."""
    return [0.01 * i for i in range(dim)]


class FakeEmbedding:
    def __init__(self, values):
        self.values = values


class FakeEmbedResponse:
    def __init__(self, embeddings):
        self.embeddings = embeddings


class FakeModels:
    def embed_content(self, model, contents):
        if isinstance(contents, list):
            return FakeEmbedResponse([FakeEmbedding(_make_fake_embedding()) for _ in contents])
        return FakeEmbedResponse([FakeEmbedding(_make_fake_embedding())])


class FakeClient:
    models = FakeModels()


# ── Tests ─────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_generate_embedding_returns_768d():
    import services.embedding_service as es
    es._client = FakeClient()

    vec = await es.generate_embedding("Hello world")

    assert isinstance(vec, list)
    assert len(vec) == 768


@pytest.mark.asyncio
async def test_generate_embeddings_batch():
    import services.embedding_service as es
    es._client = FakeClient()

    vecs = await es.generate_embeddings_batch(["Hello", "World", "Test"])

    assert len(vecs) == 3
    assert all(len(v) == 768 for v in vecs)


@pytest.mark.asyncio
async def test_generate_embeddings_batch_empty():
    import services.embedding_service as es
    es._client = FakeClient()

    vecs = await es.generate_embeddings_batch([])
    assert vecs == []


@pytest.mark.asyncio
async def test_similarity_search_returns_ordered():
    """Mock a DB session and verify similarity_search returns results."""
    import services.embedding_service as es

    # Fake DB rows
    class FakeRow:
        def __init__(self, src_type, src_id, chunk, dist):
            self.source_type = src_type
            self.source_id = src_id
            self.content_chunk = chunk
            self.distance = dist

    fake_rows = [
        FakeRow("document", "aaa-111", "chunk about recursion", 0.12),
        FakeRow("code", "bbb-222", "def factorial(n):", 0.34),
    ]

    mock_db = MagicMock()
    mock_db.execute.return_value.fetchall.return_value = fake_rows

    results = await es.similarity_search(
        db=mock_db,
        project_id="test-project-id",
        query_embedding=_make_fake_embedding(),
        top_k=5,
    )

    assert len(results) == 2
    assert results[0]["source_type"] == "document"
    assert results[0]["distance"] < results[1]["distance"]
    assert "recursion" in results[0]["content_chunk"]
