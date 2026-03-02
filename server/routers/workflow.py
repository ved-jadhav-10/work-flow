"""Workflow router — task extraction and management.

All endpoints are scoped to a project and require auth.
Prefix: /api/projects/{project_id}/  (tasks + workflow sub-paths)
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from database import get_db
from middleware.auth import get_current_user
from models.project import Project
from models.task import Task
from models.user import User
from schemas.workflow import (
    ExtractTasksRequest,
    ExtractTasksResponse,
    TaskListResponse,
    TaskResponse,
    TaskUpdate,
)
from services import workflow_service
from services.context_engine import update_context

logger = logging.getLogger(__name__)

router = APIRouter()


# ── Helpers ───────────────────────────────────────────────────────────────────

def _get_project_or_404(project_id: str, user: User, db: Session) -> Project:
    project = (
        db.query(Project)
        .filter(Project.id == project_id, Project.user_id == user.id)
        .first()
    )
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project


def _get_task_or_404(task_id: str, project_id: str, db: Session) -> Task:
    task = (
        db.query(Task)
        .filter(Task.id == task_id, Task.project_id == project_id)
        .first()
    )
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task


def _llm_error(exc: Exception) -> HTTPException:
    logger.exception("Task extraction failed")
    return HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail=f"LLM service unavailable: {exc}",
    )


# ── POST /workflow/extract ────────────────────────────────────────────────────

@router.post(
    "/workflow/extract",
    response_model=ExtractTasksResponse,
    status_code=status.HTTP_201_CREATED,
)
async def extract_tasks(
    project_id: str,
    body: ExtractTasksRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Extract actionable tasks from a meeting transcript or email thread."""
    if not body.text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Text cannot be empty"
        )

    project = _get_project_or_404(project_id, current_user, db)

    try:
        result = await workflow_service.extract_tasks(body.text, body.source_type)
    except Exception as exc:
        raise _llm_error(exc)

    saved_tasks: list[Task] = []
    for item in result["tasks"]:
        task = Task(
            project_id=project.id,
            description=item["description"],
            priority=item["priority"],
            status="pending",
            # store hints in source_text as a lightweight metadata string
            source_text=(
                f"[assignee: {item['assignee_hint']}] "
                if item.get("assignee_hint")
                else ""
            )
            + (
                f"[deadline: {item['deadline_hint']}]"
                if item.get("deadline_hint")
                else ""
            )
            or None,
        )
        db.add(task)
        saved_tasks.append(task)

    db.commit()
    for t in saved_tasks:
        db.refresh(t)

    # Feed context engine with task summary
    try:
        task_preview = "; ".join(t.description for t in saved_tasks[:5])
        await update_context(
            str(project.id), "decision",
            f"[Workflow] {len(saved_tasks)} tasks extracted ({body.source_type}): {task_preview[:200]}",
            db,
        )
    except Exception:
        logger.warning("Context update failed after task extraction — non-blocking")

    return ExtractTasksResponse(
        tasks=[TaskResponse.model_validate(t) for t in saved_tasks],
        extracted_count=len(saved_tasks),
        truncated=result["truncated"],
        source_type=result["source_type"],
    )


# ── GET /tasks ────────────────────────────────────────────────────────────────

@router.get("/tasks", response_model=TaskListResponse)
def list_tasks(
    project_id: str,
    priority: str | None = Query(default=None, description="Filter by priority: high|medium|low"),
    task_status: str | None = Query(default=None, alias="status", description="Filter by status: pending|done"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all tasks for this project, optionally filtered by priority or status."""
    _get_project_or_404(project_id, current_user, db)

    q = db.query(Task).filter(Task.project_id == project_id)
    if priority:
        q = q.filter(Task.priority == priority)
    if task_status:
        q = q.filter(Task.status == task_status)

    tasks = q.order_by(Task.created_at.desc()).all()

    # Compute stats across ALL tasks (not just the filtered set for stats bar)
    all_tasks = (
        db.query(Task).filter(Task.project_id == project_id).all()
    )
    by_priority: dict[str, int] = {"high": 0, "medium": 0, "low": 0}
    by_status: dict[str, int] = {"pending": 0, "done": 0}
    for t in all_tasks:
        if t.priority in by_priority:
            by_priority[t.priority] += 1
        if t.status in by_status:
            by_status[t.status] += 1

    return TaskListResponse(
        tasks=[TaskResponse.model_validate(t) for t in tasks],
        total=len(all_tasks),
        by_priority=by_priority,
        by_status=by_status,
    )


# ── PUT /tasks/{task_id} ──────────────────────────────────────────────────────

@router.put("/tasks/{task_id}", response_model=TaskResponse)
def update_task(
    project_id: str,
    task_id: str,
    body: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update a task's description, priority, or status."""
    _get_project_or_404(project_id, current_user, db)
    task = _get_task_or_404(task_id, project_id, db)

    if body.description is not None:
        task.description = body.description
    if body.priority is not None:
        task.priority = body.priority
    if body.status is not None:
        task.status = body.status

    db.commit()
    db.refresh(task)
    return TaskResponse.model_validate(task)


# ── DELETE /tasks/{task_id} ───────────────────────────────────────────────────

@router.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    project_id: str,
    task_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a task from the project."""
    _get_project_or_404(project_id, current_user, db)
    task = _get_task_or_404(task_id, project_id, db)
    db.delete(task)
    db.commit()
