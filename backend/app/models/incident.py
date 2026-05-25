from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, JSON, ForeignKey
from sqlalchemy.sql import func
from ..core.database import Base

class Incident(Base):
    __tablename__ = "incidents"
    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    incident_type = Column(String)  # data_breach, system_outage, fraud, cyberattack, compliance_violation, operational
    severity = Column(String, default="medium")  # critical, high, medium, low
    status = Column(String, default="open")  # open, investigating, contained, resolved, closed
    category = Column(String)  # cyber, operational, financial, regulatory, vendor
    detected_at = Column(DateTime)
    reported_at = Column(DateTime, server_default=func.now())
    contained_at = Column(DateTime)
    resolved_at = Column(DateTime)
    closed_at = Column(DateTime)
    affected_systems = Column(JSON, default=list)
    affected_users_count = Column(Integer, default=0)
    data_compromised = Column(Boolean, default=False)
    data_types_affected = Column(JSON, default=list)
    financial_impact = Column(Float, default=0)
    reputational_impact = Column(String)  # none, low, medium, high, severe
    regulatory_notification_required = Column(Boolean, default=False)
    regulatory_notified_at = Column(DateTime)
    regulatory_frameworks = Column(JSON, default=list)
    reporter = Column(String)
    assigned_to = Column(String)
    root_cause = Column(Text)
    lessons_learned = Column(Text)
    ai_analysis = Column(Text)
    related_risk_id = Column(String)
    related_control_id = Column(String)
    evidence_refs = Column(JSON, default=list)
    timeline = Column(JSON, default=list)  # list of {timestamp, action, actor, notes}
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
