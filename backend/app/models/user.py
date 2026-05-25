from sqlalchemy import Column, String, DateTime, Boolean, JSON
from sqlalchemy.sql import func
from ..core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True)
    email = Column(String, unique=True, nullable=False)
    full_name = Column(String)
    name = Column(String)  # kept for backward compatibility
    role = Column(String, default="grc_manager")  # admin, grc_manager, auditor, risk_owner, viewer
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    department = Column(String)
    phone = Column(String)
    team = Column(String)
    permissions = Column(JSON, default=list)
    last_login = Column(DateTime)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
