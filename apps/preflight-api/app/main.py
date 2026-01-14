import logging
import os
import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import validate_config, log_config_validation
from .middleware.errors import register_exception_handlers
from .middleware.logging import setup_request_logging
from .routes.coaching import router as coaching_router
from .routes.coaching import pipeline_router
from .routes.forms import router as forms_router
from .routes.health import router as health_router
from .routes.runs import router as runs_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager - runs on startup and shutdown."""
    # Startup: Validate configuration
    logger.info("Starting Preflight API...")

    result = validate_config()
    log_config_validation(result)

    if not result.valid:
        logger.error("Configuration validation failed. Exiting.")
        # In production, fail fast on invalid config
        if os.getenv("NODE_ENV") == "production":
            sys.exit(1)
        else:
            logger.warning("Continuing despite config errors (development mode)")

    logger.info("Preflight API started successfully")

    yield

    # Shutdown
    logger.info("Shutting down Preflight API...")


def create_app() -> FastAPI:
    app = FastAPI(
        title="Preflight API",
        version="0.2.0",
        description="API for AI Readiness Assessment Platform",
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan,
    )

    cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[o.strip() for o in cors_origins if o.strip()],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Setup request logging (excludes health check endpoints)
    setup_request_logging(app)

    app.include_router(health_router)
    app.include_router(forms_router)
    app.include_router(runs_router)
    app.include_router(coaching_router)
    app.include_router(pipeline_router)

    # Register error handlers for RFC 7807 compliant responses
    register_exception_handlers(app)

    return app


app = create_app()

