import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel
from ..core.database import get_db
from ..models.risk import Risk, RiskTreatment
from ..services.ai_service import ai_service

router = APIRouter(prefix="/api/risks", tags=["risks"])


class RiskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    category: str = "operational"
    subcategory: Optional[str] = None
    owner: Optional[str] = None
    owner_team: Optional[str] = None
    inherent_likelihood: int = 3
    inherent_impact: int = 3
    residual_likelihood: int = 2
    residual_impact: int = 2
    risk_appetite: str = "moderate"
    threat_actor: Optional[str] = None
    threat_vector: Optional[str] = None
    financial_impact_low: Optional[float] = None
    financial_impact_high: Optional[float] = None
    framework_refs: Optional[List[str]] = []
    control_ids: Optional[List[str]] = []
    business_line: Optional[str] = None
    risk_event_type: Optional[str] = None


def risk_to_dict(r: Risk) -> dict:
    return {
        "id": r.id,
        "title": r.title,
        "description": r.description,
        "category": r.category,
        "subcategory": r.subcategory,
        "owner": r.owner,
        "owner_team": r.owner_team,
        "status": r.status,
        "inherent_likelihood": r.inherent_likelihood,
        "inherent_impact": r.inherent_impact,
        "inherent_score": r.inherent_score,
        "residual_likelihood": r.residual_likelihood,
        "residual_impact": r.residual_impact,
        "residual_score": r.residual_score,
        "risk_appetite": r.risk_appetite,
        "risk_tolerance": r.risk_tolerance,
        "threat_actor": r.threat_actor,
        "threat_vector": r.threat_vector,
        "financial_impact_low": r.financial_impact_low,
        "financial_impact_high": r.financial_impact_high,
        "regulatory_exposure": r.regulatory_exposure,
        "control_ids": r.control_ids or [],
        "framework_refs": r.framework_refs or [],
        "business_line": r.business_line,
        "risk_event_type": r.risk_event_type,
        "review_date": r.review_date.isoformat() if r.review_date else None,
        "created_at": r.created_at.isoformat() if r.created_at else None,
        "treatments": [
            {
                "id": t.id,
                "treatment_type": t.treatment_type,
                "description": t.description,
                "owner": t.owner,
                "due_date": t.due_date.isoformat() if t.due_date else None,
                "status": t.status,
            }
            for t in r.treatments
        ],
    }


@router.get("/")
def list_risks(
    category: Optional[str] = None,
    status: Optional[str] = None,
    owner_team: Optional[str] = None,
    search: Optional[str] = None,
    page: int = 1,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    from sqlalchemy import or_
    limit = min(limit, 200)
    q = db.query(Risk)
    if category:
        q = q.filter(Risk.category == category)
    if status:
        q = q.filter(Risk.status == status)
    if owner_team:
        q = q.filter(Risk.owner_team == owner_team)
    if search:
        q = q.filter(or_(
            Risk.title.ilike(f"%{search}%"),
            Risk.description.ilike(f"%{search}%"),
            Risk.owner.ilike(f"%{search}%"),
        ))
    total = q.count()
    risks = q.order_by(Risk.created_at.desc()).offset((page - 1) * limit).limit(limit).all()
    return {
        "items": [risk_to_dict(r) for r in risks],
        "total": total,
        "page": page,
        "limit": limit,
        "pages": max(1, -(-total // limit)),
    }


@router.get("/{risk_id}")
def get_risk(risk_id: str, db: Session = Depends(get_db)):
    r = db.query(Risk).filter(Risk.id == risk_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Risk not found")
    return risk_to_dict(r)


@router.post("/")
def create_risk(payload: RiskCreate, db: Session = Depends(get_db)):
    risk = Risk(
        id=f"RISK-{str(uuid.uuid4())[:8].upper()}",
        title=payload.title,
        description=payload.description,
        category=payload.category,
        subcategory=payload.subcategory,
        owner=payload.owner,
        owner_team=payload.owner_team,
        inherent_likelihood=payload.inherent_likelihood,
        inherent_impact=payload.inherent_impact,
        inherent_score=float(payload.inherent_likelihood * payload.inherent_impact),
        residual_likelihood=payload.residual_likelihood,
        residual_impact=payload.residual_impact,
        residual_score=float(payload.residual_likelihood * payload.residual_impact),
        risk_appetite=payload.risk_appetite,
        threat_actor=payload.threat_actor,
        threat_vector=payload.threat_vector,
        financial_impact_low=payload.financial_impact_low,
        financial_impact_high=payload.financial_impact_high,
        framework_refs=payload.framework_refs or [],
        control_ids=payload.control_ids or [],
        business_line=payload.business_line,
        risk_event_type=payload.risk_event_type,
    )
    db.add(risk)
    db.commit()
    db.refresh(risk)
    return risk_to_dict(risk)


@router.post("/{risk_id}/assess")
def ai_assess_risk(risk_id: str, db: Session = Depends(get_db)):
    r = db.query(Risk).filter(Risk.id == risk_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Risk not found")

    analysis = ai_service.analyze_risk(risk_to_dict(r), [], None)

    r.residual_score = analysis.get("residual_score", r.residual_score)
    r.regulatory_exposure = analysis.get("financial_exposure_estimate", {}).get("expected")
    db.commit()

    return {"risk_id": risk_id, "assessment": analysis}


@router.put("/{risk_id}")
def update_risk(risk_id: str, payload: dict, db: Session = Depends(get_db)):
    r = db.query(Risk).filter(Risk.id == risk_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Risk not found")
    for field, val in payload.items():
        if hasattr(r, field):
            setattr(r, field, val)
    if "residual_likelihood" in payload or "residual_impact" in payload:
        r.residual_score = float(r.residual_likelihood * r.residual_impact)
    if "inherent_likelihood" in payload or "inherent_impact" in payload:
        r.inherent_score = float(r.inherent_likelihood * r.inherent_impact)
    db.commit()
    db.refresh(r)
    return risk_to_dict(r)
