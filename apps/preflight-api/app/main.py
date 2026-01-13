import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes.coaching import router as coaching_router
from .routes.coaching import pipeline_router
from .routes.forms import router as forms_router
from .routes.health import router as health_router
from .routes.runs import router as runs_router


def create_app() -> FastAPI:
    app = FastAPI(
        title="Preflight API",
        version="0.2.0",
        description="API for AI Readiness Assessment Platform",
        docs_url="/docs",
        redoc_url="/redoc",
    )

    cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[o.strip() for o in cors_origins if o.strip()],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health_router)
    app.include_router(forms_router)
    app.include_router(runs_router)
    app.include_router(coaching_router)
    app.include_router(pipeline_router)

    return app


app = create_app()

