from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..core.database import get_db
from ..models.control import Control
from ..models.risk import Risk
from ..models.audit import Audit, AuditFinding
from ..models.policy import Policy
from ..models.framework import Framework

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/summary")
def get_dashboard_summary(db: Session = Depends(get_db)):
    total_controls = db.query(Control).count()
    effective_controls = db.query(Control).filter(Control.status == "effective").count()
    automated_controls = db.query(Control).filter(Control.is_automated == True).count()

    total_risks = db.query(Risk).count()
    open_risks = db.query(Risk).filter(Risk.status == "open").count()
    high_risks = db.query(Risk).filter(
        Risk.status == "open",
        Risk.residual_score >= 12
    ).count()

    active_audits = db.query(Audit).filter(Audit.status.in_(["in_progress", "ai_review"])).count()
    completed_audits = db.query(Audit).filter(Audit.status == "completed").count()
    open_findings = db.query(AuditFinding).filter(AuditFinding.remediation_status == "open").count()
    critical_findings = db.query(AuditFinding).filter(
        AuditFinding.remediation_status == "open",
        AuditFinding.severity == "critical"
    ).count()

    total_policies = db.query(Policy).count()
    published_policies = db.query(Policy).filter(Policy.status == "published").count()
    avg_ack_rate = db.query(func.avg(Policy.acknowledgment_rate)).filter(
        Policy.status == "published"
    ).scalar() or 0

    frameworks = db.query(Framework).all()
    avg_compliance = sum(f.compliance_score for f in frameworks) / len(frameworks) if frameworks else 0

    control_effectiveness = (effective_controls / total_controls * 100) if total_controls else 0
    automation_rate = (automated_controls / total_controls * 100) if total_controls else 0

    return {
        "overall_compliance_score": round(avg_compliance, 1),
        "control_effectiveness_rate": round(control_effectiveness, 1),
        "automation_rate": round(automation_rate, 1),
        "controls": {
            "total": total_controls,
            "effective": effective_controls,
            "partially_effective": db.query(Control).filter(Control.status == "partially_effective").count(),
            "ineffective": db.query(Control).filter(Control.status == "ineffective").count(),
            "automated": automated_controls,
        },
        "risks": {
            "total": total_risks,
            "open": open_risks,
            "critical_high": high_risks,
            "mitigated": db.query(Risk).filter(Risk.status == "mitigated").count(),
        },
        "audits": {
            "active": active_audits,
            "completed": completed_audits,
            "open_findings": open_findings,
            "critical_findings": critical_findings,
        },
        "policies": {
            "total": total_policies,
            "published": published_policies,
            "avg_acknowledgment_rate": round(float(avg_ack_rate), 1),
        },
        "frameworks": [
            {
                "name": f.short_name,
                "score": f.compliance_score,
                "status": f.compliance_status,
            }
            for f in frameworks
        ],
    }


@router.get("/risk-heatmap")
def get_risk_heatmap(db: Session = Depends(get_db)):
    risks = db.query(Risk).filter(Risk.status == "open").all()
    heatmap = {}
    for r in risks:
        key = f"{r.residual_likelihood},{r.residual_impact}"
        if key not in heatmap:
            heatmap[key] = {"likelihood": r.residual_likelihood, "impact": r.residual_impact, "count": 0, "risks": []}
        heatmap[key]["count"] += 1
        heatmap[key]["risks"].append({"id": r.id, "title": r.title, "score": r.residual_score})
    return list(heatmap.values())


@router.get("/control-trends")
def get_control_trends(db: Session = Depends(get_db)):
    # Return simulated monthly trend data for charts
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
              "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    import random
    base = 72
    return [
        {
            "month": m,
            "compliance_score": min(99, base + i * 2 + random.randint(-2, 3)),
            "control_effectiveness": min(99, base - 5 + i * 2 + random.randint(-2, 3)),
            "automation_rate": min(99, 30 + i * 4 + random.randint(-1, 2)),
        }
        for i, m in enumerate(months)
    ]
