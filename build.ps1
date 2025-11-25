# ForgeFlow Lite - Build Script
# Frontend 빌드 및 Python static 폴더로 복사

Write-Host "================================" -ForegroundColor Cyan
Write-Host "ForgeFlow Lite - Build Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Frontend 빌드
Write-Host "[1/3] Building Frontend..." -ForegroundColor Yellow
Set-Location frontend

if (!(Test-Path "node_modules")) {
    Write-Host "node_modules not found. Installing dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host "Running npm run build..." -ForegroundColor Green
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Frontend build failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Write-Host "Frontend build completed!" -ForegroundColor Green
Write-Host ""

# Step 2: Python static 폴더로 복사
Write-Host "[2/3] Copying build files to backend..." -ForegroundColor Yellow
Set-Location ..

# static 폴더 생성 (없으면)
if (!(Test-Path "backend\static")) {
    New-Item -ItemType Directory -Path "backend\static" | Out-Null
}

# 기존 파일 삭제
Write-Host "Cleaning old static files..." -ForegroundColor Yellow
Remove-Item "backend\static\*" -Recurse -Force -ErrorAction SilentlyContinue

# 빌드 파일 복사
Write-Host "Copying new build files..." -ForegroundColor Green
Copy-Item "frontend\dist\*" -Destination "backend\static" -Recurse -Force

Write-Host "Build files copied successfully!" -ForegroundColor Green
Write-Host ""

# Step 3: 완료
Write-Host "[3/3] Build process completed!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. docker-compose up -d   (to start all services)" -ForegroundColor White
Write-Host "  2. Open http://localhost:8000" -ForegroundColor White
Write-Host ""
