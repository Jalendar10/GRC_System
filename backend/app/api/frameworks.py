from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..models.framework import Framework, FrameworkControl
from typing import List, Dict, Any

router = APIRouter(prefix="/api/frameworks", tags=["frameworks"])


@router.get("/")
def list_frameworks(db: Session = Depends(get_db)):
    return [
        {
            "id": f.id,
            "name": f.name,
            "short_name": f.short_name,
            "version": f.version,
            "description": f.description,
            "category": f.category,
            "compliance_status": f.compliance_status,
            "compliance_score": f.compliance_score,
            "total_controls": f.total_controls,
            "implemented_controls": f.implemented_controls,
        }
        for f in db.query(Framework).all()
    ]


@router.post("/expand")
def expand_frameworks(db: Session = Depends(get_db)):
    """Add any missing frameworks that aren't in the database yet"""
    new_frameworks: List[Dict[str, Any]] = [
        {
            "id": "fw-gdpr", "name": "General Data Protection Regulation",
            "short_name": "GDPR", "version": "2018",
            "description": "EU regulation on data protection and privacy for all individuals within the EU",
            "category": "regulatory", "compliance_score": 73.5,
            "total_controls": 45, "implemented_controls": 33,
            "compliance_status": "in_progress",
        },
        {
            "id": "fw-ccpa", "name": "California Consumer Privacy Act / CPRA",
            "short_name": "CCPA-CPRA", "version": "2023",
            "description": "California privacy law granting consumers rights over their personal information",
            "category": "regulatory", "compliance_score": 81.0,
            "total_controls": 25, "implemented_controls": 20,
            "compliance_status": "in_progress",
        },
        {
            "id": "fw-hipaa", "name": "Health Insurance Portability and Accountability Act",
            "short_name": "HIPAA", "version": "2023",
            "description": "US regulation for protecting sensitive patient health information",
            "category": "regulatory", "compliance_score": 79.2,
            "total_controls": 42, "implemented_controls": 33,
            "compliance_status": "in_progress",
        },
        {
            "id": "fw-soc2", "name": "SOC 2 Type II — Trust Services Criteria",
            "short_name": "SOC 2", "version": "2017",
            "description": "AICPA framework for service organizations — Security, Availability, Confidentiality",
            "category": "standard", "compliance_score": 85.5,
            "total_controls": 64, "implemented_controls": 55,
            "compliance_status": "in_progress",
        },
        {
            "id": "fw-fedramp", "name": "Federal Risk and Authorization Management Program",
            "short_name": "FedRAMP", "version": "Rev5",
            "description": "US government cloud security authorization framework",
            "category": "regulatory", "compliance_score": 68.0,
            "total_controls": 325, "implemented_controls": 221,
            "compliance_status": "in_progress",
        },
        {
            "id": "fw-dora", "name": "Digital Operational Resilience Act",
            "short_name": "DORA", "version": "2025",
            "description": "EU regulation on digital operational resilience for financial entities",
            "category": "regulatory", "compliance_score": 62.3,
            "total_controls": 58, "implemented_controls": 36,
            "compliance_status": "in_progress",
        },
        {
            "id": "fw-nis2", "name": "Network and Information Security Directive 2",
            "short_name": "NIS2", "version": "2024",
            "description": "EU directive on cybersecurity measures for essential and important entities",
            "category": "regulatory", "compliance_score": 70.1,
            "total_controls": 35, "implemented_controls": 25,
            "compliance_status": "in_progress",
        },
        {
            "id": "fw-cmmc", "name": "Cybersecurity Maturity Model Certification",
            "short_name": "CMMC", "version": "2.0",
            "description": "DoD framework for protecting controlled unclassified information",
            "category": "regulatory", "compliance_score": 58.7,
            "total_controls": 110, "implemented_controls": 65,
            "compliance_status": "in_progress",
        },
        {
            "id": "fw-nist-800-53", "name": "NIST SP 800-53 Security and Privacy Controls",
            "short_name": "NIST 800-53", "version": "Rev5",
            "description": "Comprehensive catalog of security and privacy controls for federal systems",
            "category": "framework", "compliance_score": 74.8,
            "total_controls": 1077, "implemented_controls": 806,
            "compliance_status": "in_progress",
        },
        {
            "id": "fw-iso22301", "name": "ISO 22301 Business Continuity Management",
            "short_name": "ISO 22301", "version": "2019",
            "description": "International standard for business continuity management systems",
            "category": "standard", "compliance_score": 83.4,
            "total_controls": 30, "implemented_controls": 25,
            "compliance_status": "in_progress",
        },
        {
            "id": "fw-cis", "name": "CIS Critical Security Controls",
            "short_name": "CIS Controls", "version": "v8",
            "description": "Prioritized set of actions to protect organizations from common cyber attacks",
            "category": "framework", "compliance_score": 76.9,
            "total_controls": 153, "implemented_controls": 118,
            "compliance_status": "in_progress",
        },
        {
            "id": "fw-aml-bsa", "name": "Anti-Money Laundering / Bank Secrecy Act",
            "short_name": "AML-BSA", "version": "2024",
            "description": "US federal law requiring financial institutions to combat money laundering",
            "category": "regulatory", "compliance_score": 87.6,
            "total_controls": 28, "implemented_controls": 25,
            "compliance_status": "in_progress",
        },
        {
            "id": "fw-mifid2", "name": "Markets in Financial Instruments Directive II",
            "short_name": "MiFID II", "version": "2018",
            "description": "EU regulation on investment services and activities in financial markets",
            "category": "regulatory", "compliance_score": 79.5,
            "total_controls": 40, "implemented_controls": 32,
            "compliance_status": "in_progress",
        },
        {
            "id": "fw-apra", "name": "APRA CPS 234 Information Security",
            "short_name": "APRA CPS 234", "version": "2019",
            "description": "Australian Prudential Regulation Authority cybersecurity standard",
            "category": "regulatory", "compliance_score": 80.2,
            "total_controls": 22, "implemented_controls": 18,
            "compliance_status": "in_progress",
        },
        {
            "id": "fw-mas-trm", "name": "MAS Technology Risk Management Guidelines",
            "short_name": "MAS TRM", "version": "2021",
            "description": "Monetary Authority of Singapore technology risk management guidelines",
            "category": "regulatory", "compliance_score": 77.3,
            "total_controls": 35, "implemented_controls": 27,
            "compliance_status": "in_progress",
        },
        {
            "id": "fw-hitrust", "name": "HITRUST Common Security Framework",
            "short_name": "HITRUST CSF", "version": "11.0",
            "description": "Comprehensive security framework for healthcare and other industries",
            "category": "framework", "compliance_score": 71.8,
            "total_controls": 75, "implemented_controls": 54,
            "compliance_status": "in_progress",
        },
        {
            "id": "fw-cobit", "name": "COBIT 2019 — Governance of Enterprise IT",
            "short_name": "COBIT 2019", "version": "2019",
            "description": "Framework for governance and management of enterprise information and technology",
            "category": "framework", "compliance_score": 74.5,
            "total_controls": 40, "implemented_controls": 30,
            "compliance_status": "in_progress",
        },
        {
            "id": "fw-fisma", "name": "Federal Information Security Management Act",
            "short_name": "FISMA", "version": "2022",
            "description": "US law requiring federal agencies to develop information security programs",
            "category": "regulatory", "compliance_score": 69.3,
            "total_controls": 55, "implemented_controls": 38,
            "compliance_status": "in_progress",
        },
        {
            "id": "fw-finra", "name": "FINRA Rules and Regulations",
            "short_name": "FINRA", "version": "2024",
            "description": "Financial Industry Regulatory Authority rules for broker-dealers",
            "category": "regulatory", "compliance_score": 83.9,
            "total_controls": 32, "implemented_controls": 27,
            "compliance_status": "in_progress",
        },
    ]
    added = 0
    for fd in new_frameworks:
        existing = db.query(Framework).filter_by(id=fd["id"]).first()
        if not existing:
            db.add(Framework(**fd))
            added += 1
    db.commit()
    total = db.query(Framework).count()
    return {"added": added, "total": total}


@router.get("/{framework_id}/controls")
def get_framework_controls(framework_id: str, db: Session = Depends(get_db)):
    f = db.query(Framework).filter(Framework.id == framework_id).first()
    if not f:
        raise HTTPException(status_code=404, detail="Framework not found")
    return {
        "framework": f.name,
        "controls": [
            {
                "control_ref": c.control_ref,
                "control_name": c.control_name,
                "description": c.description,
                "status": c.status,
                "mapped_control_ids": c.mapped_control_ids,
                "gap_description": c.gap_description,
            }
            for c in f.controls
        ]
    }
