from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from .routes.health import router as health_router


def create_app() -> FastAPI:
    app = FastAPI(title="Preflight API", version="0.1.0")

    cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[o.strip() for o in cors_origins if o.strip()],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health_router)
    return app


app = create_app()

