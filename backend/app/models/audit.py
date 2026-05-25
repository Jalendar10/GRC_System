from sqlalchemy import Column, String, Integer, Text, DateTime, Float, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base


class Audit(Base):
    __tablename__ = "audits"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    audit_type = Column(String)  # internal, external, regulatory, sox, pci, iso27001, soc2, ffiec
    framework = Column(String)
    scope = Column(Text)
    status = Column(String, default="planned")  # planned, in_progress, ai_review, completed, closed
    auditor = Column(String)
    audit_lead = Column(String)

    period_start = Column(DateTime)
    period_end = Column(DateTime)
    scheduled_start = Column(DateTime)
    scheduled_end = Column(DateTime)
    actual_start = Column(DateTime)
    actual_end = Column(DateTime)

    # Overall scores
    overall_score = Column(Float)
    compliance_rate = Column(Float)
    control_ids = Column(JSON, default=list)

    # AI automation
    ai_assisted = Column(Boolean, default=True)
    ai_analysis_summary = Column(Text)
    ai_risk_narrative = Column(Text)
    ai_recommendations = Column(JSON, default=list)

    # Outcomes
    total_findings = Column(Integer, default=0)
    critical_findings = Column(Integer, default=0)
    high_findings = Column(Integer, default=0)
    medium_findings = Column(Integer, default=0)
    low_findings = Column(Integer, default=0)

    report_url = Column(String)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    findings = relationship("AuditFinding", back_populates="audit", cascade="all, delete-orphan")


class AuditFinding(Base):
    __tablename__ = "audit_findings"

    id = Column(String, primary_key=True)
    audit_id = Column(String, ForeignKey("audits.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text)
    severity = Column(String)  # critical, high, medium, low, informational
    finding_type = Column(String)  # deficiency, exception, observation, best_practice
    control_id = Column(String)
    framework_ref = Column(String)
    root_cause = Column(Text)
    risk_impact = Column(Text)
    recommendation = Column(Text)
    management_response = Column(Text)
    remediation_owner = Column(String)
    remediation_due = Column(DateTime)
    remediation_status = Column(String, default="open")
    evidence_refs = Column(JSON, default=list)
    ai_generated = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())

    audit = relationship("Audit", back_populates="findings")
