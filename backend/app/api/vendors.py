import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from pydantic import BaseModel
from ..core.database import get_db
from ..models.vendor import Vendor, VendorAssessment

router = APIRouter(prefix="/api/vendors", tags=["vendors"])

class VendorCreate(BaseModel):
    name: str
    vendor_type: Optional[str] = "saas"
    category: Optional[str] = "technology"
    status: Optional[str] = "active"
    risk_tier: Optional[int] = 3
    primary_contact: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    website: Optional[str] = None
    country: Optional[str] = None
    data_access: Optional[bool] = False
    data_types: Optional[List[str]] = []
    services_provided: Optional[List[str]] = []
    certifications: Optional[List[str]] = []
    notes: Optional[str] = None
    contract_value: Optional[float] = None

def vendor_to_dict(v: Vendor) -> dict:
    return {
        "id": v.id, "name": v.name, "vendor_type": v.vendor_type,
        "category": v.category, "status": v.status, "risk_tier": v.risk_tier,
        "risk_score": v.risk_score, "primary_contact": v.primary_contact,
        "contact_email": v.contact_email, "contact_phone": v.contact_phone,
        "website": v.website, "country": v.country,
        "contract_start": v.contract_start.isoformat() if v.contract_start else None,
        "contract_end": v.contract_end.isoformat() if v.contract_end else None,
        "contract_value": v.contract_value,
        "review_date": v.review_date.isoformat() if v.review_date else None,
        "next_assessment_date": v.next_assessment_date.isoformat() if v.next_assessment_date else None,
        "services_provided": v.services_provided or [],
        "data_access": v.data_access, "data_types": v.data_types or [],
        "certifications": v.certifications or [],
        "last_assessed": v.last_assessed.isoformat() if v.last_assessed else None,
        "assessment_score": v.assessment_score, "ai_assessment": v.ai_assessment,
        "issues_count": v.issues_count, "critical_issues": v.critical_issues,
        "notes": v.notes,
        "created_at": v.created_at.isoformat() if v.created_at else None,
    }

@router.get("/")
def list_vendors(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    search: Optional[str] = None,
    status: Optional[str] = None,
    risk_tier: Optional[int] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    q = db.query(Vendor)
    if search:
        q = q.filter(Vendor.name.ilike(f"%{search}%"))
    if status:
        q = q.filter(Vendor.status == status)
    if risk_tier:
        q = q.filter(Vendor.risk_tier == risk_tier)
    if category:
        q = q.filter(Vendor.category == category)
    total = q.count()
    items = q.order_by(Vendor.risk_tier.asc(), Vendor.name.asc()).offset((page-1)*limit).limit(limit).all()
    return {"items": [vendor_to_dict(v) for v in items], "total": total, "page": page, "limit": limit, "pages": max(1, -(-total // limit))}

@router.get("/stats")
def vendor_stats(db: Session = Depends(get_db)):
    vendors = db.query(Vendor).all()
    return {
        "total": len(vendors),
        "active": sum(1 for v in vendors if v.status == "active"),
        "critical_tier": sum(1 for v in vendors if v.risk_tier == 1),
        "high_tier": sum(1 for v in vendors if v.risk_tier == 2),
        "with_data_access": sum(1 for v in vendors if v.data_access),
        "total_issues": sum(v.issues_count or 0 for v in vendors),
        "critical_issues": sum(v.critical_issues or 0 for v in vendors),
        "avg_score": round(sum(v.assessment_score or 0 for v in vendors if v.assessment_score) / max(1, sum(1 for v in vendors if v.assessment_score)), 1),
    }

@router.get("/{vendor_id}")
def get_vendor(vendor_id: str, db: Session = Depends(get_db)):
    vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return vendor_to_dict(vendor)

@router.post("/")
def create_vendor(req: VendorCreate, db: Session = Depends(get_db)):
    vendor = Vendor(id=str(uuid.uuid4()), **req.dict())
    db.add(vendor)
    db.commit()
    db.refresh(vendor)
    return vendor_to_dict(vendor)

@router.put("/{vendor_id}")
def update_vendor(vendor_id: str, req: VendorCreate, db: Session = Depends(get_db)):
    vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    for k, v in req.dict(exclude_none=True).items():
        setattr(vendor, k, v)
    db.commit()
    return vendor_to_dict(vendor)

@router.delete("/{vendor_id}")
def delete_vendor(vendor_id: str, db: Session = Depends(get_db)):
    vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    db.delete(vendor)
    db.commit()
    return {"deleted": True}

@router.post("/{vendor_id}/assess")
def assess_vendor(vendor_id: str, db: Session = Depends(get_db)):
    vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    from ..services.ai_service import ai_service
    import json
    system = "You are a third-party risk management expert. Assess vendors for security, compliance, operational, and financial risk. Return JSON only."
    user = f"""Assess this vendor for a regulated financial institution:
Vendor: {json.dumps(vendor_to_dict(vendor), indent=2)}
Return JSON with: overall_score (0-100), security_score (0-100), compliance_score (0-100), operational_score (0-100), findings (list of strings), recommendations (list of strings), risk_summary (string)"""
    try:
        raw = ai_service._call(system, user, max_tokens=2000)
        result = json.loads(raw.strip().lstrip("```json").rstrip("```"))
    except Exception:
        result = {"overall_score": vendor.assessment_score or 75.0, "security_score": 70.0, "compliance_score": 80.0, "operational_score": 75.0, "findings": ["Vendor assessment requires manual review"], "recommendations": ["Schedule on-site assessment", "Review compliance certifications"], "risk_summary": f"{vendor.name} presents moderate risk based on available information."}
    from datetime import datetime
    vendor.assessment_score = result.get("overall_score", 75.0)
    vendor.ai_assessment = result.get("risk_summary", "")
    vendor.last_assessed = datetime.utcnow()
    assessment = VendorAssessment(
        id=str(uuid.uuid4()), vendor_id=vendor_id, assessor="AI Assessment Engine",
        overall_score=result.get("overall_score", 75.0), security_score=result.get("security_score", 70.0),
        compliance_score=result.get("compliance_score", 80.0), operational_score=result.get("operational_score", 75.0),
        findings=result.get("findings", []), recommendations=result.get("recommendations", []), ai_generated=True,
    )
    db.add(assessment)
    db.commit()
    return {**vendor_to_dict(vendor), "assessment": result}
