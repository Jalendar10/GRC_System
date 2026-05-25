from sqlalchemy import Column, String, Integer, Text, DateTime, Float, Boolean, ForeignKey, JSON, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from ..core.database import Base


class ControlStatus(str, enum.Enum):
    effective = "effective"
    partially_effective = "partially_effective"
    ineffective = "ineffective"
    not_tested = "not_tested"
    not_applicable = "not_applicable"


class ControlCategory(str, enum.Enum):
    access_control = "access_control"
    change_management = "change_management"
    incident_response = "incident_response"
    data_protection = "data_protection"
    vulnerability_management = "vulnerability_management"
    vendor_management = "vendor_management"
    business_continuity = "business_continuity"
    audit_logging = "audit_logging"
    encryption = "encryption"
    physical_security = "physical_security"
    network_security = "network_security"
    identity_management = "identity_management"


class ControlType(str, enum.Enum):
    preventive = "preventive"
    detective = "detective"
    corrective = "corrective"
    directive = "directive"
    compensating = "compensating"


class Control(Base):
    __tablename__ = "controls"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    category = Column(String)
    control_type = Column(String)
    owner = Column(String)
    owner_team = Column(String)
    status = Column(String, default=ControlStatus.not_tested)
    effectiveness_score = Column(Float, default=0.0)
    automation_level = Column(String, default="manual")  # manual, semi-auto, automated
    frequency = Column(String, default="annual")  # continuous, daily, weekly, monthly, quarterly, annual
    last_tested = Column(DateTime)
    next_test_due = Column(DateTime)
    frameworks = Column(JSON, default=list)  # ["PCI-DSS 3.4", "SOX CC6.1"]
    tags = Column(JSON, default=list)
    code_definition = Column(Text)  # YAML GRC-as-Code definition
    integration_source = Column(String)  # aws, azure, gcp, okta, etc.
    is_automated = Column(Boolean, default=False)
    risk_ids = Column(JSON, default=list)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    tests = relationship("ControlTest", back_populates="control", cascade="all, delete-orphan")
    evidence = relationship("ControlEvidence", back_populates="control", cascade="all, delete-orphan")


class ControlTest(Base):
    __tablename__ = "control_tests"

    id = Column(String, primary_key=True)
    control_id = Column(String, ForeignKey("controls.id"), nullable=False)
    test_date = Column(DateTime, server_default=func.now())
    tester = Column(String)
    test_method = Column(String)  # automated, manual, ai_assisted
    result = Column(String)  # pass, fail, partial, exception
    score = Column(Float)
    findings = Column(Text)
    ai_analysis = Column(Text)
    evidence_refs = Column(JSON, default=list)
    remediation_required = Column(Boolean, default=False)
    remediation_due = Column(DateTime)
    created_at = Column(DateTime, server_default=func.now())

    control = relationship("Control", back_populates="tests")


class ControlEvidence(Base):
    __tablename__ = "control_evidence"

    id = Column(String, primary_key=True)
    control_id = Column(String, ForeignKey("controls.id"), nullable=False)
    evidence_type = Column(String)  # screenshot, log_export, api_response, report, config
    source = Column(String)
    description = Column(Text)
    collected_at = Column(DateTime, server_default=func.now())
    collected_by = Column(String)  # user_id or "automated"
    file_path = Column(String)
    evidence_metadata = Column(JSON, default=dict)
    is_automated = Column(Boolean, default=False)
    period_start = Column(DateTime)
    period_end = Column(DateTime)

    control = relationship("Control", back_populates="evidence")
