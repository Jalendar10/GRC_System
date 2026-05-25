import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List
from pydantic import BaseModel
from ..core.database import get_db
from ..models.policy import Policy, PolicyAcknowledgment
from ..services.ai_service import ai_service

router = APIRouter(prefix="/api/policies", tags=["policies"])


class PolicyCreate(BaseModel):
    name: str
    category: str = "information_security"
    owner: Optional[str] = None
    approver: Optional[str] = None
    description: Optional[str] = None
    content: Optional[str] = None
    scope: Optional[str] = None
    framework_refs: Optional[List[str]] = []
    acknowledgment_required: bool = True


def policy_to_dict(p: Policy) -> dict:
    return {
        "id": p.id,
        "policy_id": p.policy_id,
        "name": p.name,
        "version": p.version,
        "category": p.category,
        "status": p.status,
        "owner": p.owner,
        "approver": p.approver,
        "description": p.description,
        "scope": p.scope,
        "framework_refs": p.framework_refs or [],
        "acknowledgment_required": p.acknowledgment_required,
        "acknowledgment_rate": p.acknowledgment_rate,
        "effective_date": p.effective_date.isoformat() if p.effective_date else None,
        "review_date": p.review_date.isoformat() if p.review_date else None,
        "created_at": p.created_at.isoformat() if p.created_at else None,
    }


@router.get("/")
def list_policies(status: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(Policy)
    if status:
        q = q.filter(Policy.status == status)
    return [policy_to_dict(p) for p in q.all()]


@router.get("/{policy_id}")
def get_policy(policy_id: str, db: Session = Depends(get_db)):
    p = db.query(Policy).filter(Policy.id == policy_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Policy not found")
    data = policy_to_dict(p)
    data["acknowledgments"] = [
        {
            "user_id": a.user_id,
            "user_name": a.user_name,
            "user_team": a.user_team,
            "acknowledged_at": a.acknowledged_at.isoformat() if a.acknowledged_at else None,
        }
        for a in p.acknowledgments[-20:]
    ]
    return data


@router.post("/")
def create_policy(payload: PolicyCreate, db: Session = Depends(get_db)):
    count = db.query(Policy).count()
    policy = Policy(
        id=str(uuid.uuid4()),
        policy_id=f"POL-{count + 1:03d}",
        name=payload.name,
        category=payload.category,
        owner=payload.owner,
        approver=payload.approver,
        description=payload.description,
        content=payload.content,
        scope=payload.scope,
        framework_refs=payload.framework_refs or [],
        acknowledgment_required=payload.acknowledgment_required,
        status="draft",
    )
    db.add(policy)
    db.commit()
    db.refresh(policy)
    return policy_to_dict(policy)


@router.put("/{policy_id}/publish")
def publish_policy(policy_id: str, db: Session = Depends(get_db)):
    from datetime import datetime, timedelta
    p = db.query(Policy).filter(Policy.id == policy_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Policy not found")
    p.status = "published"
    p.effective_date = datetime.utcnow()
    p.review_date = datetime.utcnow() + timedelta(days=365)
    db.commit()
    return {"status": "published", "policy_id": policy_id}


@router.post("/{policy_id}/analyze-gaps")
def analyze_policy_gaps(policy_id: str, framework: str, db: Session = Depends(get_db)):
    p = db.query(Policy).filter(Policy.id == policy_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Policy not found")
    policies = [policy_to_dict(p)]
    result = ai_service.generate_policy_gaps(framework, policies)
    return result


@router.post("/{policy_id}/acknowledge")
def acknowledge_policy(policy_id: str, payload: dict, db: Session = Depends(get_db)):
    p = db.query(Policy).filter(Policy.id == policy_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Policy not found")
    ack = PolicyAcknowledgment(
        id=str(uuid.uuid4()),
        policy_id=policy_id,
        user_id=payload.get("user_id", "unknown"),
        user_name=payload.get("user_name"),
        user_team=payload.get("user_team"),
        version_acknowledged=p.version,
    )
    db.add(ack)
    total = db.query(PolicyAcknowledgment).filter(PolicyAcknowledgment.policy_id == policy_id).count() + 1
    p.acknowledgment_rate = min(100.0, total / 10 * 100)
    db.commit()
    return {"acknowledged": True}
