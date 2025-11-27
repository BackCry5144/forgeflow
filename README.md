# ForgeFlow

**버전**: 2.0  
**Phase**: 5 - 배포 준비 완료 ✅

AI 기반 UI 프로토타입 생성 및 산출물 자동화 시스템

---

## 🎯 주요 기능

- ✨ **AI 프로토타입 생성**: GPT-4를 활용한 HTML/CSS/JS 프로토타입 자동 생성
- � **산출물 자동화**: 설계서, 테스트 계획서, 사용자 매뉴얼 자동 생성
- 🔄 **피드백 루프**: 사용자 피드백 기반 프로토타입 재생성
- 📊 **CSV 일괄 등록**: 메뉴 데이터 CSV 파일로 일괄 업로드
- ✅ **승인 워크플로**: 설계 검토 및 승인 프로세스
- 🎨 **3-Way View**: 프롬프트 | 프로토타입 | 문서 동시 확인

---

## �🚀 빠른 시작 (3가지 방법)

### 방법 1: Docker 배포 (권장) 🐳

```powershell
# 1. 환경 변수 설정
copy backend\.env.example backend\.env
# .env 파일을 열어 OPENAI_API_KEY를 설정하세요

# 2. 빌드 및 배포 (자동)
.\deploy.ps1

# 3. 접속
# http://localhost:8000
```

### 방법 2: 수동 빌드 + Docker

```powershell
# 1. 환경 변수 설정
copy backend\.env.example backend\.env

# 2. Frontend 빌드
.\build.ps1

# 3. Docker 실행
docker-compose up -d

# 4. 접속
# http://localhost:8000
```

### 방법 3: 개발 모드 (로컬)

```powershell
# Terminal 1: PostgreSQL
docker-compose up postgres -d

# Terminal 2: Backend API
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
# .env 파일에서 OPENAI_API_KEY 설정
uvicorn main:app --reload --port 8000

# Terminal 3: Frontend Dev Server
cd frontend
npm install
npm run dev
```

**접속 주소**:
- 개발 모드: http://localhost:5173 (Frontend Dev Server)
- 배포 모드: http://localhost:8000 (Python이 Frontend 서빙)
- API 문서: http://localhost:8000/docs

---

## 📦 프로젝트 구조

```
ForgeFlow_Lite/
├── backend/          # Python FastAPI 백엔드
│   ├── main.py              # 앱 엔트리포인트
│   ├── routers/             # API 라우터
│   │   ├── menus.py         # 메뉴 CRUD + CSV 임포트
│   │   ├── screens.py       # 화면 CRUD + 승인 + 피드백
│   │   └── ai.py            # AI 생성 API
│   ├── services/            # 비즈니스 로직
│   ├── models/              # SQLAlchemy 모델
│   ├── schemas/             # Pydantic 스키마
│   ├── utils/               # 유틸리티 (CSV 파서 등)
│   ├── static/              # Frontend 빌드 파일 (배포 시)
│   ├── requirements.txt     # Python 의존성
│   ├── Dockerfile           # Docker 이미지
│   └── .env.example         # 환경 변수 템플릿
│
├── frontend/                # React + Vite 프론트엔드
│   ├── src/
│   │   ├── pages/           # 페이지 컴포넌트
│   │   ├── components/      # UI 컴포넌트
│   │   ├── services/        # API 서비스
│   │   └── types/           # TypeScript 타입
│   ├── package.json         # Node 의존성
│   └── vite.config.ts       # Vite 설정
│
├── docker-compose.yml       # Docker Compose 설정
├── build.ps1                # Frontend 빌드 스크립트
├── deploy.ps1               # 전체 배포 스크립트
└── README.md                # 이 파일
```

---

## 📊 API 엔드포인트 (총 15개)

### 메뉴 관리 (5개)
- `POST /api/menus` - 메뉴 생성
- `POST /api/menus/import` - CSV 일괄 업로드
- `GET /api/menus` - 메뉴 목록 조회
- `GET /api/menus/{id}` - 메뉴 상세 조회
- `PUT /api/menus/{id}` - 메뉴 수정
- `DELETE /api/menus/{id}` - 메뉴 삭제

### 화면 관리 (6개)
- `POST /api/screens` - 화면 생성
- `GET /api/screens` - 화면 목록 조회 (menu_id 필터)
- `GET /api/screens/{id}` - 화면 상세 조회
- `PUT /api/screens/{id}` - 화면 수정
- `DELETE /api/screens/{id}` - 화면 삭제
- `POST /api/screens/{id}/approve` - 화면 승인
- `POST /api/screens/{id}/feedback` - 피드백 추가

### AI 생성 (3개)
- `POST /api/ai/generate` - 프로토타입 + 설계서 생성
- `POST /api/ai/regenerate` - 피드백 기반 재생성
- `POST /api/ai/generate-documents` - 산출물 생성 (테스트계획, 매뉴얼)

**상세 API 문서**: http://localhost:8000/docs

---

## 🔧 기술 스택

### Backend
- **Framework**: FastAPI 0.104.1
- **Language**: Python 3.11
- **Database**: PostgreSQL 17 Alpine
- **ORM**: SQLAlchemy 2.0
- **Validation**: Pydantic 2.5
- **AI**: OpenAI GPT-4 Turbo

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite 5
- **Styling**: TailwindCSS 3.3
- **UI Components**: Shadcn/ui
- **HTTP Client**: Axios
- **Routing**: React Router v6

### DevOps
- **Containerization**: Docker, Docker Compose
- **Database**: PostgreSQL (Docker)
- **Deployment**: Single Python server (배포 모드)

---

## 🗄️ 데이터베이스 스키마

```sql
-- 메뉴 테이블
CREATE TABLE menus (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 화면 테이블
CREATE TABLE screens (
    id SERIAL PRIMARY KEY,
    menu_id INTEGER REFERENCES menus(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    prompt TEXT,
    prototype_html TEXT,
    design_doc TEXT,
    test_plan TEXT,
    manual TEXT,
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 피드백 테이블
CREATE TABLE feedback (
    id SERIAL PRIMARY KEY,
    screen_id INTEGER REFERENCES screens(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🧪 테스트 방법

### 1. Health Check
```powershell
curl http://localhost:8000/health
# {"status": "healthy"}
```

### 2. CSV 업로드 테스트
```powershell
# test-menus-simple.csv 사용
curl -X POST http://localhost:8000/api/menus/import `
  -F "file=@test-menus-simple.csv"
```

### 3. 프로토타입 생성 테스트
```powershell
# 화면 생성
$body = @{
    menu_id = 1
    name = "로그인 페이지"
    description = "사용자 인증 화면"
} | ConvertTo-Json

curl -X POST http://localhost:8000/api/screens `
  -H "Content-Type: application/json" `
  -d $body

# AI 생성
$aiBody = @{
    screen_id = 1
    prompt = "이메일과 비밀번호 입력 폼, 로그인 버튼이 있는 화면"
    menu_name = "사용자 관리"
    screen_name = "로그인 페이지"
} | ConvertTo-Json

curl -X POST http://localhost:8000/api/ai/generate `
  -H "Content-Type: application/json" `
  -d $aiBody
```

---

## 📖 사용 가이드

### 1. 메뉴 등록
1. CSV 파일 준비 (`test-menus-simple.csv` 참고)
2. 메뉴 목록 페이지에서 "CSV 임포트" 클릭
3. 파일 업로드 → 메뉴 자동 생성

### 2. 화면 생성 및 프로토타입 생성
1. 메뉴 선택 → "화면 추가" 클릭
2. 화면 정보 입력 (이름, 설명)
3. 프롬프트 입력 (예: "로그인 폼이 있는 화면")
4. "프로토타입 생성" 클릭
5. 15-20초 대기 → HTML 프로토타입 + 설계서 생성

### 3. 피드백 및 재생성
1. 프로토타입 확인
2. 좌측 패널에서 피드백 입력 (예: "버튼 크기 키워주세요")
3. "재생성" 클릭 → 피드백 반영된 새 프로토타입 생성

### 4. 승인 및 산출물 생성
1. 프로토타입 만족 시 "설계 승인" 클릭
2. "산출물 생성" 클릭
3. 테스트 계획서, 사용자 매뉴얼 자동 생성
4. 각 문서 다운로드 (Markdown)

---

## ⚠️ 문제 해결

### Docker 컨테이너 시작 실패
```powershell
# 로그 확인
docker-compose logs -f

# 포트 충돌 확인 (8000, 5432)
netstat -ano | findstr :8000
netstat -ano | findstr :5432

# 컨테이너 재시작
docker-compose restart
```

### Frontend 빌드 실패
```powershell
# node_modules 재설치
cd frontend
Remove-Item node_modules -Recurse -Force
npm install
npm run build
```

### Database 연결 실패
```powershell
# PostgreSQL 컨테이너 상태 확인
docker-compose ps

# DB 로그 확인
docker-compose logs postgres

# DB 재시작
docker-compose restart postgres
```

### OpenAI API 에러
- `.env` 파일에서 `OPENAI_API_KEY` 확인
- API 키 유효성 확인: https://platform.openai.com/api-keys
- API 사용량 확인: https://platform.openai.com/usage

---

## 📚 추가 문서

- [API 명세서](API_SPEC.md) - 전체 API 엔드포인트 상세
- [배포 가이드](DEPLOYMENT.md) - 프로덕션 배포 방법
- [사용자 가이드](USER_GUIDE.md) - 기능별 사용법
- [개발 계획](ForgeFlow_Lite_개발계획.md) - 전체 개발 로드맵

---

## 🔮 향후 로드맵

### v2.1: 성능 최적화
- API 응답 캐싱
- DB 쿼리 최적화
- Frontend 번들 최적화

### v2.2: 사용자 경험 개선
- 실시간 프리뷰 업데이트
- 버전 히스토리
- 비교 뷰

### v3.0: 고급 기능
- RAG (ChromaDB) 통합
- 템플릿 기반 문서 변환 (PPT/Excel/Word)
- 협업 기능
- 다국어 지원

---

## 📄 라이선스

MIT License

---

## 👥 기여

Issue 및 PR 환영합니다!

---

**작성자**: GitHub Copilot  
**최종 업데이트**: 2025-11-04  
**버전**: 2.0.0

## 📝 다음 단계 (Phase 2)

- OpenAI API 연동
- AI Service 구현
- HTML 프로토타입 생성
- 설계서 자동 생성

## 📚 문서

자세한 내용은 `Phase1_실행보고서_기반구축.md`를 참조하세요.
