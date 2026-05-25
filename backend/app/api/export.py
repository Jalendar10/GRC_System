from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from ..core.database import get_db
import csv, io

router = APIRouter(prefix="/api/export", tags=["export"])

@router.get("/controls")
def export_controls(db: Session = Depends(get_db)):
    from ..models.control import Control
    items = db.query(Control).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Name", "Category", "Type", "Status", "Effectiveness Score", "Owner", "Team", "Frequency", "Last Tested", "Frameworks"])
    for c in items:
        writer.writerow([c.id, c.name, c.category, c.control_type, c.status, c.effectiveness_score, c.owner, c.owner_team, c.frequency, c.last_tested, "|".join(c.frameworks or [])])
    output.seek(0)
    return StreamingResponse(iter([output.getvalue()]), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=controls.csv"})

@router.get("/risks")
def export_risks(db: Session = Depends(get_db)):
    from ..models.risk import Risk
    items = db.query(Risk).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Title", "Category", "Status", "Inherent Score", "Residual Score", "Owner", "Business Line", "Financial Impact Low", "Financial Impact High"])
    for r in items:
        writer.writerow([r.id, r.title, r.category, r.status, r.inherent_score, r.residual_score, r.owner, r.business_line, r.financial_impact_low, r.financial_impact_high])
    output.seek(0)
    return StreamingResponse(iter([output.getvalue()]), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=risks.csv"})

@router.get("/audits")
def export_audits(db: Session = Depends(get_db)):
    from ..models.audit import Audit
    items = db.query(Audit).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Name", "Type", "Framework", "Status", "Overall Score", "Total Findings", "Critical Findings", "Period Start", "Period End"])
    for a in items:
        writer.writerow([a.id, a.name, a.audit_type, a.framework, a.status, a.overall_score, a.total_findings, a.critical_findings, a.period_start, a.period_end])
    output.seek(0)
    return StreamingResponse(iter([output.getvalue()]), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=audits.csv"})

@router.get("/vendors")
def export_vendors(db: Session = Depends(get_db)):
    from ..models.vendor import Vendor
    items = db.query(Vendor).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Name", "Type", "Category", "Status", "Risk Tier", "Risk Score", "Assessment Score", "Data Access", "Certifications", "Issues Count"])
    for v in items:
        writer.writerow([v.id, v.name, v.vendor_type, v.category, v.status, v.risk_tier, v.risk_score, v.assessment_score, v.data_access, "|".join(v.certifications or []), v.issues_count])
    output.seek(0)
    return StreamingResponse(iter([output.getvalue()]), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=vendors.csv"})
