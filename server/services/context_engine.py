"""
Context Persistence Engine.

Aggregates all project data (documents, code insights, tasks, project metadata)
into a unified context and performs RAG retrieval via pgvector.
"""

from __future__ import annotations

import logging
from typing import Any

from sqlalchemy.orm import Session

from models.project import Project
from models.document import Document
from models.code_insight import CodeInsight
from models.task import Task
from services.embedding_service import generate_embedding, similarity_search

logger = logging.getLogger(__name__)


# ── Full context gathering ────────────────────────────────────────────────────

async def get_full_context(project_id: str, db: Session) -> dict[str, Any]:
    """
    Query all project artefacts and return a structured context dict.

    Includes:
    - Project metadata (goal, constraints, decisions, open_questions)
    - Last 5 document summaries
    - Last 5 code insight explanations
    - All open (pending) tasks
    """
    # ── Project metadata ──────────────────────────────────────────────────
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        return {}

    project_meta = {
        "name": project.name,
        "goal": project.goal,
        "constraints": project.constraints or [],
        "decisions": project.decisions or [],
        "open_questions": project.open_questions or [],
    }

    # ── Recent documents (last 5 with summaries) ─────────────────────────
    documents = (
        db.query(Document)
        .filter(Document.project_id == project_id, Document.summary.isnot(None))
        .order_by(Document.created_at.desc())
        .limit(5)
        .all()
    )
    doc_summaries = [
        {
            "id": str(d.id),
            "filename": d.filename,
            "summary": d.summary,
            "key_concepts": d.key_concepts or [],
        }
        for d in documents
    ]

    # ── Recent code insights (last 5) ────────────────────────────────────
    insights = (
        db.query(CodeInsight)
        .filter(CodeInsight.project_id == project_id, CodeInsight.explanation.isnot(None))
        .order_by(CodeInsight.created_at.desc())
        .limit(5)
        .all()
    )
    code_insights = [
        {
            "id": str(ci.id),
            "language": ci.language,
            "explanation": ci.explanation,
            "components": ci.components or [],
        }
        for ci in insights
    ]

    # ── Open tasks ────────────────────────────────────────────────────────
    open_tasks = (
        db.query(Task)
        .filter(Task.project_id == project_id, Task.status == "pending")
        .order_by(Task.priority.desc(), Task.created_at.desc())
        .all()
    )
    tasks = [
        {
            "id": str(t.id),
            "description": t.description,
            "priority": t.priority,
            "status": t.status,
        }
        for t in open_tasks
    ]

    return {
        "project": project_meta,
        "documents": doc_summaries,
        "code_insights": code_insights,
        "tasks": tasks,
    }


# ── RAG: retrieve relevant chunks via pgvector ───────────────────────────────

async def retrieve_relevant_chunks(
    project_id: str,
    query: str,
    db: Session,
    top_k: int = 5,
) -> list[dict]:
    """
    Generate a query embedding and run cosine similarity search against
    the project's stored embeddings.

    Returns list of {source_type, source_id, chunk_preview, distance}.
    """
    try:
        query_embedding = await generate_embedding(query)
        chunks = await similarity_search(db, project_id, query_embedding, top_k=top_k)
        logger.info(
            "Retrieved %d relevant chunks for project=%s query=%s…",
            len(chunks),
            project_id,
            query[:60],
        )
        return chunks
    except Exception as exc:
        logger.warning("Chunk retrieval failed: %s — continuing without RAG", exc)
        return []


# ── Build augmented prompt ────────────────────────────────────────────────────

async def build_context_prompt(
    project_id: str,
    user_query: str,
    db: Session,
) -> tuple[str, list[dict]]:
    """
    Build the full augmented prompt for the LLM.

    Returns (prompt_string, context_references) where context_references
    is a list of {source_type, source_id, chunk_preview} used for attribution.
    """
    context = await get_full_context(project_id, db)
    if not context:
        return user_query, []

    chunks = await retrieve_relevant_chunks(project_id, user_query, db, top_k=5)

    # ── Assemble the prompt sections ──────────────────────────────────────
    sections: list[str] = []

    # --- Project context ---
    proj = context["project"]
    sections.append("=== PROJECT CONTEXT ===")
    sections.append(f"Project: {proj['name']}")
    sections.append(f"Goal: {proj['goal']}")
    if proj["constraints"]:
        sections.append(f"Constraints: {', '.join(proj['constraints'])}")
    if proj["decisions"]:
        sections.append(f"Decisions: {', '.join(proj['decisions'])}")
    if proj["open_questions"]:
        sections.append(f"Open Questions: {', '.join(proj['open_questions'])}")

    # --- Relevant knowledge (from vector search) ---
    if chunks:
        sections.append("\n=== RELEVANT KNOWLEDGE ===")
        for i, chunk in enumerate(chunks, 1):
            preview = chunk["content_chunk"][:500]
            sections.append(f"[{i}] ({chunk['source_type']}) {preview}")

    # --- Recent activity ---
    sections.append("\n=== RECENT ACTIVITY ===")
    if context["documents"]:
        sections.append("Recent Documents:")
        for doc in context["documents"]:
            summary_preview = (doc["summary"] or "")[:200]
            sections.append(f"  - {doc['filename']}: {summary_preview}")

    if context["code_insights"]:
        sections.append("Recent Code Insights:")
        for ci in context["code_insights"]:
            explanation_preview = (ci["explanation"] or "")[:200]
            sections.append(f"  - [{ci['language']}] {explanation_preview}")

    if context["tasks"]:
        sections.append("Open Tasks:")
        for task in context["tasks"]:
            sections.append(f"  - [{task['priority']}] {task['description']}")

    # --- User query ---
    sections.append(f"\n=== USER QUERY ===\n{user_query}")

    prompt = "\n".join(sections)

    # Build context references for attribution
    context_refs = [
        {
            "source_type": chunk["source_type"],
            "source_id": chunk["source_id"],
            "chunk_preview": chunk["content_chunk"][:150],
        }
        for chunk in chunks
    ]

    return prompt, context_refs


# ── Update context (called by other modules) ─────────────────────────────────

async def update_context(
    project_id: str,
    update_type: str,
    data: Any,
    db: Session,
) -> None:
    """
    Called by Learning / Developer / Workflow modules to push structured
    context into the project record (decisions, open_questions).

    update_type: "decision" | "open_question"
    data: str (the item to append)
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        logger.warning("update_context: project %s not found", project_id)
        return

    if update_type == "decision":
        decisions = list(project.decisions or [])
        decisions.append(data)
        project.decisions = decisions
    elif update_type == "open_question":
        questions = list(project.open_questions or [])
        questions.append(data)
        project.open_questions = questions
    else:
        logger.warning("Unknown update_type: %s", update_type)
        return

    db.commit()
    logger.info("Context updated: project=%s type=%s", project_id, update_type)
