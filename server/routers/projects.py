"""Project CRUD API router."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func as sql_func

from database import get_db
from models.project import Project
from models.document import Document
from models.code_insight import CodeInsight
from models.task import Task
from models.user import User
from schemas.project import (
    ProjectCreate,
    ProjectUpdate,
    ProjectResponse,
    ProjectListResponse,
)
from middleware.auth import get_current_user

router = APIRouter()


# ── helpers ───────────────────────────────────────────────────────────────────

def _enrich(project: Project, db: Session) -> dict:
    """Add aggregate counts to a project before returning."""
    doc_count = db.query(sql_func.count(Document.id)).filter(Document.project_id == project.id).scalar() or 0
    task_count = db.query(sql_func.count(Task.id)).filter(Task.project_id == project.id).scalar() or 0
    insight_count = db.query(sql_func.count(CodeInsight.id)).filter(CodeInsight.project_id == project.id).scalar() or 0

    data = {c.name: getattr(project, c.name) for c in project.__table__.columns}
    data["document_count"] = doc_count
    data["task_count"] = task_count
    data["insight_count"] = insight_count
    return data


def _get_project_or_404(project_id: str, user: User, db: Session) -> Project:
    """Fetch a project scoped to the current user, or raise 404."""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == user.id,
    ).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project


# ── POST /api/projects ────────────────────────────────────────────────────────

@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(
    body: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = Project(
        user_id=current_user.id,
        name=body.name,
        goal=body.goal,
        constraints=body.constraints,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return ProjectResponse(**_enrich(project, db))


# ── GET /api/projects ─────────────────────────────────────────────────────────

@router.get("", response_model=ProjectListResponse)
def list_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    projects = (
        db.query(Project)
        .filter(Project.user_id == current_user.id)
        .order_by(Project.updated_at.desc())
        .all()
    )
    return ProjectListResponse(
        projects=[ProjectResponse(**_enrich(p, db)) for p in projects]
    )


# ── GET /api/projects/{id} ───────────────────────────────────────────────────

@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = _get_project_or_404(project_id, current_user, db)
    return ProjectResponse(**_enrich(project, db))


# ── PUT /api/projects/{id} ───────────────────────────────────────────────────

@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: str,
    body: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = _get_project_or_404(project_id, current_user, db)

    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(project, field, value)

    db.commit()
    db.refresh(project)
    return ProjectResponse(**_enrich(project, db))


# ── DELETE /api/projects/{id} ─────────────────────────────────────────────────

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = _get_project_or_404(project_id, current_user, db)
    db.delete(project)
    db.commit()
    return None
