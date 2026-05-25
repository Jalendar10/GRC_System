from sqlalchemy import Column, String, Integer, Text, DateTime, Float, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base


class Framework(Base):
    __tablename__ = "frameworks"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    short_name = Column(String)  # PCI-DSS, SOX, ISO27001, SOC2, FFIEC, NIST-CSF
    version = Column(String)
    description = Column(Text)
    category = Column(String)  # regulatory, standard, framework
    applicable_industries = Column(JSON, default=list)
    compliance_status = Column(String, default="in_progress")
    compliance_score = Column(Float, default=0.0)
    total_controls = Column(Integer, default=0)
    implemented_controls = Column(Integer, default=0)
    last_assessment = Column(DateTime)
    next_assessment = Column(DateTime)
    created_at = Column(DateTime, server_default=func.now())

    controls = relationship("FrameworkControl", back_populates="framework", cascade="all, delete-orphan")


class FrameworkControl(Base):
    __tablename__ = "framework_controls"

    id = Column(String, primary_key=True)
    framework_id = Column(String, ForeignKey("frameworks.id"), nullable=False)
    control_ref = Column(String)  # e.g. PCI DSS 3.4.1
    control_name = Column(String)
    description = Column(Text)
    requirement = Column(Text)
    mapped_control_ids = Column(JSON, default=list)
    status = Column(String, default="not_assessed")
    gap_description = Column(Text)

    framework = relationship("Framework", back_populates="controls")
