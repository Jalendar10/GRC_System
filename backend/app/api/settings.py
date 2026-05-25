import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from ..core.database import get_db
from ..models.settings import AIProviderConfig
from ..services import ai_service as ai_module

router = APIRouter(prefix="/api/settings", tags=["settings"])

PROVIDER_MODELS = ai_module.PROVIDER_MODELS
PROVIDER_DISPLAY = ai_module.PROVIDER_DISPLAY


class ProviderTestRequest(BaseModel):
    provider: str
    model: str
    api_key: str
    api_base_url: Optional[str] = None


class ProviderSaveRequest(BaseModel):
    provider: str
    model: str
    api_key: str
    api_base_url: Optional[str] = None
    activate: bool = True


def config_to_dict(c: AIProviderConfig) -> dict:
    key = c.api_key or ""
    masked = key[:4] + "•" * max(0, len(key) - 8) + key[-4:] if len(key) > 8 else "•" * len(key)
    return {
        "id": c.id,
        "provider": c.provider,
        "display_name": c.display_name or PROVIDER_DISPLAY.get(c.provider, c.provider),
        "model": c.model,
        "api_key_masked": masked,
        "api_base_url": c.api_base_url,
        "is_active": c.is_active,
        "is_tested": c.is_tested,
        "test_status": c.test_status,
        "test_message": c.test_message,
        "created_at": c.created_at.isoformat() if c.created_at else None,
    }


@router.get("/ai-providers")
def list_providers(db: Session = Depends(get_db)):
    configs = db.query(AIProviderConfig).order_by(AIProviderConfig.created_at.desc()).all()
    active = next((c for c in configs if c.is_active), None)
    return {
        "configs": [config_to_dict(c) for c in configs],
        "active": config_to_dict(active) if active else None,
        "provider_options": [
            {"id": k, "name": v, "models": m}
            for k, (v, m) in {
                k: (PROVIDER_DISPLAY.get(k, k), PROVIDER_MODELS.get(k, []))
                for k in PROVIDER_MODELS
            }.items()
        ]
    }


@router.get("/ai-providers/active")
def get_active_provider(db: Session = Depends(get_db)):
    active = db.query(AIProviderConfig).filter_by(is_active=True).first()
    current = ai_module.get_active_config()
    return {
        "config": config_to_dict(active) if active else None,
        "runtime": current,
    }


@router.post("/ai-providers/test")
def test_provider(req: ProviderTestRequest):
    result = ai_module.test_provider(req.provider, req.model, req.api_key, req.api_base_url)
    return result


@router.post("/ai-providers")
def save_provider(req: ProviderSaveRequest, db: Session = Depends(get_db)):
    test_result = ai_module.test_provider(req.provider, req.model, req.api_key, req.api_base_url)
    if not test_result.get("success"):
        raise HTTPException(status_code=400, detail=f"Provider test failed: {test_result.get('message')}")

    if req.activate:
        db.query(AIProviderConfig).update({"is_active": False})

    config = AIProviderConfig(
        id=str(uuid.uuid4()),
        provider=req.provider,
        display_name=PROVIDER_DISPLAY.get(req.provider, req.provider),
        model=req.model,
        api_key=req.api_key,
        api_base_url=req.api_base_url,
        is_active=req.activate,
        is_tested=True,
        test_status="success",
        test_message=test_result.get("message"),
    )
    db.add(config)
    db.commit()
    db.refresh(config)

    if req.activate:
        ai_module.configure_provider(req.provider, req.model, req.api_key, req.api_base_url)

    return config_to_dict(config)


@router.put("/ai-providers/{config_id}/activate")
def activate_provider(config_id: str, db: Session = Depends(get_db)):
    config = db.query(AIProviderConfig).filter_by(id=config_id).first()
    if not config:
        raise HTTPException(status_code=404, detail="Config not found")
    db.query(AIProviderConfig).update({"is_active": False})
    config.is_active = True
    db.commit()
    ai_module.configure_provider(config.provider, config.model, config.api_key, config.api_base_url)
    return config_to_dict(config)


@router.delete("/ai-providers/{config_id}")
def delete_provider(config_id: str, db: Session = Depends(get_db)):
    config = db.query(AIProviderConfig).filter_by(id=config_id).first()
    if not config:
        raise HTTPException(status_code=404, detail="Config not found")
    was_active = config.is_active
    db.delete(config)
    db.commit()
    if was_active:
        ai_module.configure_provider(None, None, None)
    return {"deleted": True}


@router.get("/provider-models")
def get_provider_models():
    return {
        provider: {
            "display_name": PROVIDER_DISPLAY.get(provider, provider),
            "models": models,
        }
        for provider, models in PROVIDER_MODELS.items()
    }
