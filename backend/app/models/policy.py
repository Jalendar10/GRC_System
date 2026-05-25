from sqlalchemy import Column, String, Integer, Text, DateTime, Float, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base


class Policy(Base):
    __tablename__ = "policies"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    policy_id = Column(String, unique=True)  # e.g. POL-001
    version = Column(String, default="1.0")
    category = Column(String)  # information_security, data_privacy, acceptable_use, etc.
    status = Column(String, default="draft")  # draft, review, approved, published, retired
    owner = Column(String)
    approver = Column(String)
    description = Column(Text)
    content = Column(Text)
    scope = Column(Text)
    framework_refs = Column(JSON, default=list)
    tags = Column(JSON, default=list)

    # Review lifecycle
    effective_date = Column(DateTime)
    review_date = Column(DateTime)
    expiry_date = Column(DateTime)
    last_reviewed = Column(DateTime)

    # Acknowledgment tracking
    acknowledgment_required = Column(Boolean, default=True)
    acknowledgment_deadline = Column(DateTime)
    acknowledgment_rate = Column(Float, default=0.0)

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    acknowledgments = relationship("PolicyAcknowledgment", back_populates="policy", cascade="all, delete-orphan")


class PolicyAcknowledgment(Base):
    __tablename__ = "policy_acknowledgments"

    id = Column(String, primary_key=True)
    policy_id = Column(String, ForeignKey("policies.id"), nullable=False)
    user_id = Column(String, nullable=False)
    user_name = Column(String)
    user_team = Column(String)
    acknowledged_at = Column(DateTime, server_default=func.now())
    ip_address = Column(String)
    version_acknowledged = Column(String)

    policy = relationship("Policy", back_populates="acknowledgments")
