import logging
import os
from functools import lru_cache
from typing import AsyncGenerator, Generator

from sqlalchemy import create_engine, event, text
from sqlalchemy.engine import Engine
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import QueuePool

logger = logging.getLogger(__name__)


# Connection pool settings from environment
POOL_SIZE = int(os.getenv("DB_POOL_SIZE", "5"))
MAX_OVERFLOW = int(os.getenv("DB_MAX_OVERFLOW", "10"))
POOL_TIMEOUT = int(os.getenv("DB_POOL_TIMEOUT", "30"))
POOL_RECYCLE = int(os.getenv("DB_POOL_RECYCLE", "1800"))  # 30 minutes
POOL_PRE_PING = os.getenv("DB_POOL_PRE_PING", "true").lower() == "true"


def get_database_url() -> str:
    """Get database URL from environment."""
    return os.getenv(
        "DATABASE_URL",
        "postgresql+psycopg://preflight:dev_password@localhost:5003/preflight_dev",
    )


@lru_cache
def get_engine() -> Engine:
    """Get or create the database engine with connection pooling."""
    url = get_database_url()

    engine = create_engine(
        url,
        future=True,
        poolclass=QueuePool,
        pool_size=POOL_SIZE,
        max_overflow=MAX_OVERFLOW,
        pool_timeout=POOL_TIMEOUT,
        pool_recycle=POOL_RECYCLE,
        pool_pre_ping=POOL_PRE_PING,
        echo=os.getenv("DB_ECHO", "false").lower() == "true",
    )

    # Log pool events in debug mode
    if os.getenv("DEBUG", "false").lower() == "true":
        @event.listens_for(engine, "checkout")
        def on_checkout(dbapi_conn, connection_record, connection_proxy):
            logger.debug("Connection checked out from pool")

        @event.listens_for(engine, "checkin")
        def on_checkin(dbapi_conn, connection_record):
            logger.debug("Connection returned to pool")

    logger.info(
        f"Database engine created: pool_size={POOL_SIZE}, "
        f"max_overflow={MAX_OVERFLOW}, pre_ping={POOL_PRE_PING}"
    )

    return engine


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
    """Get or create the async database engine with connection pooling."""
    return create_async_engine(
        get_async_database_url(),
        future=True,
        pool_size=POOL_SIZE,
        max_overflow=MAX_OVERFLOW,
        pool_timeout=POOL_TIMEOUT,
        pool_recycle=POOL_RECYCLE,
        pool_pre_ping=POOL_PRE_PING,
        echo=os.getenv("DB_ECHO", "false").lower() == "true",
    )


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


async def check_db_connection() -> tuple[bool, str]:
    """Check database connection health.

    Returns:
        Tuple of (is_healthy, message)
    """
    try:
        async with get_async_session_local()() as session:
            await session.execute(text("SELECT 1"))
            return True, "Connected"
    except Exception as e:
        return False, str(e)[:100]


def get_pool_status() -> dict:
    """Get current connection pool status.

    Returns:
        Dict with pool statistics
    """
    engine = get_engine()
    pool = engine.pool

    return {
        "pool_size": pool.size(),
        "checked_in": pool.checkedin(),
        "checked_out": pool.checkedout(),
        "overflow": pool.overflow(),
        "invalid": pool.invalidatedcount() if hasattr(pool, "invalidatedcount") else 0,
    }
