"""Dashboard router — aggregate stats and recent activity for the home screen."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from middleware.auth import get_current_user
from models.user import User
from models.project import Project
from models.document import Document
from models.code_insight import CodeInsight
from models.task import Task
from models.chat_message import ChatMessage

router = APIRouter()


@router.get("/stats")
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Get dashboard statistics with recent activity
    """
    try:
        # Get user's projects with names for activity display
        user_projects = db.query(Project).filter(Project.user_id == current_user.id).all()
        project_ids = [p.id for p in user_projects]
        project_map = {str(p.id): p.name for p in user_projects}
        
        # Count entities across all user's projects
        total_documents = db.query(Document).filter(Document.project_id.in_(project_ids)).count() if project_ids else 0
        total_insights = db.query(CodeInsight).filter(CodeInsight.project_id.in_(project_ids)).count() if project_ids else 0
        total_tasks = db.query(Task).filter(Task.project_id.in_(project_ids)).count() if project_ids else 0
        total_chats = db.query(ChatMessage).filter(
            ChatMessage.project_id.in_(project_ids),
            ChatMessage.role == "user"
        ).count() if project_ids else 0
        
        # Count total concepts extracted from all documents
        total_concepts = 0
        if project_ids:
            docs_with_concepts = db.query(Document).filter(
                Document.project_id.in_(project_ids),
                Document.key_concepts.isnot(None)
            ).all()
            for doc in docs_with_concepts:
                if doc.key_concepts and isinstance(doc.key_concepts, list):
                    total_concepts += len(doc.key_concepts)
        
        # Count high priority tasks
        high_priority_tasks = 0
        if project_ids:
            high_priority_tasks = db.query(Task).filter(
                Task.project_id.in_(project_ids),
                Task.priority == "high"
            ).count()
        
        # Collect recent activity from all sources
        recent_activity = []
        
        if project_ids:
            # Recent tasks
            recent_tasks = db.query(Task).filter(
                Task.project_id.in_(project_ids)
            ).order_by(Task.created_at.desc()).limit(10).all()
            
            for task in recent_tasks:
                recent_activity.append({
                    "id": str(task.id),
                    "type": "task",
                    "label": task.description[:60] + ("..." if len(task.description) > 60 else ""),
                    "project_id": str(task.project_id),
                    "project_name": project_map.get(str(task.project_id), "Unknown"),
                    "created_at": task.created_at.isoformat() if task.created_at else ""
                })
            
            # Recent documents
            recent_docs = db.query(Document).filter(
                Document.project_id.in_(project_ids)
            ).order_by(Document.created_at.desc()).limit(10).all()
            
            for doc in recent_docs:
                recent_activity.append({
                    "id": str(doc.id),
                    "type": "document",
                    "label": doc.filename,
                    "project_id": str(doc.project_id),
                    "project_name": project_map.get(str(doc.project_id), "Unknown"),
                    "created_at": doc.created_at.isoformat() if doc.created_at else ""
                })
            
            # Recent insights
            recent_insights = db.query(CodeInsight).filter(
                CodeInsight.project_id.in_(project_ids)
            ).order_by(CodeInsight.created_at.desc()).limit(10).all()
            
            for insight in recent_insights:
                recent_activity.append({
                    "id": str(insight.id),
                    "type": "insight",
                    "label": f"Code analysis - {insight.language}",
                    "project_id": str(insight.project_id),
                    "project_name": project_map.get(str(insight.project_id), "Unknown"),
                    "created_at": insight.created_at.isoformat() if insight.created_at else ""
                })
            
            # Recent chats
            recent_chats = db.query(ChatMessage).filter(
                ChatMessage.project_id.in_(project_ids),
                ChatMessage.role == "user"
            ).order_by(ChatMessage.created_at.desc()).limit(10).all()
            
            for chat in recent_chats:
                content_preview = chat.content[:60] + ("..." if len(chat.content) > 60 else "")
                recent_activity.append({
                    "id": str(chat.id),
                    "type": "chat",
                    "label": content_preview,
                    "project_id": str(chat.project_id),
                    "project_name": project_map.get(str(chat.project_id), "Unknown"),
                    "created_at": chat.created_at.isoformat() if chat.created_at else ""
                })
        
        # Sort all activity by creation time and take top 15
        recent_activity.sort(key=lambda x: x["created_at"], reverse=True)
        recent_activity = recent_activity[:15]
        
        return {
            "total_documents": total_documents,
            "total_insights": total_insights,
            "total_tasks": total_tasks,
            "total_chats": total_chats,
            "total_concepts": total_concepts,
            "high_priority_tasks": high_priority_tasks,
            "recent_activity": recent_activity
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
