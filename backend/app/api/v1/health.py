from fastapi import APIRouter
from app.models.responses import HealthResponse
from app.config import get_settings
from datetime import datetime

router = APIRouter(prefix="/health", tags=["health"])
settings = get_settings()


@router.get("/", response_model=HealthResponse)
async def health_check():
    """
    Health check endpoint for the API.

    Returns:
        HealthResponse with current status and version
    """
    return HealthResponse(
        status="healthy",
        version=settings.APP_VERSION,
        timestamp=datetime.now()
    )


@router.get("/ready")
async def readiness_check():
    """
    Readiness check endpoint for deployment orchestration.

    Returns:
        Simple ready status
    """
    return {
        "status": "ready",
        "timestamp": datetime.now().isoformat()
    }


@router.get("/live")
async def liveness_check():
    """
    Liveness check endpoint for deployment orchestration.

    Returns:
        Simple alive status
    """
    return {
        "status": "alive",
        "timestamp": datetime.now().isoformat()
    }
