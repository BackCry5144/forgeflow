# -*- coding: utf-8 -*-
"""
ForgeFlow - FastAPI Main Application
Phase 1: 기반 구축
"""

import os
import ssl

# ============================================================================
# SSL 인증서 검증 우회 설정 (개발 환경용) - 가장 먼저 설정
# ============================================================================
os.environ['GRPC_VERBOSITY'] = 'NONE'
os.environ['GRPC_TRACE'] = ''
os.environ['GRPC_ENABLE_FORK_SUPPORT'] = '1'
os.environ['GRPC_SSL_CIPHER_SUITES'] = 'HIGH+ECDSA'
os.environ['GRPC_DEFAULT_SSL_ROOTS_FILE_PATH'] = ''
os.environ['SSL_CERT_FILE'] = ''
os.environ['REQUESTS_CA_BUNDLE'] = ''
os.environ['CURL_CA_BUNDLE'] = ''
os.environ['PYTHONHTTPSVERIFY'] = '0'
ssl._create_default_https_context = ssl._create_unverified_context

# httpx SSL 검증 비활성화
try:
    import httpx
    httpx._config.DEFAULT_CIPHERS = None
except Exception:
    pass
# ============================================================================

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from dotenv import load_dotenv

# 환경 변수 로드
load_dotenv()

# Models import (테이블 생성을 위해)
from models import Base, engine, init_db

# Routers import
from routers import menus_router, screens_router, resources_router
from routers.ai import router as ai_router
from routers.cache import router as cache_router

# FastAPI 앱 생성
app = FastAPI(
    title="ForgeFlow API",
    description="간소화된 UI 프로토타입 생성 및 산출물 자동화 시스템",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS 설정
origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routers 등록
app.include_router(menus_router)
app.include_router(screens_router)
app.include_router(ai_router)  # Phase 2: AI 라우터 추가
app.include_router(cache_router)  # Cache 관리 라우터
app.include_router(resources_router)  # Wizard 리소스 관리 라우터

# 정적 파일 서빙 (배포 시 프론트엔드)
# static 폴더가 있으면 마운트
if os.path.exists("static"):
    # assets 폴더를 /assets 경로로 마운트
    if os.path.exists("static/assets"):
        app.mount("/assets", StaticFiles(directory="static/assets"), name="assets")
    # 기타 static 파일들
    app.mount("/static", StaticFiles(directory="static"), name="static")


@app.on_event("startup")
async def startup_event():
    """앱 시작 시 실행"""
    print("[STARTUP] ForgeFlow API Starting...")
    print(f"[DB] Database URL: {os.getenv('DATABASE_URL', 'Not set')}")
    
    # Redis 연결 확인
    from services.cache_service import cache_service
    redis_url = os.getenv('REDIS_URL', 'redis://localhost:6379')
    print(f"[REDIS] Redis URL: {redis_url}")
    if cache_service.is_available():
        print("[REDIS] ✅ Redis connected successfully")
        print(f"[CACHE] Context Caching: ✅ Enabled")
    else:
        print("[REDIS] ⚠️ Redis connection failed")
        print(f"[CACHE] Context Caching: ❌ Disabled (fallback mode)")
    
    # 데이터베이스 초기화 (init.sql만 실행)
    try:
        from sqlalchemy import text
        from models.database import SessionLocal
        
        init_sql_path = os.path.join(os.path.dirname(__file__), "migrations", "init.sql")
        if os.path.exists(init_sql_path):
            db = SessionLocal()
            try:
                print("[MIGRATION] Running init.sql...")
                with open(init_sql_path, 'r', encoding='utf-8', errors='replace') as f:
                    sql_content = f.read()
                    # SQL 문을 세미콜론으로 분리하여 실행
                    for statement in sql_content.split(';'):
                        statement = statement.strip()
                        if statement and not statement.startswith('--'):
                            try:
                                db.execute(text(statement))
                            except Exception as e:
                                # 이미 존재하는 테이블/인덱스 등의 에러는 무시
                                if 'already exists' not in str(e).lower():
                                    print(f"[WARNING] SQL execution warning: {e}")
                db.commit()
                print("[OK] Database initialization completed!")
            except Exception as e:
                db.rollback()
                print(f"[ERROR] Database initialization failed: {e}")
            finally:
                db.close()
        else:
            print("[WARNING] init.sql not found, skipping database initialization")
    except Exception as e:
        print(f"[ERROR] Database initialization error: {e}")


@app.on_event("shutdown")
async def shutdown_event():
    """앱 종료 시 실행"""
    print("[SHUTDOWN] ForgeFlow API Shutting down...")


@app.get("/", response_class=HTMLResponse, tags=["root"])
async def root():
    """루트 엔드포인트 - 프론트엔드 앱 서빙"""
    if os.path.exists("static/index.html"):
        with open("static/index.html", "r", encoding="utf-8") as f:
            return f.read()
    else:
        return """
        <html>
            <head><title>ForgeFlow</title></head>
            <body>
                <h1>ForgeFlow API</h1>
                <p>Frontend not built. Please run: npm run build</p>
                <a href="/docs">API Documentation</a>
            </body>
        </html>
        """


@app.get("/health", tags=["health"])
async def health_check():
    """헬스 체크 엔드포인트"""
    return {
        "status": "healthy",
        "service": "ForgeFlow API",
        "version": "2.0.0",
        "phase": "Phase 1 - Foundation"
    }


if __name__ == "__main__":
    import uvicorn
    import sys
    
    # UTF-8 출력 강제
    if sys.platform == 'win32':
        import io
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')
    
    host = os.getenv("API_HOST", "0.0.0.0")
    port = int(os.getenv("API_PORT", "8000"))
    reload = os.getenv("API_RELOAD", "true").lower() == "true"
    
    print(f"[START] Starting server at http://{host}:{port}")
    
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=reload
    )
