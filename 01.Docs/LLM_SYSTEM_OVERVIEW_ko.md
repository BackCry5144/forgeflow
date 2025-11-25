# -*- coding: utf-8 -*-
# ForgeFlow Lite 시스템 개요 (LLM 및 개발자용)

목적: 이 문서는 ForgeFlow Lite 시스템을 LLM이나 개발자가 명확히 이해할 수 있도록 아키텍처, 데이터 플로우, API, 프롬프트, 캐싱, DB 스키마 및 확장 포인트를 상세하고 명확하게 설명합니다.

---

## 1. 전반 시스템 아키텍처

- 프론트엔드: React + Vite + TypeScript + Tailwind CSS. 워크스페이스, 위저드, `CodePreview`를 렌더링합니다.
- 백엔드: FastAPI (Python). REST API, 라우터, 서비스가 존재합니다.
- AI Provider: Google Gemini (`google.generativeai`), `services/ai_service.py`로 추상화되어 있습니다.
- 캐시: Redis (선택) 를 `SYSTEM_PROMPT`의 컨텍스트 캐싱에 사용합니다.
- 데이터베이스: PostgreSQL, SQLAlchemy 모델은 `backend/models`에 있습니다.

구성요소:
- 프론트엔드(`frontend/`)
  - `CodePreview.tsx`: iframe 안에서 생성된 React 코드를 실행합니다(Babel 런타임 + TS 제거).
  - 위저드 및 UI 페이지: 위저드 데이터를 수집하고 `POST /api/ai/generate`를 호출합니다.
- 백엔드(`backend/`)
  - `main.py`: FastAPI 앱 부트스트랩. 등록된 라우터
  - `routers/ai.py`: 프로토타입 생성 엔드포인트
  - `services/ai_service.py`: LLM 호출과 컨텍스트 캐싱 로직
  - `services/cache_service.py`: Redis 캐시 관리자
  - `models/`: SQLAlchemy 모델 (`screens`, `wizard_test_results`, `menus`, 등)

---

## 2. 주요 데이터 플로우 (요청 → 프로토타입)

1. 프론트엔드 위저드가 `POST /api/ai/generate`를 호출합니다. 페이로드 예:
```json
{
  "screen_id": 15,
  "wizard_data": { /* step1..step4 데이터 */ },
  "menu_name": "예산 관리",
  "screen_name": "예산관리 조회 화면"
}
```

2. `routers/ai.generate_prototype`가 화면과 위저드 데이터를 검증한 후 `services/ai_service.generate_prototype()`를 호출합니다.

3. `AIService.generate_prototype()`는 `get_wizard_based_prompt()`를 통해 `user_prompt`를 생성합니다(`utils/prompt_templates.py` 사용).

4. 컨텍스트 캐싱:
   - `services/cache_service`가 `SYSTEM_PROMPT`의 해시를 계산하고 Redis를 조회합니다.
   - 캐시가 있으면 Gemini의 cached content를 사용하여 `user_prompt`만 전송합니다.
   - 캐시가 없으면 Gemini에서 캐시를 생성하고 Redis에 저장한 후 사용합니다.

5. LLM이 React 코드를 반환하면(jsx/tsx), 백엔드는 검증/정리 후 `prototype_html`을 반환합니다.

6. 백엔드는 결과를 `wizard_test_results` 테이블에 저장합니다 (`final_prompt`, `raw_wizard_data` 등 포함).

7. 프론트엔드는 `CodePreview`로 받은 코드를 iframe에서 렌더링합니다.

---

## 3. 주요 파일 및 엔드포인트

- `backend/main.py` → 앱 부트스트랩. 등록된 라우터:
  - `/api/menus`
  - `/api/screens`
  - `/api/ai/generate`
  - `/api/cache/*`

- `backend/services/ai_service.py` → LLM 통합; 주요 함수:
  - `generate_prototype(prompt, menu_name, screen_name, wizard_data)`
    - 반환값: `{ "prototype_html": <str>, "final_prompt": <str> }`

- `backend/services/cache_service.py` → Redis 캐시 헬퍼:
  - `get_cached_context(system_prompt)`
  - `set_cached_context(system_prompt, cache_id, ttl_hours=1)`
  - `invalidate_cache(system_prompt)`

- `frontend/src/components/workspace/CodePreview.tsx` → iframe 런타임(주요 기능)
  - TypeScript 문법 제거
  - Babel standalone + React UMD 주입
  - `ReactDOM.createRoot(...).render(React.createElement(Component))` 호출

---

## 4. 프롬프트 템플릿

- `backend/utils/prompt_templates.py`에 `SYSTEM_PROMPT`와 `get_wizard_based_prompt()`가 있습니다.
- `SYSTEM_PROMPT`는 모델에게 순수 import 없이 Tailwind + shadcn/ui 스타일의 JSX 코드를 만들도록 지시합니다.
- `SYSTEM_PROMPT`를 변경하면 `DELETE /api/cache/invalidate`를 호출하여 캐시를 무효화해야 합니다.

---

## 5. 데이터베이스 모델 요약

- `screens` 테이블: 화면 메타데이터와 `prototype_html` 저장
  - 주요 컬럼: `id`, `menu_id`, `name`, `prototype_html`, `status`, `created_at`

- `wizard_test_results` 테이블: 생성 메타데이터와 LLM 프롬프트 히스토리 저장
  - 주요 컬럼: `id`, `created_at`, `menu_id`, `screen_name`, `layout_type`, `raw_wizard_data`, `final_prompt`, `test_status`

---

## 6. 컨텍스트 캐싱(Redis + Gemini)

- 캐시 키: `gemini_cache:{sha256(SYSTEM_PROMPT)[:16]}`
- 캐시 MISS 시: Gemini `CachedContent.create_async(...)`로 캐시 생성 후 Redis에 `cache.name` 저장
- 캐시 HIT 시: `GenerativeModel.from_cached_content(cache)`를 사용하여 `user_prompt`만 전송
- 캐시 문제 발생 시: 폴백으로 전체 프롬프트 전송

장점: SYSTEM_PROMPT가 크면 토큰 비용과 응답 시간을 크게 절감합니다.

---

## 7. 확장 포인트와 Provider 교체

- `services/ai_service.py`를 Provider 추상화하면 `GeminiProvider`, `FigmaProvider`, `ClaudeProvider` 등으로 쉽게 확장할 수 있습니다.
- n8n과 같은 오케스트레이션은 비동기 파이프라인(알림, 자동화)에 통합하되, 지연에 민감한 경로는 Backend에 두는 것이 좋습니다.

---

## 8. 보안 및 운영 노트

- API 키는 환경변수로 관리하며 `.env`는 커밋 금지
- 운영 환경에서는 관리형 Redis 사용 또는 Redis Sentinel/Cluster 구성 권장
- CORS는 `CORS_ORIGINS`로 제한

---

## 9. 로컬 실행 최소 체크리스트

1. PostgreSQL 준비
2. Redis(선택) 실행 또는 `REDIS_URL` 비워 캐시 비활성화
3. Backend: `cd backend && python main.py`
4. Frontend: `cd frontend && npm run dev`

---

## 10. API 예시

- 프로토타입 생성
```http
POST /api/ai/generate
Content-Type: application/json

{
  "screen_id": 15,
  "wizard_data": { /* wizard JSON */ },
  "menu_name": "예산 관리",
  "screen_name": "예산관리 조회 화면"
}
```

- 캐시 통계 조회
```http
GET /api/cache/stats
```

- SYSTEM_PROMPT 캐시 무효화
```http
DELETE /api/cache/invalidate
```

---

## 11. LLM의 주의사항

- 출력은 `export default function ComponentName() { ... }` 형식의 순수 JSX여야 합니다.
- 외부 import 금지
- Tailwind 유틸리티 클래스 사용 권장 (표준 태그로 구현)
- 컴포넌트 내부에 샘플 데이터 포함 권장

---

## 12. 연락처 및 다음 단계

- Provider 전환을 위해 `services/ai_service.py`에 Strategy Pattern 구현
- RAG 기반 CSS 학습을 위해 벡터 DB(Pinecone/Weaviate) 평가 및 프롬프트 구성에 RAG 검색 추가

---

이 파일은 LLM 및 개발자가 읽을 수 있는 표준 개요로 제작되었습니다. 필요하면 더 짧은 요약본 `README-LLM.md` 또는 모든 엔드포인트와 모델을 설명하는 OpenAPI 스키마, cURL 예시, 또는 Postman 컬렉션을 바로 생성하겠습니다.
