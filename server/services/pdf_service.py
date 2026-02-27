"""
PDF text extraction and text chunking.

Uses PyMuPDF (fitz) for fast text extraction and pdfplumber for tables.
"""

from __future__ import annotations

import io
import logging
import math

import fitz  # PyMuPDF
import pdfplumber

logger = logging.getLogger(__name__)

MAX_PAGES_WARN = 100


# ── Text extraction ───────────────────────────────────────────────────────────

async def extract_text(file_bytes: bytes, filename: str = "document.pdf") -> str:
    """
    Extract all readable text from a PDF.
    Raises ValueError for encrypted / unreadable PDFs.
    """
    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
    except Exception as exc:
        raise ValueError(f"Cannot open PDF '{filename}': {exc}") from exc

    if doc.is_encrypted:
        doc.close()
        raise ValueError(f"PDF '{filename}' is encrypted — please remove the password first.")

    total_pages = len(doc)
    if total_pages > MAX_PAGES_WARN:
        logger.warning("Large PDF: %s has %d pages — processing may be slow", filename, total_pages)

    pages: list[str] = []
    for page in doc:
        text = page.get_text("text")
        if text and text.strip():
            pages.append(text.strip())

    doc.close()

    if not pages:
        raise ValueError(f"PDF '{filename}' contains no extractable text (scanned image?).")

    full_text = "\n\n".join(pages)
    logger.info("Extracted %d chars from %d pages of '%s'", len(full_text), total_pages, filename)
    return full_text


# ── Table extraction ──────────────────────────────────────────────────────────

async def extract_tables(file_bytes: bytes) -> list[str]:
    """
    Extract tables from a PDF and return each as a Markdown-formatted string.
    """
    tables_md: list[str] = []
    try:
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                for table in page.extract_tables():
                    if not table:
                        continue
                    # Build markdown table
                    header = table[0]
                    md = "| " + " | ".join(str(c or "") for c in header) + " |\n"
                    md += "| " + " | ".join("---" for _ in header) + " |\n"
                    for row in table[1:]:
                        md += "| " + " | ".join(str(c or "") for c in row) + " |\n"
                    tables_md.append(md.strip())
    except Exception as exc:
        logger.warning("Table extraction failed: %s", exc)

    logger.info("Extracted %d tables", len(tables_md))
    return tables_md


# ── Text chunking ─────────────────────────────────────────────────────────────

async def chunk_text(
    text: str,
    chunk_size: int = 500,
    overlap: int = 50,
) -> list[str]:
    """
    Split text into overlapping chunks by word count
    (approximation of token count — 1 word ≈ 1.3 tokens).
    """
    words = text.split()
    if not words:
        return []

    chunks: list[str] = []
    start = 0
    while start < len(words):
        end = start + chunk_size
        chunk = " ".join(words[start:end])
        chunks.append(chunk)
        start += chunk_size - overlap

    logger.info(
        "Chunked %d words → %d chunks (size=%d, overlap=%d)",
        len(words),
        len(chunks),
        chunk_size,
        overlap,
    )
    return chunks
