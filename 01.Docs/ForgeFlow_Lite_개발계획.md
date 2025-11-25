# -*- coding: utf-8 -*-
# ForgeFlow Lite - 간소화 개발 계획

**버전**: v2.0 Lite  
**작성일**: 2025-11-04  
**목표**: 핵심 기능만으로 최소화 간결하게 구현

---

## 프로젝트 개요

### 기존 ForgeFlow vs ForgeFlow Lite

| 항목 | 기존 ForgeFlow | ForgeFlow Lite |
|------|---------------|----------------|
| **계층 구조** | 프로젝트 → 메뉴 → 화면 (3단계) | 메뉴 → 화면 (2단계) |
| **백엔드** | Node.js + Python (이중 구조) | Python FastAPI 단일 |
| **AI 엔진** | MCP + RAG + n8n | OpenAI API 직접 호출 |
| **벡터 DB** | ChromaDB | 제거 (차후 추가) |
| **오케스트레이션** | n8n 자동화 | 제거 (차후 추가) |
| **산출물** | 설계서, 테스트, 매뉴얼, 이상 | 설계서, 테스트, 매뉴얼 |
| **복잡도** | ★★★★☆ | ★★☆☆☆ |

### 핵심 가치

> **"복잡함을 버리고 핵심에 집중하자"**

- ✅ **빠른 개발**: 5-10일 내 완성 가능
- ✅ **명확한 목표**: 프로토타입 생성 & 산출물 자동화
- ✅ **자연스러운 확장**: 필요 시 RAG/MCP/n8n 추가 가능
- ✅ **쉬운 배포**: 단일 Python 서버로 배포

---

## 핵심 기능 (7가지)

### 1️⃣ 메뉴 CSV 임포트
```
사용자가 CSV 파일로 메뉴 일괄 생성
```
- 프로젝트 개념 제거
- 메뉴를 최상위 엔티티로 관리
- CSV 형식: `menu_name, description`

### 2️⃣ 3-Way View 워크스페이스
```
[프롬프트 입력] | [HTML 프로토타입] | [설계 문서]
```
- 좌측: 프롬프트 입력 + 피드백 히스토리
- 중앙: HTML 프로토타입 미리보기 (iframe)
- 우측: 설계서, 테스트계획, 매뉴얼 (탭)

### 3️⃣ Python GPT 호출
```
프롬프트 → Python FastAPI → OpenAI API → 결과 반환
```
- 직접 OpenAI API 호출
- MCP, RAG 제거 (차후 추가 가능)
- 간단한 프롬프트 템플릿

### 4️⃣ HTML 프로토타입 생성
```
프롬프트 → AI → HTML (Tailwind + Alpine.js) → iframe 표시
```
- Tailwind CSS 기본 스타일
- Alpine.js로 인터랙션 (팝업, 클릭, 조건부 렌더링)
- 샘플 데이터 포함

### 5️⃣ 사용자 피드백 루프
```
프로토타입 확인 → 피드백 입력 → AI 재생성 → 반복
```
- 피드백 히스토리 저장
- 이전 버전 비교 가능
- 피드백 기반 재생성

### 6️⃣ 설계 승인
```
검토 완료 후 승인 버튼 → 상태 변경(approved)
```
- 승인 전: draft/in_review 상태
- 승인 후: approved 상태
- 승인 후 산출물 생성 가능

### 7️⃣ 산출물 생성
```
승인 완료 후 AI 산출물 생성 → 다운로드
```
- 설계서(Markdown)
- 테스트계획서(Markdown)
- 사용자 매뉴얼(Markdown)
- 이상 제외 (차후 추가)

---

## 시스템 아키텍처

### 전체 구조

```
┌──────────────────────────────────────────────────────────┐
│                   Frontend (React)                       │
│                 Vite Dev Server (개발)                   │
│                Static Files (배포)                       │
└──────────────────────────────────────────────────────────┘
                           ↓
                           │HTTP/REST API
                           ↓
┌──────────────────────────────────────────────────────────┐
│            Python FastAPI (단일 백엔드)                  │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐                  │
│ │ API Layer│ │ AI Service│ │ DB Service│                 │
│ │  (CRUD)  │ │  (OpenAI) │ │(SQLAlchemy)│                │
│ └──────────┘ └──────────┘ └──────────┘                  │
└──────────────────────────────────────────────────────────┘
                           ↓
                           │SQL
                           ↓
┌──────────────────────────────────────────────────────────┐
│                  PostgreSQL Database                     │
│             menus, screens, feedback                     │
└──────────────────────────────────────────────────────────┘
```

### 배포 구조 비교

#### 개발 환경
```
┌──────────┐     ┌──────────────────┐     ┌──────────┐
│ Vite Dev │CORS │ Python FastAPI   │SQL  │PostgreSQL│
│  :5173   ├─────┤      :8000       ├─────┤  :5432   │
└──────────┘     └──────────────────┘     └──────────┘
```

#### 배포 환경
```
┌──────────────────────────┐     ┌──────────┐
│   Python FastAPI         │SQL  │PostgreSQL│
│ Static Files + API       ├─────┤  :5432   │
│        :8000             │     └──────────┘
└──────────────────────────┘
```

### Node.js 백엔드 제거 전략

**제거 대상**
- Node.js Express 백엔드
- Node.js API Gateway
- Python API 중복된 로직

**유지 (개발 도구로만)**
- Vite Dev Server (개발 시 HMR, 빠른 리로드)
- npm/pnpm (패키지 관리)

**실제 구현 방법**

1. **개발 시**
   ```bash
   # Terminal 1: Python API
   cd backend
   uvicorn main:app --reload --port 8000
   
   # Terminal 2: Frontend Dev
   cd frontend
   npm run dev  # Vite dev server :5173
   ```
   - Vite가 Python API로 CORS 요청
   - Python FastAPI가 CORS 헤더 허용

2. **배포 시**
   ```bash
   # 1. Frontend 빌드
   cd frontend
   npm run build  # → dist/ 폴더 생성
   
   # 2. Python에 복사
   cp -r dist/* ../backend/static/
   
   # 3. Python만 실행
   cd backend
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```
   - Python이 `/` 경로에서 정적 파일 서빙
   - `/api/*` 경로는 API로 라우팅

**장점**:
- 개발: Vite의 빠른 HMR 사용
- 배포: 단일 Python 서버로 간단
- 복잡도 최소화

---

## 간소화된 데이터베이스 스키마

### 단순화된 구조

```sql
-- 1. 메뉴 테이블(최상위)
CREATE TABLE menus (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. 화면 테이블
CREATE TABLE screens (
    id SERIAL PRIMARY KEY,
    menu_id INTEGER REFERENCES menus(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- 프롬프트 & AI 생성
    prompt TEXT,                          -- 사용자 프롬프트
    prototype_html TEXT,                  -- HTML 프로토타입
    
    -- 산출물
    design_doc TEXT,                      -- 설계서(Markdown)
    test_plan TEXT,                       -- 테스트계획서(Markdown)
    manual TEXT,                          -- 사용자 매뉴얼(Markdown)
    
    -- 상태 관리
    status VARCHAR(50) DEFAULT 'draft',   -- draft, in_review, approved
    
    -- 타임스탬프
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. 피드백 테이블(선택적)
CREATE TABLE feedback (
    id SERIAL PRIMARY KEY,
    screen_id INTEGER REFERENCES screens(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스
CREATE INDEX idx_screens_menu_id ON screens(menu_id);
CREATE INDEX idx_screens_status ON screens(status);
CREATE INDEX idx_feedback_screen_id ON feedback(screen_id);
```

### 상태 흐름

```
draft → in_review → approved
  ↑        ↓
  └────────┘(피드백 시 draft로 복귀 가능)
```

---

## 핵심 API 엔드포인트

### 메뉴 관리(5개)

```typescript
// 메뉴 CSV 임포트
POST /api/menus/import
Content-Type: multipart/form-data
Body: { file: CSV }
Response: { created_count: number, menus: Menu[] }

// 메뉴 목록
GET /api/menus
Response: Menu[]

// 메뉴 상세
GET /api/menus/:id
Response: Menu & { screens: Screen[] }

// 메뉴 수정
PUT /api/menus/:id
Body: { name, description }

// 메뉴 삭제
DELETE /api/menus/:id
```

### 화면 관리(5개)

```typescript
// 화면 생성
POST /api/screens
Body: { menu_id, name, description, prompt }
Response: Screen

// 화면 목록 (메뉴별)
GET /api/screens?menu_id=1
Response: Screen[]

// 화면 상세
GET /api/screens/:id
Response: Screen & { feedback: Feedback[] }

// 화면 수정
PUT /api/screens/:id
Body: { name, description, prompt, status }

// 화면 삭제
DELETE /api/screens/:id
```

### AI 생성 (3개)

```typescript
// 프로토타입 & 설계서 생성
POST /api/ai/generate
Body: { 
  screen_id: number,
  prompt: string,
  menu_name: string,
  screen_name: string
}
Response: { 
  prototype_html: string,
  design_doc: string
}

// 피드백 기반 재생성
POST /api/ai/regenerate
Body: { 
  screen_id: number,
  feedback: string,
  previous_prompt: string
}
Response: { 
  prototype_html: string,
  design_doc: string
}

// 산출물 생성 (승인 후)
POST /api/ai/generate-documents
Body: { screen_id: number }
Response: {
  design_doc: string,
  test_plan: string,
  manual: string
}
```

### 승인 프로세스 (2개)

```typescript
// 설계 승인
POST /api/screens/:id/approve
Response: { status: 'approved' }

// 피드백 추가
POST /api/screens/:id/feedback
Body: { content: string }
Response: Feedback
```

**총 15개 엔드포인트** - 매우 간결함

---

## 간소화된 Frontend 구조

### 페이지 라우팅

```
/ (홈)
├─ /menus (메뉴 목록 + CSV 임포트)
├─ /menu/:id (메뉴 상세 - 화면 목록)
└─ /screen/:id (화면 작업 공간 - 3-Way View)
```

### 주요 컴포넌트

```
src/
├─ pages/
│  ├─ HomePage.tsx              // 프로젝트 정보
│  ├─ MenuListPage.tsx          // 메뉴 목록
│  └─ ScreenWorkspacePage.tsx   // 3-Way View
│
├─ components/
│  ├─ menu/
│  │  ├─ MenuList.tsx          // 메뉴 목록
│  │  ├─ MenuCard.tsx          // 메뉴 카드
│  │  └─ CSVImport.tsx         // CSV 업로드
│  │
│  ├─ screen/
│  │  ├─ ScreenList.tsx        // 화면 목록
│  │  └─ ScreenCard.tsx        // 화면 카드
│  │
│  └─ workspace/
│      ├─ PromptPanel.tsx       // 좌측: 프롬프트 입력
│      ├─ PrototypeViewer.tsx   // 중앙: HTML 프로토타입
│      ├─ DocumentPanel.tsx     // 우측: 산출물
│      ├─ FeedbackHistory.tsx   // 피드백 히스토리
│      └─ ApprovalButton.tsx    // 승인 버튼
│
├─ services/
│  ├─ api.ts                    // Axios 인스턴스
│  ├─ menuService.ts            // 메뉴 API
│  ├─ screenService.ts          // 화면 API
│  └─ aiService.ts              // AI API
│
└─ types/
    ├─ menu.ts
    └─ screen.ts
```

### 3-Way View 레이아웃

```tsx
// ScreenWorkspacePage.tsx
<div className="h-screen flex">
  {/* 좌측: 프롬프트 */}
  <div className="w-1/4 border-r">
    <PromptPanel />
    <FeedbackHistory />
  </div>
  
  {/* 중앙: 프로토타입 */}
  <div className="flex-1">
    <PrototypeViewer />
  </div>
  
  {/* 우측: 문서 */}
  <div className="w-1/3 border-l">
    <Tabs>
      <Tab label="설계서">
        <DesignDoc />
      </Tab>
      <Tab label="테스트 계획">
        <TestPlan />
      </Tab>
      <Tab label="매뉴얼">
        <Manual />
      </Tab>
    </Tabs>
    <ApprovalButton />
  </div>
</div>
```

---

## 간소화된 Backend 구조

### Python FastAPI 디렉토리

```
backend/
├─ main.py                      # FastAPI 엔트리포인트
├─ requirements.txt             # 의존성(간소화)
├─ .env                         # 환경 변수
│
├─ routers/
│  ├─ menus.py                 # 메뉴 API
│  ├─ screens.py               # 화면 API
│  └─ ai.py                    # AI 생성 API
│
├─ services/
│  ├─ ai_service.py            # OpenAI API 호출
│  ├─ document_service.py      # 산출물 생성
│  └─ csv_service.py           # CSV 파싱
│
├─ models/
│  ├─ database.py              # SQLAlchemy 설정
│  ├─ menu.py                  # Menu 모델
│  ├─ screen.py                # Screen 모델
│  └─ feedback.py              # Feedback 모델
│
├─ schemas/
│  ├─ menu.py                  # Pydantic 스키마
│  ├─ screen.py
│  └─ ai.py
│
├─ static/                      # 배포 시 프론트엔드 빌드 파일
│  └─ (index.html, assets/)
│
└─ utils/
    ├─ prompt_templates.py      # AI 프롬프트 템플릿
    └─ html_generator.py        # HTML 생성 헬퍼
```

### 간소화된 requirements.txt

```txt
# 핵심 의존성만
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
pydantic==2.5.0
pydantic-settings==2.1.0
python-multipart==0.0.6
python-dotenv==1.0.0
openai==1.3.0              # OpenAI API
aiofiles==23.2.1           # 파일 업로드
pandas==2.1.3              # CSV 파싱

# 제거된 의존성
# chromadb (RAG 제거)
# n8n 관련 (오케스트레이션 제거)
```

### AI Service 간소화

```python
# services/ai_service.py
import openai
from typing import Dict, Any

class AIService:
    def __init__(self):
        self.client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    
    async def generate_prototype(
        self,
        prompt: str,
        menu_name: str,
        screen_name: str
    ) -> Dict[str, Any]:
        """프롬프트 → HTML 프로토타입 + 설계서 생성"""
        
        # 프롬프트 템플릿
        system_prompt = """
        당신은 UI/UX 설계 전문가입니다.
        사용자의 요구사항을 분석하여:
        1. HTML 프로토타입(Tailwind + Alpine.js)
        2. 상세 설계서(Markdown)
        를 생성합니다.
        """
        
        user_prompt = f"""
        메뉴: {menu_name}
        화면: {screen_name}
        요구사항: {prompt}
        
        이 정보를 바탕으로 프로토타입과 설계서를 생성해주세요.
        """
        
        # OpenAI API 호출
        response = self.client.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"}
        )
        
        result = response.choices[0].message.content
        return json.loads(result)
    
    async def generate_documents(
        self,
        design_doc: str,
        screen_name: str
    ) -> Dict[str, str]:
        """설계서 기반 → 테스트 계획 + 매뉴얼 생성"""
        
        # 구현...
        return {
            "test_plan": "...",
            "manual": "..."
        }
```

---

## 간소화된 Docker 구성

### docker-compose.yml (간소화)

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:17-alpine
    container_name: forgeflow-lite-db
    environment:
      POSTGRES_USER: forgeflow
      POSTGRES_PASSWORD: forgeflow123
      POSTGRES_DB: forgeflow
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U forgeflow"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Python API (단일 백엔드)
  python-api:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: forgeflow-lite-api
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      - DATABASE_URL=postgresql://forgeflow:forgeflow123@postgres:5432/forgeflow
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - CORS_ORIGINS=http://localhost:5173
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app
      - ./frontend/dist:/app/static  # 배포 시 정적 파일
    command: uvicorn main:app --host 0.0.0.0 --port 8000 --reload

volumes:
  postgres_data:

# 제거된 서비스
# - chromadb (RAG 제거)
# - n8n (오케스트레이션 제거)
# - node-backend (단일 백엔드로 통합)
```

### 개발 vs 배포

**개발 모드**
```bash
# 1. DB는 Docker로
docker-compose up postgres

# 2. Python API 로컬 실행
cd backend
uvicorn main:app --reload

# 3. Frontend Dev Server
cd frontend
npm run dev
```

**배포 모드**
```bash
# 1. Frontend 빌드
cd frontend
npm run build
cp -r dist/* ../backend/static/

# 2. 전체 서비스 시작
docker-compose up -d
```

---

## 간소화된 개발 계획 (5단계, 5-10일)

### Phase 1: 기반 구축 (1-2일)

**목표**: 데이터베이스 & 기본 CRUD API

**작업**:
- ✅ PostgreSQL 스키마 마이그레이션
- ✅ SQLAlchemy 모델 정의 (Menu, Screen, Feedback)
- ✅ FastAPI 라우터 생성 (menus, screens)
- ✅ Pydantic 스키마 정의
- ✅ 기본 CRUD 엔드포인트 구현

**산출물**:
- DB 스키마 SQL
- Menu/Screen CRUD API
- API 문서 (Swagger)

**검증**:
- [ ] POST /api/menus 정상 작동
- [ ] GET /api/menus 정상 작동
- [ ] POST /api/screens 정상 작동
- [ ] GET /api/screens?menu_id=1 정상 작동

---

### Phase 2: AI 호출 (2-3일)

**목표**: OpenAI API 호출 & 프로토타입 생성

**작업**:
- ✅ OpenAI API 클라이언트 설정
- ✅ AIService 클래스 구현
- ✅ 프롬프트 템플릿 작성
- ✅ HTML 프로토타입 생성 로직
  - Tailwind CSS 기본 구조
  - Alpine.js 인터랙션
  - 샘플 데이터 주입
- ✅ 설계서 생성 로직 (Markdown)
- ✅ POST /api/ai/generate 구현
- ✅ POST /api/ai/regenerate 구현

**산출물**:
- AI Service 모듈
- 프롬프트 템플릿 라이브러리
- AI 생성 API

**검증**:
- [ ] 프롬프트 입력 시 HTML 프로토타입 생성
- [ ] 프롬프트 입력 시 설계서 생성
- [ ] 피드백 입력 시 재생성 작동
- [ ] HTML에 Alpine.js 인터랙션 포함

---

### Phase 3: Frontend 3-Way View (1-2일)

**목표**: 화면 작업 공간 UI 구현

**작업**:
- ✅ React Router 설정 (/, /menu/:id, /screen/:id)
- ✅ MenuListPage 구현
  - 메뉴 목록 표시
  - CSV 임포트 버튼
  - 메뉴 생성/수정/삭제
- ✅ ScreenWorkspacePage 구현
  - 3-Way View 레이아웃
  - PromptPanel (좌측)
  - PrototypeViewer (중앙, iframe)
  - DocumentPanel (우측, 탭)
- ✅ FeedbackHistory 컴포넌트
- ✅ ApprovalButton 컴포넌트

**산출물**:
- Frontend 페이지 3개
- 주요 컴포넌트 10개
- API Service 함수

**검증**:
- [ ] 메뉴 목록 조회 및 카드 표시
- [ ] 화면 클릭 시 작업 공간 진입
- [ ] 프롬프트 입력 후 AI 생성 시 프로토타입 표시
- [ ] iframe에서 HTML 프로토타입 렌더링
- [ ] 탭 전환 (설계서, 테스트, 매뉴얼)

---

### Phase 4: 산출물 & 승인 (1-2일)

**목표**: 산출물 생성 & 승인 프로세스

**작업**:
- ✅ CSV 임포트 기능 구현
  - CSV 파싱 (pandas)
  - 메뉴 일괄 생성
  - 중복 체크
- ✅ 산출물 생성 로직
  - 테스트계획서 생성
  - 사용자 매뉴얼 생성
- ✅ POST /api/ai/generate-documents 구현
- ✅ 승인 프로세스
  - POST /api/screens/:id/approve
  - 상태 변경(draft → approved)
- ✅ 다운로드 기능
  - Markdown 별 파일 다운로드
  - 통합 ZIP 다운로드

**산출물**:
- CSV 임포트 API
- 산출물 생성 API
- 승인 API
- 다운로드 기능

**검증**:
- [ ] CSV 파일 업로드 시 메뉴 생성
- [ ] 승인 버튼 클릭 시 상태 변경
- [ ] 산출물 생성 시 테스트계획 + 매뉴얼 생성
- [ ] 설계서 다운로드 (Markdown)
- [ ] 통합 ZIP 다운로드

---

### Phase 5: 정리 & 배포 (1일)

**목표**: 배포 준비 & 문서화

**작업**:
- ✅ Docker 구성 최적화
  - docker-compose.yml 정리
  - 불필요한 서비스 제거
- ✅ 배포 스크립트 작성
  - Frontend 빌드 스크립트
  - Python 정적 파일 서빙 설정
- ✅ 환경 변수 정리
  - .env.example 작성
  - README 업데이트
- ✅ API 문서화
  - Swagger UI 포인트
  - 엔드포인트 명세 작성
- ✅ 사용자 가이드 작성

**산출물**:
- README.md
- API_SPEC.md
- DEPLOYMENT.md
- USER_GUIDE.md

**검증**:
- [ ] `docker-compose up -d` 정상 실행
- [ ] 모든 API 엔드포인트 작동 확인
- [ ] 프론트엔드 빌드 후 Python 서빙 확인
- [ ] 문서 작성 완료

---

## 간소화된 기대 효과

### 개발 속도

| 항목 | 기존 ForgeFlow | ForgeFlow Lite |
|------|---------------|----------------|
| **개발 기간** | 4개월(20주) | 1-2주(5-10일) |
| **API 개수** | 30+ | 15 |
| **서비스 개수** | 5개(Postgres, Chroma, n8n, Node, Python) | 2개(Postgres, Python) |
| **코드 복잡도** | 높음 | 낮음 |

### 유지보수성

- ✅ **단일 언어**: Python만 관리
- ✅ **단순 구조**: 계층 단순화
- ✅ **쉬운 디버깅**: 직접 API 호출
- ✅ **빠른 수정**: 복잡한 통합 없음

### 확장성

**차후 추가 가능**:
1. **RAG (ChromaDB)**: 지식 베이스 필요 시
2. **MCP**: 복잡한 AI 오케스트레이션 필요 시
3. **n8n**: 자동화 오케스트레이션 필요 시
4. **이상 생성**: 산출물 확장 시
5. **협업 기능**: 다중 사용자 지원 시

---

## 빠른 시작

### 1. 환경 설정

```bash
# 1. 리포지토리 클론
git clone <repo>
cd forgeflow-lite

# 2. 환경 변수 설정
cp .env.example .env
# OPENAI_API_KEY=your-key-here

# 3. Docker 시작 (DB만)
docker-compose up postgres -d
```

### 2. Backend 실행

```bash
cd backend

# 가상환경 생성
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 의존성 설치
pip install -r requirements.txt

# DB 마이그레이션
alembic upgrade head

# 서버 실행
uvicorn main:app --reload --port 8000
```

### 3. Frontend 실행

```bash
cd frontend

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

### 4. 접속

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## 참고 자료

### 기술 스택

- **Backend**: FastAPI, SQLAlchemy, OpenAI API
- **Frontend**: React, Vite, TailwindCSS, Shadcn/ui
- **Database**: PostgreSQL
- **AI**: GPT-4 Turbo
- **Deployment**: Docker, Docker Compose

### 문서

- FastAPI: https://fastapi.tiangolo.com/
- OpenAI API: https://platform.openai.com/docs
- Vite: https://vitejs.dev/
- Shadcn/ui: https://ui.shadcn.com/
- Alpine.js: https://alpinejs.dev/

---

## 완공 기준

### Phase 1-2 완료 시
- [ ] 메뉴 CRUD 작동
- [ ] 화면 CRUD 작동
- [ ] AI 프로토타입 생성 작동

### Phase 3-4 완료 시
- [ ] 3-Way View 표시
- [ ] 프롬프트 입력 시 프로토타입 생성
- [ ] 피드백 후 재생성 작동
- [ ] CSV 임포트 작동
- [ ] 승인 프로세스 작동
- [ ] 산출물 생성 작동

### Phase 5 완료 시(출시 가능)
- [ ] Docker로 전체 테스트 실행
- [ ] 배포 가이드 작성 완료
- [ ] 모든 기능 작동 검증
- [ ] 사용자 가이드 작성 완료

---

## 향후 로드맵

### v2.1: 성능 최적화(2-3주)
- API 응답 캐싱
- DB 쿼리 최적화
- 프론트엔드 번들 최적화

### v2.2: 사용자 경험 개선 (3-5주)
- 실시간 상태 업데이트
- 버전 히스토리
- 비교 뷰

### v3.0: 고급 기능 (2개월)
- RAG (ChromaDB) 통합
- MCP 오케스트레이션
- n8n 자동화
- 협업 기능

---

**작성자**: GitHub Copilot  
**최종 업데이트**: 2025-11-04  
**버전**: v2.0 Lite
