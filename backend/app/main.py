from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from app.config import get_settings
from app.api.v1 import search, webhooks, health
from app.core.logger import setup_logging, get_logger
from app.scrapers.mercadolibre import get_scraper
import uvicorn

# Initialize settings and logging
settings = get_settings()
setup_logging("INFO" if not settings.DEBUG else "DEBUG")
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.

    Handles startup and shutdown events:
    - Startup: Initialize Playwright browser
    - Shutdown: Clean up resources
    """
    # Startup
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")

    # Initialize scraper (starts Playwright browser)
    try:
        scraper = await get_scraper()
        await scraper.initialize()
        logger.info("Playwright browser initialized")
    except Exception as e:
        logger.warning(f"Failed to initialize browser on startup: {e}")

    yield

    # Shutdown
    logger.info("Shutting down application")
    try:
        scraper = await get_scraper()
        await scraper.close()
        logger.info("Browser closed successfully")
    except Exception as e:
        logger.error(f"Error closing browser: {e}")


# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Backend API para búsqueda de productos en Mercado Libre Colombia con IA",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)


# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register API routers
app.include_router(search.router, prefix="/api/v1")
app.include_router(webhooks.router, prefix="/api/v1")
app.include_router(health.router, prefix="/api")


@app.get("/")
async def root():
    """
    Root endpoint with API information.

    Returns:
        API metadata and available endpoints
    """
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "description": "Backend API para HALCÓN - Asistente de búsqueda en Mercado Libre",
        "docs": {
            "swagger": "/docs",
            "redoc": "/redoc"
        },
        "endpoints": {
            "search": "/api/v1/search",
            "webhooks": "/api/v1/webhooks/whatsapp",
            "health": "/api/health"
        }
    }


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """
    Global exception handler for unhandled errors.

    Args:
        request: FastAPI request
        exc: Exception that occurred

    Returns:
        JSON error response
    """
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Internal server error",
            "error_code": "INTERNAL_ERROR",
            "detail": str(exc) if settings.DEBUG else "An unexpected error occurred"
        }
    )


if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level="info"
    )
