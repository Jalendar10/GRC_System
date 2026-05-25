import uuid
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from ..core.database import get_db
from ..models.activity_log import ActivityLog

router = APIRouter(prefix="/api/activity-log", tags=["activity_log"])

def log_to_dict(l: ActivityLog) -> dict:
    return {
        "id": l.id, "user_id": l.user_id, "user_name": l.user_name,
        "action": l.action, "entity_type": l.entity_type,
        "entity_id": l.entity_id, "entity_name": l.entity_name,
        "description": l.description, "status": l.status,
        "created_at": l.created_at.isoformat() if l.created_at else None,
    }

def log_activity(db: Session, action: str, entity_type: str, entity_id: str, entity_name: str = "", description: str = "", user_name: str = "GRC Manager Analyst"):
    """Utility function to log an activity"""
    entry = ActivityLog(
        id=str(uuid.uuid4()), user_name=user_name,
        action=action, entity_type=entity_type,
        entity_id=entity_id, entity_name=entity_name,
        description=description, status="success",
    )
    db.add(entry)

@router.get("/")
def list_activity(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=50, ge=1, le=200),
    entity_type: Optional[str] = None,
    action: Optional[str] = None,
    db: Session = Depends(get_db)
):
    q = db.query(ActivityLog)
    if entity_type:
        q = q.filter(ActivityLog.entity_type == entity_type)
    if action:
        q = q.filter(ActivityLog.action == action)
    total = q.count()
    items = q.order_by(ActivityLog.created_at.desc()).offset((page-1)*limit).limit(limit).all()
    return {"items": [log_to_dict(l) for l in items], "total": total, "page": page, "limit": limit, "pages": max(1, -(-total // limit))}

@router.get("/export")
def export_activity(db: Session = Depends(get_db)):
    from fastapi.responses import StreamingResponse
    import csv, io
    logs = db.query(ActivityLog).order_by(ActivityLog.created_at.desc()).limit(10000).all()
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=["created_at", "user_name", "action", "entity_type", "entity_name", "description", "status"])
    writer.writeheader()
    for l in logs:
        writer.writerow({"created_at": l.created_at, "user_name": l.user_name, "action": l.action, "entity_type": l.entity_type, "entity_name": l.entity_name or "", "description": l.description or "", "status": l.status})
    output.seek(0)
    return StreamingResponse(iter([output.getvalue()]), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=activity_log.csv"})
