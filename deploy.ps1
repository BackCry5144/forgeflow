# ForgeFlow Lite - Deploy Script
# 전체 시스템 배포 (빌드 + Docker 실행)

Write-Host "================================" -ForegroundColor Cyan
Write-Host "ForgeFlow Lite - Deploy Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: 환경 변수 확인
Write-Host "[1/5] Checking environment..." -ForegroundColor Yellow

if (!(Test-Path "backend\.env")) {
    Write-Host "Error: .env file not found!" -ForegroundColor Red
    Write-Host "Please create backend\.env from env.example.txt" -ForegroundColor Yellow
    Write-Host "  copy backend\env.example.txt backend\.env" -ForegroundColor White
    exit 1
}

# GOOGLE_API_KEY 확인 (필수)
$envContent = Get-Content "backend\.env" -Raw
if ($envContent -match "GOOGLE_API_KEY=your_google_api_key_here" -or $envContent -notmatch "GOOGLE_API_KEY=.+") {
    Write-Host "Error: GOOGLE_API_KEY is not configured!" -ForegroundColor Red
    Write-Host "Please edit backend\.env and set your Google Gemini API key" -ForegroundColor Yellow
    Write-Host "Get your key from: https://ai.google.dev/" -ForegroundColor Cyan
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne "y") {
        exit 1
    }
}

Write-Host "Environment check passed!" -ForegroundColor Green
Write-Host ""

# Step 2: Frontend 빌드
Write-Host "[2/5] Building Frontend..." -ForegroundColor Yellow
.\build.ps1

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 3: Docker 이미지 빌드
Write-Host "[3/5] Building Docker images..." -ForegroundColor Yellow
docker-compose build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Docker images built successfully!" -ForegroundColor Green
Write-Host ""

# Step 4: 기존 컨테이너 중지 및 제거
Write-Host "[4/5] Stopping old containers..." -ForegroundColor Yellow
docker-compose down

Write-Host ""

# Step 5: 새 컨테이너 시작
Write-Host "[5/5] Starting services..." -ForegroundColor Yellow
docker-compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to start services!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Deployment completed!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Services:" -ForegroundColor Yellow
Write-Host "  - Frontend & API: http://localhost:8000" -ForegroundColor White
Write-Host "  - API Docs (Swagger): http://localhost:8000/docs" -ForegroundColor White
Write-Host "  - Database: localhost:5432" -ForegroundColor White
Write-Host ""
Write-Host "Check status:" -ForegroundColor Yellow
Write-Host "  docker-compose ps" -ForegroundColor White
Write-Host ""
Write-Host "View logs:" -ForegroundColor Yellow
Write-Host "  docker-compose logs -f" -ForegroundColor White
Write-Host ""
