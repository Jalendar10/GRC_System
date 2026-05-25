import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime, timedelta
from pydantic import BaseModel
from ..core.database import get_db
from ..models.audit import Audit, AuditFinding
from ..models.control import Control, ControlEvidence
from ..services.ai_service import ai_service

router = APIRouter(prefix="/api/audits", tags=["audits"])


class AuditCreate(BaseModel):
    name: str
    audit_type: str = "internal"
    framework: Optional[str] = None
    scope: Optional[str] = None
    auditor: Optional[str] = None
    audit_lead: Optional[str] = None
    period_start: Optional[str] = None
    period_end: Optional[str] = None
    control_ids: Optional[List[str]] = []
    ai_assisted: bool = True


def audit_to_dict(a: Audit) -> dict:
    return {
        "id": a.id,
        "name": a.name,
        "audit_type": a.audit_type,
        "framework": a.framework,
        "scope": a.scope,
        "status": a.status,
        "auditor": a.auditor,
        "audit_lead": a.audit_lead,
        "period_start": a.period_start.isoformat() if a.period_start else None,
        "period_end": a.period_end.isoformat() if a.period_end else None,
        "overall_score": a.overall_score,
        "compliance_rate": a.compliance_rate,
        "ai_assisted": a.ai_assisted,
        "ai_analysis_summary": a.ai_analysis_summary,
        "ai_risk_narrative": a.ai_risk_narrative,
        "ai_recommendations": a.ai_recommendations or [],
        "total_findings": a.total_findings,
        "critical_findings": a.critical_findings,
        "high_findings": a.high_findings,
        "medium_findings": a.medium_findings,
        "low_findings": a.low_findings,
        "control_ids": a.control_ids or [],
        "created_at": a.created_at.isoformat() if a.created_at else None,
        "findings": [
            {
                "id": f.id,
                "title": f.title,
                "severity": f.severity,
                "finding_type": f.finding_type,
                "description": f.description,
                "root_cause": f.root_cause,
                "recommendation": f.recommendation,
                "remediation_owner": f.remediation_owner,
                "remediation_due": f.remediation_due.isoformat() if f.remediation_due else None,
                "remediation_status": f.remediation_status,
                "ai_generated": f.ai_generated,
            }
            for f in a.findings
        ],
    }


@router.get("/")
def list_audits(status: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(Audit)
    if status:
        q = q.filter(Audit.status == status)
    return [audit_to_dict(a) for a in q.order_by(Audit.created_at.desc()).all()]


@router.get("/{audit_id}")
def get_audit(audit_id: str, db: Session = Depends(get_db)):
    a = db.query(Audit).filter(Audit.id == audit_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Audit not found")
    return audit_to_dict(a)


@router.post("/")
def create_audit(payload: AuditCreate, db: Session = Depends(get_db)):
    audit = Audit(
        id=f"AUD-{str(uuid.uuid4())[:8].upper()}",
        name=payload.name,
        audit_type=payload.audit_type,
        framework=payload.framework,
        scope=payload.scope,
        auditor=payload.auditor,
        audit_lead=payload.audit_lead,
        period_start=datetime.fromisoformat(payload.period_start) if payload.period_start else None,
        period_end=datetime.fromisoformat(payload.period_end) if payload.period_end else None,
        control_ids=payload.control_ids or [],
        ai_assisted=payload.ai_assisted,
        status="planned",
    )
    db.add(audit)
    db.commit()
    db.refresh(audit)
    return audit_to_dict(audit)


@router.post("/{audit_id}/run")
def run_audit(audit_id: str, db: Session = Depends(get_db)):
    """Execute a fully automated AI-powered audit."""
    audit = db.query(Audit).filter(Audit.id == audit_id).first()
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")

    audit.status = "in_progress"
    audit.actual_start = datetime.utcnow()
    db.commit()

    # Gather controls and evidence
    control_ids = audit.control_ids or []
    controls = []
    evidence = []

    if control_ids:
        controls_q = db.query(Control).filter(Control.id.in_(control_ids)).all()
    else:
        controls_q = db.query(Control).all()

    for c in controls_q:
        ctrl_dict = {
            "id": c.id,
            "name": c.name,
            "category": c.category,
            "status": c.status,
            "effectiveness_score": c.effectiveness_score,
            "frameworks": c.frameworks,
        }
        controls.append(ctrl_dict)
        for ev in c.evidence[-3:]:
            evidence.append({
                "control_id": c.id,
                "source": ev.source,
                "evidence_type": ev.evidence_type,
                "metadata": ev.evidence_metadata,
            })

    audit.status = "ai_review"
    db.commit()

    # Run AI audit
    audit_data = {
        "name": audit.name,
        "audit_type": audit.audit_type,
        "framework": audit.framework,
        "scope": audit.scope,
    }
    ai_result = ai_service.run_automated_audit(audit_data, controls, evidence)

    # Persist findings
    severities = {"critical": 0, "high": 0, "medium": 0, "low": 0}
    for f_data in ai_result.get("findings", []):
        sev = f_data.get("severity", "medium")
        severities[sev] = severities.get(sev, 0) + 1
        finding = AuditFinding(
            id=str(uuid.uuid4()),
            audit_id=audit_id,
            title=f_data.get("title", "Unnamed finding"),
            description=f_data.get("description", ""),
            severity=sev,
            finding_type=f_data.get("finding_type", "deficiency"),
            control_id=f_data.get("control_id"),
            framework_ref=f_data.get("framework_ref", ""),
            root_cause=f_data.get("root_cause", ""),
            recommendation=f_data.get("recommendation", ""),
            remediation_due=datetime.utcnow() + timedelta(days=30 if sev == "critical" else 90),
            remediation_status="open",
            ai_generated=True,
        )
        db.add(finding)

    audit.status = "completed"
    audit.actual_end = datetime.utcnow()
    audit.overall_score = ai_result.get("overall_score", 75.0)
    audit.compliance_rate = ai_result.get("overall_compliance_rate", 0.75)
    audit.ai_analysis_summary = ai_result.get("executive_summary", "")
    audit.ai_risk_narrative = ai_result.get("risk_narrative", "")
    audit.ai_recommendations = ai_result.get("management_recommendations", [])
    audit.total_findings = sum(severities.values())
    audit.critical_findings = severities.get("critical", 0)
    audit.high_findings = severities.get("high", 0)
    audit.medium_findings = severities.get("medium", 0)
    audit.low_findings = severities.get("low", 0)

    db.commit()
    db.refresh(audit)
    return audit_to_dict(audit)


@router.put("/{audit_id}/findings/{finding_id}")
def update_finding(audit_id: str, finding_id: str, payload: dict, db: Session = Depends(get_db)):
    f = db.query(AuditFinding).filter(
        AuditFinding.id == finding_id,
        AuditFinding.audit_id == audit_id
    ).first()
    if not f:
        raise HTTPException(status_code=404, detail="Finding not found")
    for field, val in payload.items():
        if hasattr(f, field):
            setattr(f, field, val)
    db.commit()
    return {"status": "updated"}
