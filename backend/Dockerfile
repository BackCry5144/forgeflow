# ForgeFlow Lite - Dockerfile
# Python FastAPI Backend

FROM python:3.11-slim

# SSL 인증서 검증 우회 설정 (사무실 환경)
ENV PYTHONHTTPSVERIFY=0
ENV CURL_CA_BUNDLE=""
ENV REQUESTS_CA_BUNDLE=""
ENV SSL_CERT_FILE=""

# 작업 디렉토리 설정
WORKDIR /app

# 시스템 패키지 업데이트 및 필수 도구 설치
RUN apt-get update && apt-get install -y \
    curl \
    postgresql-client \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Python 의존성 복사 및 설치 (SSL 검증 비활성화)
COPY requirements.txt .
RUN pip install --no-cache-dir --trusted-host pypi.org --trusted-host pypi.python.org --trusted-host files.pythonhosted.org -r requirements.txt

# 애플리케이션 코드 복사
COPY . .

# 정적 파일 디렉토리 생성
RUN mkdir -p /app/static

# Health check 엔드포인트를 위한 포트 노출
EXPOSE 8000

# Uvicorn 서버 실행
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
