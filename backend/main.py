import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
import time
import asyncio
from collections import defaultdict
from app.core.config import settings
from app.core.database import engine
from app.api import (
    controls, risks, audits, policies, frameworks,
    dashboard, monitoring, settings as settings_api,
    auth, vendors, incidents, notifications, activity_log, export,
)
import app.models  # register all ORM models

logger = logging.getLogger("grc")

# ── App ──────────────────────────────────────────────────────────────────────
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="GRC Engineering Platform — Automated, AI-powered governance, risk, and compliance",
    docs_url="/docs" if settings.debug else None,     # hide Swagger in prod
    redoc_url="/redoc" if settings.debug else None,
)

# ── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Simple in-process rate limiter ───────────────────────────────────────────
_rate_buckets: dict = defaultdict(list)
RATE_LIMIT = 200       # max requests
RATE_WINDOW = 60       # per N seconds

class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        ip = request.client.host if request.client else "unknown"
        now = time.time()
        window_start = now - RATE_WINDOW
        _rate_buckets[ip] = [t for t in _rate_buckets[ip] if t > window_start]
        if len(_rate_buckets[ip]) >= RATE_LIMIT:
            return JSONResponse(
                status_code=429,
                content={"detail": "Too many requests. Please slow down."},
            )
        _rate_buckets[ip].append(now)
        return await call_next(request)

app.add_middleware(RateLimitMiddleware)

# ── Request timing header ────────────────────────────────────────────────────
class TimingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start = time.time()
        response = await call_next(request)
        response.headers["X-Process-Time"] = f"{(time.time() - start) * 1000:.1f}ms"
        return response

app.add_middleware(TimingMiddleware)


# ── Exception handlers ────────────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled error on %s %s", request.method, request.url.path)
    # Never expose internal details to clients outside debug mode
    detail = str(exc) if settings.debug else "An internal server error occurred."
    return JSONResponse(status_code=500, content={"detail": detail})


@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    return JSONResponse(status_code=404, content={"detail": "Resource not found"})


# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(controls.router)
app.include_router(risks.router)
app.include_router(audits.router)
app.include_router(policies.router)
app.include_router(frameworks.router)
app.include_router(monitoring.router)
app.include_router(settings_api.router)
app.include_router(vendors.router)
app.include_router(incidents.router)
app.include_router(notifications.router)
app.include_router(activity_log.router)
app.include_router(export.router)


@app.on_event("startup")
async def startup():
    from app.core.database import Base, SessionLocal
    from app.models.settings import AIProviderConfig
    from app.services import ai_service as ai_module
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        active = db.query(AIProviderConfig).filter_by(is_active=True).first()
        if active:
            ai_module.configure_provider(active.provider, active.model, active.api_key, active.api_base_url)
    finally:
        db.close()


@app.get("/")
def root():
    return {"name": settings.app_name, "version": settings.app_version, "status": "operational"}


@app.get("/health")
def health():
    return {"status": "healthy"}
