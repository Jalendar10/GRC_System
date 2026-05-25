from sqlalchemy import Column, String, Boolean, DateTime, Text
from sqlalchemy.sql import func
from ..core.database import Base

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    body = Column(Text)
    notification_type = Column(String, default="info")  # alert, warning, info, success, critical
    category = Column(String)  # control, risk, audit, policy, compliance, vendor, incident
    entity_id = Column(String)
    entity_type = Column(String)
    action_url = Column(String)
    read = Column(Boolean, default=False)
    read_at = Column(DateTime)
    created_at = Column(DateTime, server_default=func.now())
