import uuid
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from ..core.database import get_db
from ..models.notification import Notification
from datetime import datetime

router = APIRouter(prefix="/api/notifications", tags=["notifications"])

def notif_to_dict(n: Notification) -> dict:
    return {
        "id": n.id, "title": n.title, "body": n.body,
        "notification_type": n.notification_type, "category": n.category,
        "entity_id": n.entity_id, "entity_type": n.entity_type,
        "action_url": n.action_url, "read": n.read,
        "read_at": n.read_at.isoformat() if n.read_at else None,
        "created_at": n.created_at.isoformat() if n.created_at else None,
    }

@router.get("/")
def list_notifications(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20),
    unread_only: bool = False,
    db: Session = Depends(get_db)
):
    q = db.query(Notification)
    if unread_only:
        q = q.filter(Notification.read == False)
    total = q.count()
    items = q.order_by(Notification.created_at.desc()).offset((page-1)*limit).limit(limit).all()
    return {"items": [notif_to_dict(n) for n in items], "total": total, "unread": q.filter(Notification.read == False).count(), "page": page, "limit": limit}

@router.get("/unread-count")
def unread_count(db: Session = Depends(get_db)):
    count = db.query(Notification).filter(Notification.read == False).count()
    return {"count": count}

@router.put("/{notif_id}/read")
def mark_read(notif_id: str, db: Session = Depends(get_db)):
    n = db.query(Notification).filter(Notification.id == notif_id).first()
    if n:
        n.read = True
        n.read_at = datetime.utcnow()
        db.commit()
    return {"ok": True}

@router.post("/read-all")
def mark_all_read(db: Session = Depends(get_db)):
    db.query(Notification).filter(Notification.read == False).update({"read": True, "read_at": datetime.utcnow()})
    db.commit()
    return {"ok": True}

@router.delete("/{notif_id}")
def delete_notification(notif_id: str, db: Session = Depends(get_db)):
    n = db.query(Notification).filter(Notification.id == notif_id).first()
    if n:
        db.delete(n)
        db.commit()
    return {"deleted": True}

@router.post("/")
def create_notification(title: str, body: str, notification_type: str = "info", category: str = "general", entity_type: str = None, entity_id: str = None, db: Session = Depends(get_db)):
    n = Notification(id=str(uuid.uuid4()), title=title, body=body, notification_type=notification_type, category=category, entity_type=entity_type, entity_id=entity_id)
    db.add(n)
    db.commit()
    return notif_to_dict(n)
