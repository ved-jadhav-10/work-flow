"""Tests for PDF text extraction and chunking."""

import os
import pytest
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

SAMPLE_PDF = os.path.join(os.path.dirname(__file__), "sample.pdf")


@pytest.mark.asyncio
async def test_extract_text_from_sample_pdf():
    from services.pdf_service import extract_text

    with open(SAMPLE_PDF, "rb") as f:
        pdf_bytes = f.read()

    text = await extract_text(pdf_bytes, "sample.pdf")

    assert len(text) > 0
    assert "test PDF" in text or "Hello" in text


@pytest.mark.asyncio
async def test_extract_text_encrypted_raises():
    """Encrypted PDFs should raise ValueError."""
    import fitz
    from services.pdf_service import extract_text

    # Create a minimal encrypted PDF in memory
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((72, 72), "Secret content")
    encrypted_bytes = doc.tobytes(
        encryption=fitz.PDF_ENCRYPT_AES_256,
        owner_pw="owner",
        user_pw="user",
    )
    doc.close()

    with pytest.raises(ValueError, match="encrypted"):
        await extract_text(encrypted_bytes, "encrypted.pdf")


@pytest.mark.asyncio
async def test_chunk_text_basic():
    from services.pdf_service import chunk_text

    words = " ".join(f"word{i}" for i in range(120))
    chunks = await chunk_text(words, chunk_size=50, overlap=10)

    assert len(chunks) >= 2
    # First chunk should have 50 words
    assert len(chunks[0].split()) == 50
    # Overlap check: last 10 words of chunk 0 == first 10 of chunk 1
    c0_words = chunks[0].split()
    c1_words = chunks[1].split()
    assert c0_words[-10:] == c1_words[:10]


@pytest.mark.asyncio
async def test_chunk_text_empty():
    from services.pdf_service import chunk_text
    assert await chunk_text("") == []


@pytest.mark.asyncio
async def test_extract_tables_returns_list():
    """Tables extraction on sample (no tables) should return empty list, not crash."""
    from services.pdf_service import extract_tables

    with open(SAMPLE_PDF, "rb") as f:
        pdf_bytes = f.read()

    tables = await extract_tables(pdf_bytes)
    assert isinstance(tables, list)
