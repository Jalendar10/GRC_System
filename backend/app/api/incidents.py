import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from pydantic import BaseModel
from ..core.database import get_db
from ..models.incident import Incident

router = APIRouter(prefix="/api/incidents", tags=["incidents"])

class IncidentCreate(BaseModel):
    title: str
    description: Optional[str] = None
    incident_type: Optional[str] = "operational"
    severity: Optional[str] = "medium"
    category: Optional[str] = "operational"
    detected_at: Optional[str] = None
    affected_systems: Optional[List[str]] = []
    affected_users_count: Optional[int] = 0
    data_compromised: Optional[bool] = False
    data_types_affected: Optional[List[str]] = []
    financial_impact: Optional[float] = 0
    regulatory_notification_required: Optional[bool] = False
    reporter: Optional[str] = "GRC Manager Analyst"
    assigned_to: Optional[str] = None
    regulatory_frameworks: Optional[List[str]] = []

def incident_to_dict(i: Incident) -> dict:
    return {
        "id": i.id, "title": i.title, "description": i.description,
        "incident_type": i.incident_type, "severity": i.severity, "status": i.status,
        "category": i.category,
        "detected_at": i.detected_at.isoformat() if i.detected_at else None,
        "reported_at": i.reported_at.isoformat() if i.reported_at else None,
        "contained_at": i.contained_at.isoformat() if i.contained_at else None,
        "resolved_at": i.resolved_at.isoformat() if i.resolved_at else None,
        "affected_systems": i.affected_systems or [],
        "affected_users_count": i.affected_users_count,
        "data_compromised": i.data_compromised,
        "data_types_affected": i.data_types_affected or [],
        "financial_impact": i.financial_impact,
        "regulatory_notification_required": i.regulatory_notification_required,
        "regulatory_notified_at": i.regulatory_notified_at.isoformat() if i.regulatory_notified_at else None,
        "regulatory_frameworks": i.regulatory_frameworks or [],
        "reporter": i.reporter, "assigned_to": i.assigned_to,
        "root_cause": i.root_cause, "lessons_learned": i.lessons_learned,
        "ai_analysis": i.ai_analysis, "timeline": i.timeline or [],
        "created_at": i.created_at.isoformat() if i.created_at else None,
    }

@router.get("/")
def list_incidents(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    search: Optional[str] = None,
    severity: Optional[str] = None,
    status: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    q = db.query(Incident)
    if search:
        q = q.filter(Incident.title.ilike(f"%{search}%"))
    if severity:
        q = q.filter(Incident.severity == severity)
    if status:
        q = q.filter(Incident.status == status)
    if category:
        q = q.filter(Incident.category == category)
    total = q.count()
    items = q.order_by(Incident.reported_at.desc()).offset((page-1)*limit).limit(limit).all()
    return {"items": [incident_to_dict(i) for i in items], "total": total, "page": page, "limit": limit, "pages": max(1, -(-total // limit))}

@router.get("/stats")
def incident_stats(db: Session = Depends(get_db)):
    incidents = db.query(Incident).all()
    open_incidents = [i for i in incidents if i.status in ("open", "investigating")]
    return {
        "total": len(incidents), "open": len(open_incidents),
        "critical": sum(1 for i in incidents if i.severity == "critical"),
        "high": sum(1 for i in incidents if i.severity == "high"),
        "data_breaches": sum(1 for i in incidents if i.data_compromised),
        "regulatory_notifications": sum(1 for i in incidents if i.regulatory_notification_required),
        "total_financial_impact": sum(i.financial_impact or 0 for i in incidents),
        "total_affected_users": sum(i.affected_users_count or 0 for i in incidents),
    }

@router.get("/{incident_id}")
def get_incident(incident_id: str, db: Session = Depends(get_db)):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident_to_dict(incident)

@router.post("/")
def create_incident(req: IncidentCreate, db: Session = Depends(get_db)):
    data = req.dict()
    if data.get("detected_at"):
        data["detected_at"] = datetime.fromisoformat(data["detected_at"])
    incident = Incident(id=str(uuid.uuid4()), **data)
    db.add(incident)
    db.commit()
    db.refresh(incident)
    return incident_to_dict(incident)

@router.put("/{incident_id}")
def update_incident(incident_id: str, updates: dict, db: Session = Depends(get_db)):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    for k, v in updates.items():
        if hasattr(incident, k):
            setattr(incident, k, v)
    db.commit()
    return incident_to_dict(incident)

@router.delete("/{incident_id}")
def delete_incident(incident_id: str, db: Session = Depends(get_db)):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    db.delete(incident)
    db.commit()
    return {"deleted": True}

@router.post("/{incident_id}/analyze")
def analyze_incident(incident_id: str, db: Session = Depends(get_db)):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    from ..services.ai_service import ai_service
    import json
    system = "You are a senior incident response manager at a regulated financial institution. Provide expert root cause analysis and remediation guidance. Return JSON only."
    user = f"""Analyze this security/compliance incident:
{json.dumps(incident_to_dict(incident), indent=2)}
Return JSON: root_cause (string), contributing_factors (list), regulatory_obligations (list), immediate_actions (list), long_term_remediation (list), lessons_learned (string), estimated_recurrence_risk (low/medium/high)"""
    try:
        raw = ai_service._call(system, user, max_tokens=2000)
        result = json.loads(raw.strip().lstrip("```json").rstrip("```"))
    except Exception:
        result = {"root_cause": "Investigation ongoing", "contributing_factors": ["Requires manual review"], "regulatory_obligations": [], "immediate_actions": ["Contain the incident", "Notify stakeholders"], "long_term_remediation": ["Conduct post-incident review"], "lessons_learned": "Full analysis pending", "estimated_recurrence_risk": "medium"}
    incident.ai_analysis = json.dumps(result)
    if result.get("root_cause"):
        incident.root_cause = result["root_cause"]
    if result.get("lessons_learned"):
        incident.lessons_learned = result["lessons_learned"]
    db.commit()
    return result
