"""FastAPI dependencies."""
from collections.abc import Generator

from sqlalchemy.orm import Session


def get_db() -> Generator[Session, None, None]:
    """Yield a database session."""
    from .database import SessionLocal

    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
