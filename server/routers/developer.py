"""Developer Productivity router — code explanation, debugging, README generation.

All endpoints are scoped to a project and require auth.
Prefix: /api/projects/{project_id}/code
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from middleware.auth import get_current_user
from models.user import User
from models.project import Project
from models.code_insight import CodeInsight
from schemas.developer import (
    ExplainRequest,
    ExplainResponse,
    DebugRequest,
    DebugResponse,
    ReadmeRequest,
    ReadmeResponse,
    CodeInsightListItem,
    CodeInsightListResponse,
)
from services import developer_service
from services.developer_service import parse_insight
from services.context_engine import update_context
from services import embedding_service
from models.embedding import Embedding

logger = logging.getLogger(__name__)

router = APIRouter()


# ── Helpers ───────────────────────────────────────────────────────────────────

def _get_project_or_404(project_id: str, user: User, db: Session) -> Project:
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == user.id,
    ).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project


def _validate_code(code: str) -> None:
    if not code or not code.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Code cannot be empty",
        )


def _llm_error(exc: Exception, action: str) -> HTTPException:
    logger.exception("%s failed", action)
    return HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail=f"LLM service unavailable: {exc}",
    )


# ── POST /explain ─────────────────────────────────────────────────────────────

@router.post("/explain", response_model=ExplainResponse, status_code=status.HTTP_201_CREATED)
async def explain_code(
    project_id: str,
    body: ExplainRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Explain a code snippet — overview, components, patterns, complexity."""
    project = _get_project_or_404(project_id, current_user, db)
    _validate_code(body.code)

    try:
        result = await developer_service.explain(body.code, body.language)
    except Exception as exc:
        raise _llm_error(exc, "explain")

    insight = CodeInsight(
        project_id=project.id,
        code_snippet=body.code[:10_000],  # cap stored snippet
        language=body.language,
        explanation=result["_explanation_json"],
        components=result["_components_list"],
        suggestions=result["_suggestions_list"],
    )
    db.add(insight)
    db.commit()
    db.refresh(insight)

    # Feed context engine + generate embeddings for code insight
    try:
        await update_context(
            str(project.id), "decision",
            f"[Developer] Code explained ({body.language}): {result['overview'][:200]}",
            db,
        )
    except Exception:
        logger.warning("Context update failed after explain — non-blocking")

    try:
        explanation_text = result.get("overview", "")
        if explanation_text:
            vectors = await embedding_service.generate_embeddings_batch([explanation_text])
            if vectors:
                emb = Embedding(
                    project_id=project.id,
                    source_type="code_insight",
                    source_id=insight.id,
                    content_chunk=explanation_text[:2000],
                    embedding=vectors[0],
                )
                db.add(emb)
                db.commit()
    except Exception:
        logger.warning("Embedding generation failed for code insight — non-blocking")

    return ExplainResponse(
        id=insight.id,
        language=insight.language,
        overview=result["overview"],
        components=result["components"],
        patterns=result["patterns"],
        complexity=result["complexity"],
        truncated=result["truncated"],
        created_at=insight.created_at,
    )


# ── POST /debug ───────────────────────────────────────────────────────────────

@router.post("/debug", response_model=DebugResponse, status_code=status.HTTP_201_CREATED)
async def debug_code(
    project_id: str,
    body: DebugRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Identify bugs, edge cases, and inefficiencies in a code snippet."""
    project = _get_project_or_404(project_id, current_user, db)
    _validate_code(body.code)

    try:
        result = await developer_service.debug(body.code, body.language)
    except Exception as exc:
        raise _llm_error(exc, "debug")

    insight = CodeInsight(
        project_id=project.id,
        code_snippet=body.code[:10_000],
        language=body.language,
        explanation=result["_explanation_json"],
        components=result["_components_list"],
        suggestions=result["_suggestions_list"],
    )
    db.add(insight)
    db.commit()
    db.refresh(insight)

    # Feed context engine + generate embeddings for debug insight
    try:
        n_bugs = len(result.get("bugs", []))
        overview = f"{n_bugs} bug{'s' if n_bugs != 1 else ''} found in {body.language} code"
        await update_context(
            str(project.id), "decision",
            f"[Developer] Debug analysis ({body.language}): {overview}",
            db,
        )
    except Exception:
        logger.warning("Context update failed after debug — non-blocking")

    try:
        bug_text = "; ".join(b.get("description", "") for b in result.get("bugs", [])[:3])
        if bug_text:
            vectors = await embedding_service.generate_embeddings_batch([bug_text])
            if vectors:
                emb = Embedding(
                    project_id=project.id,
                    source_type="code_insight",
                    source_id=insight.id,
                    content_chunk=bug_text[:2000],
                    embedding=vectors[0],
                )
                db.add(emb)
                db.commit()
    except Exception:
        logger.warning("Embedding generation failed for debug insight — non-blocking")

    return DebugResponse(
        id=insight.id,
        language=insight.language,
        bugs=result["bugs"],
        edge_cases=result["edge_cases"],
        inefficiencies=result["inefficiencies"],
        truncated=result["truncated"],
        created_at=insight.created_at,
    )


# ── POST /readme ──────────────────────────────────────────────────────────────

@router.post("/readme", response_model=ReadmeResponse, status_code=status.HTTP_201_CREATED)
async def generate_readme(
    project_id: str,
    body: ReadmeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Generate a professional README.md for the provided code."""
    project = _get_project_or_404(project_id, current_user, db)
    _validate_code(body.code)

    try:
        result = await developer_service.generate_readme(
            body.code, body.language, body.project_name
        )
    except Exception as exc:
        raise _llm_error(exc, "generate_readme")

    insight = CodeInsight(
        project_id=project.id,
        code_snippet=body.code[:10_000],
        language=body.language,
        explanation=result["_explanation_json"],
        components=[],
        suggestions=[],
    )
    db.add(insight)
    db.commit()
    db.refresh(insight)

    return ReadmeResponse(
        id=insight.id,
        language=insight.language,
        readme=result["readme"],
        truncated=result["truncated"],
        created_at=insight.created_at,
    )


# ── GET / (list all insights) ─────────────────────────────────────────────────

@router.get("", response_model=CodeInsightListResponse)
def list_insights(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all code insights for this project, newest first."""
    _get_project_or_404(project_id, current_user, db)

    insights = (
        db.query(CodeInsight)
        .filter(CodeInsight.project_id == project_id)
        .order_by(CodeInsight.created_at.desc())
        .all()
    )

    items: list[CodeInsightListItem] = []
    for ins in insights:
        parsed = parse_insight(ins.explanation)
        items.append(CodeInsightListItem(
            id=ins.id,
            insight_type=parsed.get("type", "explain"),
            language=ins.language,
            overview=parsed.get("overview", "")[:120],
            created_at=ins.created_at,
        ))

    return CodeInsightListResponse(insights=items)


# ── DELETE /{insight_id} ──────────────────────────────────────────────────────

@router.delete("/{insight_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_insight(
    project_id: str,
    insight_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a code insight and its associated embeddings."""
    _get_project_or_404(project_id, current_user, db)

    insight = db.query(CodeInsight).filter(
        CodeInsight.id == insight_id,
        CodeInsight.project_id == project_id,
    ).first()
    if not insight:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Code insight not found")

    # Delete associated embeddings
    db.query(Embedding).filter(
        Embedding.source_type == "code",
        Embedding.source_id == insight.id,
    ).delete(synchronize_session=False)

    db.delete(insight)
    db.commit()
    logger.info("Deleted code insight %s from project %s", insight_id, project_id)
