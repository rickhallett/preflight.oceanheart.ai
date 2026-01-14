import os
import time
from typing import Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..middleware.auth import validate_auth_config

router = APIRouter()


class ComponentStatus(BaseModel):
    """Status of a single component."""
    healthy: bool
    message: str
    latency_ms: Optional[float] = None


class HealthResponse(BaseModel):
    """Comprehensive health check response."""
    status: str  # "healthy", "degraded", "unhealthy"
    version: str
    components: dict[str, ComponentStatus]


async def check_database(db: AsyncSession) -> ComponentStatus:
    """Check database connectivity."""
    start = time.time()
    try:
        await db.execute(text("SELECT 1"))
        latency = (time.time() - start) * 1000
        return ComponentStatus(
            healthy=True,
            message="Connected",
            latency_ms=round(latency, 2)
        )
    except Exception as e:
        return ComponentStatus(
            healthy=False,
            message=f"Connection failed: {str(e)[:100]}"
        )


def check_auth_config() -> ComponentStatus:
    """Check authentication configuration."""
    result = validate_auth_config()
    if result["valid"]:
        return ComponentStatus(
            healthy=True,
            message=f"Mode: {result['mode']}"
        )
    else:
        return ComponentStatus(
            healthy=False,
            message="; ".join(result["issues"][:3])  # Limit issue count
        )


def check_llm_config() -> ComponentStatus:
    """Check LLM service configuration."""
    provider = os.getenv("LLM_PROVIDER", "openai")

    if provider == "openai":
        has_key = bool(os.getenv("OPENAI_API_KEY"))
    elif provider == "anthropic":
        has_key = bool(os.getenv("ANTHROPIC_API_KEY"))
    else:
        has_key = False

    if has_key:
        return ComponentStatus(
            healthy=True,
            message=f"Provider: {provider}"
        )
    else:
        return ComponentStatus(
            healthy=False,
            message=f"No API key for {provider}"
        )


@router.get("/health")
async def health():
    """Basic health check - always returns 200 if app is running."""
    return {"status": "ok"}


@router.get("/health/ready", response_model=HealthResponse)
async def health_ready(db: AsyncSession = Depends(get_db)):
    """Readiness check - verifies all components are ready to serve traffic.

    Returns:
        - 200: All components healthy, ready for traffic
        - 503: One or more critical components unhealthy
    """
    # Check all components
    db_status = await check_database(db)
    auth_status = check_auth_config()
    llm_status = check_llm_config()

    components = {
        "database": db_status,
        "auth": auth_status,
        "llm": llm_status,
    }

    # Determine overall status
    # Database and auth are critical, LLM is optional
    critical_healthy = db_status.healthy and auth_status.healthy

    if critical_healthy and llm_status.healthy:
        status = "healthy"
    elif critical_healthy:
        status = "degraded"  # LLM unavailable but core services work
    else:
        status = "unhealthy"

    return HealthResponse(
        status=status,
        version=os.getenv("APP_VERSION", "0.2.0"),
        components=components
    )


@router.get("/health/live")
async def health_live():
    """Liveness check - basic check that the process is running.

    Used by Kubernetes/container orchestrators to determine if
    the container should be restarted.
    """
    return {"status": "alive"}

