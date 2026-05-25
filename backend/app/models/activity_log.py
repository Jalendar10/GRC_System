from sqlalchemy import Column, String, DateTime, Text, JSON
from sqlalchemy.sql import func
from ..core.database import Base

class ActivityLog(Base):
    __tablename__ = "activity_logs"
    id = Column(String, primary_key=True)
    user_id = Column(String)
    user_name = Column(String, default="System")
    action = Column(String, nullable=False)  # create, update, delete, run, publish, approve
    entity_type = Column(String)  # control, risk, audit, policy, framework, vendor, incident
    entity_id = Column(String)
    entity_name = Column(String)
    description = Column(Text)
    old_value = Column(JSON)
    new_value = Column(JSON)
    ip_address = Column(String)
    status = Column(String, default="success")  # success, failed
    created_at = Column(DateTime, server_default=func.now())
