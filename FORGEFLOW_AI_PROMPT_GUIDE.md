# ForgeFlow 프로젝트 전체 프롬프트 (Cursor & GitHub Copilot 역공학)

## 1. 프로그램 목적

ForgeFlow는 AI 기반 화면 설계, 테스트, 문서 자동화를 지원하는 통합 개발 플랫폼입니다. 사용자는 Step by Step Wizard를 통해 화면/기능/테스트/매뉴얼 정보를 입력하고, AI와 연동하여 설계서, 테스트케이스, 사용자 매뉴얼 등 다양한 산출물을 자동 생성할 수 있습니다.

---

## 2. 시스템 아키텍처

- **Frontend**: React + TypeScript SPA, Wizard 기반 입력, 문서/테스트/매뉴얼 생성 UI
- **Backend**: FastAPI(Python) RESTful API, AI 연동, DB 관리, 파일 업로드/다운로드
- **Database**: PostgreSQL, 화면/Wizard/문서/테스트 결과 저장
- **AI 서비스**: OpenAI, Google AI 등 LLM 연동 (Prompt/Context Engineering)
- **테스트/배포**: Playwright E2E 테스트, Docker 기반 컨테이너 배포

아키텍처 다이어그램:
```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│  Frontend  │ <--> │  Backend    │ <--> │  Database   │
│ (React)    │      │ (FastAPI)   │      │ (PostgreSQL)│
└─────────────┘      └─────────────┘      └─────────────┘
        │                  │
        ▼                  ▼
   Step Wizard        AI/LLM API
   Prompt 입력        (OpenAI 등)
```

---

## 3. 주요 기능 목록

- Step by Step Wizard 기반 입력 및 Context 관리
- 화면 설계서, 테스트케이스, 사용자 매뉴얼 자동 생성 (AI 연동)
- 프로토타입 코드 미리보기 및 스크린샷 캡처/업로드
- 설계서/테스트/매뉴얼 파일 다운로드
- Wizard 임시저장/불러오기 기능
- 생성 진행상황 실시간 폴링
- 관리자/사용자 권한 분리 및 데이터 관리
- Playwright 기반 E2E 테스트
- Docker 기반 배포 및 통합 환경 구성

---

## 4. 프롬프트 예시 (Cursor/Copilot용)

### 4.1. 전체 시스템 생성 요청
```
- React + TypeScript 기반 Wizard UI를 만들어줘.
- FastAPI로 화면/문서/테스트/매뉴얼 생성 API를 만들어줘.
- PostgreSQL DB 모델과 마이그레이션 스크립트를 작성해줘.
- OpenAI 연동을 위한 Prompt/Context Engineering 코드를 추가해줘.
- Playwright로 E2E 테스트 코드를 만들어줘.
- Dockerfile과 docker-compose로 전체 시스템을 배포할 수 있게 해줘.
```

### 4.2. 기능별 상세 요청
```
- Step Wizard 각 단계별 입력값을 Context로 통합하는 코드를 작성해줘.
- 화면 설계서 생성 프롬프트와 예시 Context를 마크다운으로 출력해줘.
- 테스트케이스 자동 생성 프롬프트와 예시를 보여줘.
- 사용자 매뉴얼 자동 생성 프롬프트와 예시를 보여줘.
- 프론트엔드에서 html2canvas로 스크린샷을 캡처해 백엔드로 업로드하는 코드를 작성해줘.
- 생성 진행상황을 폴링하는 API와 프론트 코드를 만들어줘.
- Wizard 임시저장/불러오기 API와 UI를 만들어줘.
```

### 4.3. 배포/운영 요청
```
- FastAPI 백엔드, React 프론트엔드, PostgreSQL DB를 docker-compose로 통합 배포하는 예시를 만들어줘.
- 운영/개발 환경 분리 전략을 설명해줘.
- E2E 테스트 자동화 스크립트를 작성해줘.
```

---

## 5. Prompt Engineering & Context Engineering Best Practice

- 각 Wizard 단계별 입력값을 명확하게 분리하고, 목적에 따라 Context를 구조화
- AI 요청 시, 프롬프트와 Context를 분리하여 전달
- 예시: "아래 Context를 참고하여, 화면 설계서를 한글로 작성해줘."
- Context 예시:
```json
{
  "screenName": "이상발생 접수",
  "layout": "search-grid",
  "components": [ ... ],
  "interactions": [ ... ]
}
```
- 프롬프트 예시:
```
아래 Context를 참고하여, 화면 설계서를 한글로 작성해줘.
```

---

## 6. 참고: AI 도구 활용 가이드

- Cursor, GitHub Copilot에서 위 프롬프트를 입력하면, ForgeFlow와 동일한 구조/기능/코드를 자동 생성할 수 있습니다.
- 시스템 목적, 아키텍처, 기능, 프롬프트 예시를 모두 포함하여 요청하면, 원하는 결과를 빠르게 얻을 수 있습니다.

---

> 이 파일을 참고하여 프로젝트 전체를 역공학하거나, 부분 기능을 AI 도구로 빠르게 생성할 수 있습니다.

# ForgeFlow Lite 프로젝트 컨텍스트 및 코딩 가이드라인

당신은 MES/ERP 애플리케이션을 위한 AI 기반 프로토타입 생성 시스템인 **ForgeFlow Lite** 프로젝트의 전문 풀스택 개발자입니다.

## 1. 프로젝트 개요
ForgeFlow Lite는 사용자가 단계별 마법사(Step-by-Step Wizard)를 통해 입력한 요구사항을 바탕으로 React 프로토타입과 기술 문서를 자동으로 생성해 주는 시스템입니다.
- **프론트엔드:** React + Vite + TypeScript + Tailwind CSS
- **백엔드:** Python (FastAPI) + SQLAlchemy
- **AI 엔진:** Google Gemini (via `google.generativeai`)
- **데이터베이스:** PostgreSQL
- **캐시:** Redis (컨텍스트 캐싱용)

## 2. 주요 아키텍처 및 데이터 흐름

### A. 코드 생성 파이프라인 (Backend)
핵심 로직은 `services/ai_service.py`에 있습니다. 거대한 단일 프롬프트를 사용하는 대신, **4단계 채팅 세션 전략(4-Stage ChatSession Strategy)**을 사용합니다:
1.  **Step 1 (Utils):** 유틸리티 함수, Lucide 아이콘, `CodeView`/`Modal` 공통 컴포넌트 정의.
2.  **Step 2 (State):** `useState`, 핸들러 함수, 비즈니스 로직 정의.
3.  **Step 3 (UI):** Tailwind CSS를 사용하여 메인 레이아웃(검색 영역, 그리드) 렌더링 구현.
4.  **Step 4 (Modals):** 모달 팝업 구현 및 컴포넌트 함수 닫기.

*참고: `_send_chat_with_retry` 함수는 API 할당량 초과(429 에러) 발생 시 자동으로 대기(sleep) 및 재시도(retry)를 처리합니다.*

### B. 문서 생성 (역설계, Reverse Engineering)
생성된 코드와 Wizard 데이터를 역설계하여 기술 문서를 생성합니다.
- **경로:** `services/document_service.py`
- **방식:** LLM을 사용하여 React 코드에서 JSON 데이터를 추출한 뒤, 템플릿을 사용하여 파일(`.docx`, `.xlsx`)을 생성합니다.
- **산출물:** 설계서(Design Spec), 테스트 계획서(Test Plan), 사용자 매뉴얼(User Manual) - (자동 캡처된 스크린샷 포함).

### C. 프론트엔드 렌더링 (CodePreview)
- **경로:** `components/workspace/CodePreview.tsx`
- **메커니즘:** `Babel-standalone`을 사용하여 `iframe` 내부에서 생성된 React 코드를 실시간으로 실행합니다.
- **제약사항:** 외부 라이브러리 `import` **금지**. `React`, `Lucide`, `Tailwind`는 CDN을 통해 전역으로 주입됩니다. 실행 전 코드 정제 로직이 `import` 구문과 TypeScript 타입을 제거합니다.

### D. 오토 드라이빙 스크린샷 (Frontend)
- **경로:** `utils/AutoCaptureService.ts`
- **메커니즘:** `iframe` 내부의 버튼을 프로그래매틱하게 클릭하여 모달을 열고, `html2canvas`로 스크린샷을 캡처한 뒤 백엔드로 전송하여 문서에 삽입합니다.

## 3. 코딩 표준 및 규칙

### Backend (Python/FastAPI)
- **Async/Await:** 모든 I/O 바운드 작업(DB, AI 호출)에는 `async def`를 사용합니다.
- **Type Hints:** 엄격한 타입 타이핑을 준수합니다 (예: `def func(a: int) -> str:`).
- **Error Handling:** 도메인 에러에는 `AIServiceError`를 사용하고, 외부 호출은 try/except 블록으로 감쌉니다.
- **Logging:** `print()` 대신 `logger.info()` / `logger.error()`를 사용합니다.

### Frontend (React/TypeScript)
- **Components:** Hooks를 사용하는 함수형 컴포넌트로 작성합니다. 아이콘은 `lucide-react`를 사용합니다.
- **Styling:** 오직 Tailwind CSS 유틸리티 클래스만 사용합니다. 커스텀 CSS 파일 생성은 지양합니다.
- **State Management:** `useState`와 Props Drilling을 사용합니다. 이 MVP 규모에서는 Redux/Zustand 사용을 지양합니다.
- **Iframe Interaction:** 프리뷰 iframe을 안전하게 조작하기 위해 `ref`와 `contentWindow`를 사용합니다.

### AI Prompt Engineering
- **템플릿 경로:** `utils/prompt_templates.py`
- **규칙 1:** 생성된 코드는 반드시 **단일 파일(Single File)** 컴포넌트여야 합니다.
- **규칙 2:** 표준 HTML 태그(div, button, input)를 사용하여 **shadcn/ui** 스타일을 구현합니다.
- **규칙 3:** 멀티 턴 생성 시 코드를 반복하지 마세요. LLM에게 *새로운 부분만* 출력하도록 지시해야 합니다.

## 4. 주요 파일 맵 (Critical Files Map)
- `backend/services/ai_service.py`: 핵심 AI 로직 (ChatSession, Context Caching).
- `backend/services/document_service.py`: Word/Excel 생성 로직.
- `backend/routers/ai.py`: API 엔드포인트 및 콜백 처리.
- `frontend/src/components/workspace/CodePreview.tsx`: 런타임 샌드박스.
- `frontend/src/utils/AutoCaptureService.ts`: 자동 스크린샷 캡처 로직.

## 5. 현재 작업 컨텍스트
(여기에 현재 구현 중이거나 디버깅 중인 기능에 대한 구체적인 내용을 입력하세요.)