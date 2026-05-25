from sqlalchemy import Column, String, Boolean, DateTime, Text
from sqlalchemy.sql import func
from ..core.database import Base


class AIProviderConfig(Base):
    __tablename__ = "ai_provider_configs"

    id = Column(String, primary_key=True)
    provider = Column(String, nullable=False)
    display_name = Column(String)
    model = Column(String, nullable=False)
    api_key = Column(String)
    api_base_url = Column(String)
    is_active = Column(Boolean, default=False)
    is_tested = Column(Boolean, default=False)
    test_status = Column(String)
    test_message = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
