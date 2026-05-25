from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, JSON, ForeignKey
from sqlalchemy.sql import func
from ..core.database import Base

class Vendor(Base):
    __tablename__ = "vendors"
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    vendor_type = Column(String)  # saas, infrastructure, consulting, data_processor, cloud
    category = Column(String)  # technology, financial, legal, hr, security, operations
    status = Column(String, default="active")  # active, under_review, suspended, terminated
    risk_tier = Column(Integer, default=3)  # 1=critical, 2=high, 3=medium, 4=low
    risk_score = Column(Float, default=50.0)
    primary_contact = Column(String)
    contact_email = Column(String)
    contact_phone = Column(String)
    website = Column(String)
    country = Column(String)
    contract_start = Column(DateTime)
    contract_end = Column(DateTime)
    contract_value = Column(Float)
    review_date = Column(DateTime)
    next_assessment_date = Column(DateTime)
    services_provided = Column(JSON, default=list)
    data_access = Column(Boolean, default=False)
    data_types = Column(JSON, default=list)  # pii, financial, health, confidential
    systems_access = Column(JSON, default=list)
    certifications = Column(JSON, default=list)  # ISO 27001, SOC 2, PCI-DSS etc
    last_assessed = Column(DateTime)
    assessment_score = Column(Float)
    ai_assessment = Column(Text)
    issues_count = Column(Integer, default=0)
    critical_issues = Column(Integer, default=0)
    notes = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

class VendorAssessment(Base):
    __tablename__ = "vendor_assessments"
    id = Column(String, primary_key=True)
    vendor_id = Column(String, ForeignKey("vendors.id"), nullable=False)
    assessment_date = Column(DateTime, server_default=func.now())
    assessor = Column(String)
    overall_score = Column(Float)
    security_score = Column(Float)
    compliance_score = Column(Float)
    operational_score = Column(Float)
    financial_score = Column(Float)
    findings = Column(JSON, default=list)
    recommendations = Column(JSON, default=list)
    ai_generated = Column(Boolean, default=False)
    next_review = Column(DateTime)
    created_at = Column(DateTime, server_default=func.now())
