from sqlalchemy import Column, String, Integer, Text, DateTime, Float, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base


class Risk(Base):
    __tablename__ = "risks"

    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    category = Column(String)  # operational, financial, compliance, strategic, reputational, cyber
    subcategory = Column(String)
    owner = Column(String)
    owner_team = Column(String)
    status = Column(String, default="open")  # open, mitigated, accepted, transferred, closed

    # Risk scoring (likelihood × impact)
    inherent_likelihood = Column(Integer, default=3)  # 1-5
    inherent_impact = Column(Integer, default=3)  # 1-5
    inherent_score = Column(Float, default=9.0)

    residual_likelihood = Column(Integer, default=2)
    residual_impact = Column(Integer, default=2)
    residual_score = Column(Float, default=4.0)

    risk_appetite = Column(String, default="moderate")  # low, moderate, high
    risk_tolerance = Column(Float, default=10.0)

    # Threat intelligence
    threat_actor = Column(String)
    threat_vector = Column(String)
    threat_likelihood_basis = Column(Text)

    # Financial impact
    financial_impact_low = Column(Float)
    financial_impact_high = Column(Float)
    regulatory_exposure = Column(Float)

    # Control linkage
    control_ids = Column(JSON, default=list)
    framework_refs = Column(JSON, default=list)

    # Basel III / FFIEC specific fields
    risk_event_type = Column(String)  # internal_fraud, external_fraud, employment_practices, etc.
    business_line = Column(String)
    loss_category = Column(String)

    review_date = Column(DateTime)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    treatments = relationship("RiskTreatment", back_populates="risk", cascade="all, delete-orphan")


class RiskTreatment(Base):
    __tablename__ = "risk_treatments"

    id = Column(String, primary_key=True)
    risk_id = Column(String, ForeignKey("risks.id"), nullable=False)
    treatment_type = Column(String)  # mitigate, accept, transfer, avoid
    description = Column(Text)
    owner = Column(String)
    due_date = Column(DateTime)
    status = Column(String, default="planned")  # planned, in_progress, completed, overdue
    completion_date = Column(DateTime)
    cost_estimate = Column(Float)
    effectiveness_rating = Column(Integer)  # 1-5
    created_at = Column(DateTime, server_default=func.now())

    risk = relationship("Risk", back_populates="treatments")
