import os
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator

# Load .env located at project root or backend folder
project_root = Path(__file__).resolve().parents[2]
env_path = project_root / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()

# Retrieve DATABASE_URL (must follow sqlalchemy+PyMySQL format)
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL not set in .env file.")

# Create SQLAlchemy engine with pool pre-ping to handle stale connections
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=3600,
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def test_connection() -> bool:
    """Attempt a simple connection and SELECT 1 query."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except OperationalError as e:
        print(f"Database connection failed: {e}")
        return False

def create_tables():
    """Create all tables defined in models using the current engine and run migrations."""
    from .models import Base
    from .migrate import run_migrations
    Base.metadata.create_all(bind=engine)
    run_migrations(engine)
