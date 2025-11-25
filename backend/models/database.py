# -*- coding: utf-8 -*-
"""
Database configuration and connection management
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator
import os
from dotenv import load_dotenv

# 환경 변수 로드
load_dotenv()

# Database URL 구성
# Prefer explicit DATABASE_URL from environment. If not provided, fall back
# to a local SQLite file for safe local development. This avoids embedding
# plaintext credentials in source code.
DATABASE_URL = os.getenv("DATABASE_URL")
_using_default_db = False
if not DATABASE_URL:
    # fallback: local sqlite file (safe default for development)
    DATABASE_URL = "sqlite:///./forgeflow.db"
    _using_default_db = True

# SQLAlchemy Engine 생성
# Configure engine args depending on DB type. SQLite needs different options
# (and doesn't support some pool params), while production DBs like Postgres
# can use pooling.
_echo = os.getenv("DB_ECHO", "False").lower() in ("1", "true", "yes")
engine = None
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL,
        echo=_echo,
        connect_args={"check_same_thread": False},
    )
else:
    engine = create_engine(
        DATABASE_URL,
        echo=_echo,
        pool_pre_ping=True,
        pool_size=int(os.getenv("DB_POOL_SIZE", "5")),
        max_overflow=int(os.getenv("DB_MAX_OVERFLOW", "10")),
    )

if _using_default_db:
    print("⚠️ Using default local SQLite database (sqlite:///./forgeflow.db).\n   Set DATABASE_URL in your .env for a production database and avoid committing credentials to source control.")

# Session Factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base class for models
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """
    Database session dependency for FastAPI
    
    Usage:
        @app.get("/items")
        def read_items(db: Session = Depends(get_db)):
            return db.query(Item).all()
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """
    Initialize database tables
    """
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully!")


def drop_db():
    """
    Drop all database tables (개발용)
    """
    Base.metadata.drop_all(bind=engine)
    print("⚠️ All database tables dropped!")
