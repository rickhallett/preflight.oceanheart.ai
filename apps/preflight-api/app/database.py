import os
from functools import lru_cache
from typing import AsyncGenerator, Generator

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import Session, sessionmaker


def get_database_url() -> str:
    """Get database URL from environment."""
    return os.getenv(
        "DATABASE_URL",
        "postgresql+psycopg://preflight:dev_password@localhost:5003/preflight_dev",
    )


@lru_cache
def get_engine() -> Engine:
    """Get or create the database engine (cached)."""
    return create_engine(get_database_url(), future=True)


def get_session_local() -> sessionmaker[Session]:
    """Get a sessionmaker bound to the engine."""
    return sessionmaker(bind=get_engine(), autocommit=False, autoflush=False, future=True)


# For backwards compatibility - these will be lazily evaluated
class _LazySessionLocal:
    """Lazy sessionmaker that delays engine creation."""

    _instance: sessionmaker[Session] | None = None

    def __call__(self) -> Session:
        if self._instance is None:
            self._instance = get_session_local()
        return self._instance()


SessionLocal = _LazySessionLocal()


def get_async_database_url() -> str:
    """Get async database URL from environment."""
    sync_url = get_database_url()
    # Convert sync URL to async (postgresql -> postgresql+asyncpg)
    if sync_url.startswith("postgresql+psycopg"):
        return sync_url.replace("postgresql+psycopg", "postgresql+asyncpg")
    elif sync_url.startswith("postgresql://"):
        return sync_url.replace("postgresql://", "postgresql+asyncpg://")
    return sync_url


@lru_cache
def get_async_engine():
    """Get or create the async database engine (cached)."""
    return create_async_engine(get_async_database_url(), future=True)


def get_async_session_local() -> async_sessionmaker[AsyncSession]:
    """Get an async sessionmaker bound to the async engine."""
    return async_sessionmaker(
        bind=get_async_engine(),
        autocommit=False,
        autoflush=False,
        expire_on_commit=False,
    )


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency for database sessions.

    Usage:
        @router.get("/items")
        async def get_items(db: AsyncSession = Depends(get_db)):
            ...
    """
    async_session = get_async_session_local()
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()
