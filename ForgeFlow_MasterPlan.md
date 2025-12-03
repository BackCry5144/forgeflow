# 🚀 ForgeFlow 2.0 마스터플랜
## AI 기반 프로토타입 생성 및 설계 자동화 플랫폼

> **최종 업데이트:** 2025년 6월  
> **버전:** 2.0  
> **목적:** ForgeFlow의 기술 고도화 및 기능 확장을 위한 종합 로드맵

---

## 📋 목차

1. [비전 및 정체성](#1-비전-및-정체성)
2. [핵심 전략: Prompt-Code-Doc Loop](#2-핵심-전략-prompt-code-doc-loop)
3. [Wizard 2.0: No-Code Builder](#3-wizard-20-no-code-builder)
4. [Smart Refinement Architecture](#4-smart-refinement-architecture)
5. [RAG + Context Caching 전략](#5-rag--context-caching-전략)
6. [AI 기술 스택 고도화](#6-ai-기술-스택-고도화)
7. [자동화 워크플로우 (n8n)](#7-자동화-워크플로우-n8n)
8. [MCP 및 Agentic AI](#8-mcp-및-agentic-ai)
9. [최종 산출물 패키지](#9-최종-산출물-패키지)
10. [구현 로드맵](#10-구현-로드맵)

---

## 1. 비전 및 정체성

### 1.1 핵심 정체성 변화

**"From Code Generator to Project Architect"**

ForgeFlow는 단순히 코드를 대신 짜주는 도구가 아닙니다.  
컨설턴트(PM/PL)와 고객 사이의 **모호함을 제거**하고, 개발자에게 완벽한 **'설계 도면(Blueprint)'**과 **'작업 지시서(Prompt)'**를 전달하는 **프로젝트의 허브(Hub)**입니다.

### 1.2 핵심 가치 3원칙

| 원칙 | 설명 | 효과 |
|------|------|------|
| **Visualization** | 즉시 작동하는 프로토타입으로 요구사항 확정 | 재작업 0% |
| **Normalization** | 누가 입력하든 표준화된 고품질 프롬프트 생성 | 균일한 품질 |
| **Documentation** | 구현 결과물을 역설계하여 산출물 100% 자동화 | 개발 생산성 극대화 |

### 1.3 포지셔닝

```
┌─────────────────────────────────────────────────────────────────┐
│                     ForgeFlow 2.0 포지션                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐                     ┌──────────────┐          │
│  │   컨설턴트   │                     │    개발자     │          │
│  │   PM / PL    │                     │   Frontend   │          │
│  └──────┬───────┘                     └──────▲───────┘          │
│         │                                     │                  │
│         │  ① 요구사항                         │  ④ 코드 구현      │
│         ▼                                     │                  │
│  ┌──────────────────────────────────────────────────────┐       │
│  │                   ForgeFlow 2.0                      │       │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐ │       │
│  │  │ Wizard  │→│ Preview │→│ Prompt  │→│  Docs   │ │       │
│  │  │  2.0    │  │  Proto  │  │ Export  │  │  Auto   │ │       │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘ │       │
│  └──────────────────────────────────────────────────────┘       │
│         │                                     ▲                  │
│         │  ② 시각적 확인                       │  ③ 산출물        │
│         ▼                                     │                  │
│  ┌──────────────┐                     ┌──────────────┐          │
│  │     고객     │                     │    QA / PM   │          │
│  │   현업담당   │                     │   문서관리   │          │
│  └──────────────┘                     └──────────────┘          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. 핵심 전략: Prompt-Code-Doc Loop

### 2.1 워크플로우 혁신

기존의 단방향 생성 방식에서 **순환형 피드백 루프**로 전환합니다.

```
┌──────────────────────────────────────────────────────────────────────────┐
│                     The Prompt-Code-Doc Loop                              │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│   ① Input          ② Preview        ③ Export         ④ Import           │
│  ┌─────────┐      ┌─────────┐      ┌─────────┐      ┌─────────┐         │
│  │ Wizard  │ ───▶ │  React  │ ───▶ │ Prompt  │ ───▶ │  Code   │         │
│  │  Data   │      │  Proto  │      │  Text   │      │ Upload  │         │
│  └─────────┘      └─────────┘      └─────────┘      └─────────┘         │
│       │                │                                   │              │
│       │                ▼                                   ▼              │
│       │          ┌─────────┐                         ┌─────────┐         │
│       │          │ Customer│                         │  Docs   │         │
│       │          │ Confirm │                         │ Auto Gen│         │
│       │          └─────────┘                         └────┬────┘         │
│       │                                                    │              │
│       └────────────────────────────────────────────────────┘              │
│                           ⑤ Feedback Loop                                 │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘
```

### 2.2 단계별 상세

| 단계 | 명칭 | 설명 | 산출물 |
|------|------|------|--------|
| ① | **Input** | Wizard를 통해 기획 의도를 구조화된 데이터로 정의 | `wizard_data.json` |
| ② | **Preview** | React로 즉시 시각화하여 고객 컨펌 | Interactive Prototype |
| ③ | **Export** | 외부 개발 도구(Cursor, ChatGPT)를 위한 정규화된 프롬프트 출력 | Optimized Prompt |
| ④ | **Import** | 개발자가 완성한 실제 코드를 다시 업로드 | Final Code |
| ⑤ | **Output** | 기획 의도 + 실제 코드를 결합하여 문서 자동 생성 | 설계서, TC, 매뉴얼 |

---

## 3. Wizard 2.0: No-Code Builder

### 3.1 설계 원칙

자연어 서술을 배제하고 **'선택(Selection)'**과 **'데이터(Data)'** 중심의 UI로 개편하여 프롬프트 품질을 균질화합니다.

### 3.2 Data-First 접근

#### 3.2.1 스프레드시트 UI

```
┌─────────────────────────────────────────────────────────────────┐
│  📊 데이터 모델 정의 (엑셀 붙여넣기 지원)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [📋 엑셀에서 붙여넣기] [🪄 Mock Data 생성] [🔍 타입 자동 추론]   │
│                                                                  │
│  ┌─────────┬─────────┬────────┬──────┬──────┬───────────────┐  │
│  │ 한글명  │ 영문ID  │ 타입   │ 검색 │ 필수 │ 샘플데이터    │  │
│  ├─────────┼─────────┼────────┼──────┼──────┼───────────────┤  │
│  │ 자재코드│ MAT_ID  │ String │  ☑️  │  ☑️  │ M-1001       │  │
│  │ 입고수량│ QTY     │ Number │  ☐   │  ☑️  │ 1,500        │  │
│  │ 입고일자│ IN_DATE │ Date   │  ☑️  │  ☐   │ 2024-01-01   │  │
│  │ 공급가액│ AMOUNT  │ Currency│ ☐   │  ☐   │ ₩1,250,000   │  │
│  │ 상태   │ STATUS  │ Status │  ☑️  │  ☑️  │ 완료         │  │
│  └─────────┴─────────┴────────┴──────┴──────┴───────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### 3.2.2 자동 속성 추론

| 컬럼명 패턴 | 추론 타입 | 자동 설정 |
|------------|----------|----------|
| `*코드`, `*ID` | String | Key 후보, 검색조건 |
| `*수량`, `*량` | Number | 우측 정렬 |
| `*일자`, `*일시` | Date | DatePicker |
| `*금액`, `*가액` | Currency | 천단위 콤마, 우측 정렬 |
| `*상태`, `*구분` | Status | Badge/Chip |

### 3.3 Logic Builder

#### 3.3.1 Rule-based Interface

자연어 대신 **문장 완성형 UI**로 로직을 정의합니다.

```
┌─────────────────────────────────────────────────────────────────┐
│  🔧 인터랙션 정의                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Rule #1:                                                        │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ [When] 조회 버튼 ▼  클릭 시                                 │ │
│  │ [Check] 시작일자 ▼  필수값 검증 후                          │ │
│  │ [Do] 목록 조회 API ▼  호출하여                              │ │
│  │ [Update] 그리드 ▼  갱신                                    │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Rule #2:                                                        │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ [When] 그리드 행 ▼  더블클릭 시                             │ │
│  │ [Check] -                                                   │ │
│  │ [Do] 상세 모달 ▼  열기                                      │ │
│  │ [With] 선택된 행 데이터 ▼  전달                             │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  [+ 규칙 추가]                                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.4 UX 혁신

| 기능 | 설명 | 구현 방안 |
|------|------|----------|
| **Mock Data 마법봉 🪄** | 버튼 클릭으로 컬럼 성격에 맞는 가짜 데이터 자동 생성 | Faker.js 기반 |
| **모달 편집 모드** | 메인 화면 위에서 실제 모달처럼 띄워놓고 드래그앤드롭 편집 | Picture-in-Picture UI |
| **실시간 프리뷰** | Wizard 입력과 동시에 프로토타입 즉시 반영 | WebSocket 기반 |

---

## 4. Smart Refinement Architecture

### 4.1 문제 정의

현재 시스템은 수정 요청 시 **전체 코드를 재생성**합니다. 이는 다음 문제를 야기합니다:

| 문제 | 영향 |
|------|------|
| 토큰 낭비 | 동일 코드 반복 생성으로 API 비용 증가 |
| 응답 지연 | 전체 생성 시간 (10~15초) 소요 |
| 품질 저하 | 재생성 시 기존 코드와 불일치 가능성 |

### 4.2 해결: Code Chunking & Caching

#### 4.2.1 코드 블록 분해

```
┌─────────────────────────────────────────────────────────────────┐
│  생성된 React 컴포넌트 → 6개 블록으로 분해                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────┐  ┌─────────────────────┐               │
│  │  📦 IMPORTS         │  │  📦 STATE           │               │
│  │  (import 문, 상수)   │  │  (useState, useRef) │               │
│  └─────────────────────┘  └─────────────────────┘               │
│                                                                  │
│  ┌─────────────────────┐  ┌─────────────────────┐               │
│  │  📦 HANDLERS        │  │  📦 UI_SEARCH       │               │
│  │  (이벤트 핸들러)      │  │  (검색 영역 JSX)    │               │
│  └─────────────────────┘  └─────────────────────┘               │
│                                                                  │
│  ┌─────────────────────┐  ┌─────────────────────┐               │
│  │  📦 UI_GRID         │  │  📦 MODALS          │               │
│  │  (그리드 영역 JSX)    │  │  (모달 컴포넌트)    │               │
│  └─────────────────────┘  └─────────────────────┘               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### 4.2.2 Redis Hot Storage

```python
# 코드 청크 캐싱 구조
screen:{screen_id}:chunk:IMPORTS     # TTL: 1 hour
screen:{screen_id}:chunk:STATE       # TTL: 1 hour
screen:{screen_id}:chunk:HANDLERS    # TTL: 1 hour
screen:{screen_id}:chunk:UI_SEARCH   # TTL: 1 hour
screen:{screen_id}:chunk:UI_GRID     # TTL: 1 hour
screen:{screen_id}:chunk:MODALS      # TTL: 1 hour
```

### 4.3 Semantic Routing (RAG 기반)

#### 4.3.1 처리 흐름

```
┌─────────────────────────────────────────────────────────────────┐
│                    Semantic Routing Flow                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  사용자 요청: "엑셀 다운로드 버튼 색깔을 빨간색으로 바꿔줘"          │
│         │                                                        │
│         ▼                                                        │
│  ┌─────────────────────┐                                        │
│  │  Vector Embedding   │  ← 요청을 벡터로 변환                   │
│  └──────────┬──────────┘                                        │
│             │                                                    │
│             ▼                                                    │
│  ┌─────────────────────┐                                        │
│  │   Chroma DB 검색    │  ← 유사도 기반 청크 식별                │
│  │  ┌───────────────┐  │                                        │
│  │  │ UI_GRID: 0.92 │◀─┼── 최고 유사도 (버튼 관련)               │
│  │  │ HANDLERS: 0.45│  │                                        │
│  │  │ MODALS: 0.23  │  │                                        │
│  │  └───────────────┘  │                                        │
│  └──────────┬──────────┘                                        │
│             │                                                    │
│             ▼                                                    │
│  ┌─────────────────────┐                                        │
│  │  Surgical Update    │  ← UI_GRID 청크만 LLM에 전송            │
│  │  (부분 수정)         │                                        │
│  └──────────┬──────────┘                                        │
│             │                                                    │
│             ▼                                                    │
│  ┌─────────────────────┐                                        │
│  │  Merge & Response   │  ← 수정된 청크를 전체 코드에 병합        │
│  └─────────────────────┘                                        │
│                                                                  │
│  ⏱️ 처리 시간: 0.1초 (라우팅) + 3초 (부분 생성) = 3.1초           │
│  💰 비용 절감: 전체 생성 대비 60~80% 절감                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. RAG + Context Caching 전략

### 5.1 현황 분석

#### 5.1.1 현재 시스템

| 항목 | 현재 상태 | 문제점 |
|------|----------|--------|
| SYSTEM_PROMPT | ~2,000 토큰 | Context Caching 불가 (최소 32,768 필요) |
| 예제 제공 | 없음 | 일관성 부족 |
| 비용 | 100% 정가 | 최적화 여지 있음 |

### 5.2 하이브리드 아키텍처

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        하이브리드 RAG + Context Caching                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │           정적 부분 (Context Caching 대상) - ~35,000 토큰           │    │
│  │  ┌─────────────────────────────────────────────────────────────┐   │    │
│  │  │  SYSTEM_PROMPT_BASE                                         │   │    │
│  │  │  ├── 역할 정의 및 기본 규칙                                 │   │    │
│  │  │  ├── Tailwind/React 컨벤션                                  │   │    │
│  │  │  └── 디자인 토큰 (컬러, 타이포그래피)                       │   │    │
│  │  └─────────────────────────────────────────────────────────────┘   │    │
│  │  ┌─────────────────────────────────────────────────────────────┐   │    │
│  │  │  COMPONENT_LIBRARY (핵심 컴포넌트 구현 가이드)              │   │    │
│  │  │  ├── Modal 컴포넌트 (상세 예제 + 변형)                      │   │    │
│  │  │  ├── CodeView 컴포넌트 (팝업 검색)                          │   │    │
│  │  │  ├── DataGrid 컴포넌트 (테이블)                             │   │    │
│  │  │  └── Form 컴포넌트 (입력 요소들)                            │   │    │
│  │  └─────────────────────────────────────────────────────────────┘   │    │
│  │  ┌─────────────────────────────────────────────────────────────┐   │    │
│  │  │  LAYOUT_PATTERNS (레이아웃 패턴 가이드)                     │   │    │
│  │  │  ├── search-grid: 검색 + 그리드 패턴                        │   │    │
│  │  │  ├── master-detail: 마스터-디테일 패턴                      │   │    │
│  │  │  └── dashboard: 대시보드 패턴                               │   │    │
│  │  └─────────────────────────────────────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │           동적 부분 (Step 프롬프트에 삽입) - ~5,000 토큰            │    │
│  │  ┌─────────────────────────────────────────────────────────────┐   │    │
│  │  │  SELECTED_EXAMPLES (Wizard 데이터 기반 선택)                │   │    │
│  │  │  ├── 선택된 레이아웃과 유사한 완성 프로토타입 1개           │   │    │
│  │  │  ├── 사용하는 컴포넌트의 고급 예제                          │   │    │
│  │  │  └── 특수 인터랙션 예제 (해당 시)                           │   │    │
│  │  └─────────────────────────────────────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.3 Knowledge Base 구성

#### 5.3.1 디렉토리 구조

```
backend/knowledge/
├── components/
│   ├── modal/
│   │   ├── base_modal.jsx          # 기본 모달 구조
│   │   ├── form_modal.jsx          # 입력 폼 모달
│   │   ├── detail_modal.jsx        # 상세 조회 모달
│   │   └── search_popup_modal.jsx  # 팝업 검색 모달
│   │
│   ├── grid/
│   │   ├── data_grid.jsx           # 기본 데이터 그리드
│   │   ├── editable_grid.jsx       # 편집 가능 그리드
│   │   └── selection_grid.jsx      # 선택 기능 그리드
│   │
│   └── form/
│       ├── search_form.jsx         # 검색 폼
│       ├── input_form.jsx          # 입력 폼
│       └── code_view.jsx           # 팝업 검색 입력
│
├── layouts/
│   ├── search_grid_layout.jsx      # 검색 + 그리드 레이아웃
│   ├── master_detail_layout.jsx    # 마스터-디테일 레이아웃
│   └── dashboard_layout.jsx        # 대시보드 레이아웃
│
└── patterns/
    ├── crud_pattern.jsx            # CRUD 패턴
    ├── search_pattern.jsx          # 검색 패턴
    └── modal_flow_pattern.jsx      # 모달 플로우 패턴
```

### 5.4 비용 절감 효과

```
┌─────────────────────────────────────────────────────────────────┐
│                        비용 비교                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [현재]                                                          │
│  ├── 요청당 토큰: ~10,000 (SYSTEM + Steps)                      │
│  ├── 비용: 10,000 × $0.00025 = $0.0025/요청                     │
│  └── 월 1,000회: $2.50                                          │
│                                                                  │
│  [하이브리드 RAG 적용 후]                                        │
│  ├── 캐시 토큰: 35,000 × 0.25 = 8,750 토큰 상당                 │
│  ├── 동적 토큰: 10,000 × 1.00 = 10,000 토큰                     │
│  ├── 비용: 18,750 × $0.00025 = $0.0047/요청                     │
│  │   (vs 45,000 토큰 = $0.01125, 58% 절감)                      │
│  └── 월 1,000회: $4.70 (품질 대폭 향상 포함)                    │
│                                                                  │
│  💡 ROI: 품질 향상 + 일관성 확보 >> 비용 증가                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 5.5 Few-Shot Learning 전략

#### 5.5.1 자가 발전 프롬프트 공장

```python
# 저장 파이프라인 (Learning Loop)
def save_successful_prompt(wizard_data: dict, generated_prompt: str, rating: int):
    """검증된 프롬프트를 RAG에 저장"""
    if rating >= 4:  # 좋은 평가를 받은 것만 저장
        chroma_client.add(
            documents=[f"화면: {wizard_data['step1']['description']}"],
            metadatas=[{
                "layout": wizard_data['step2']['selectedLayout'],
                "rating": rating
            }],
            data={
                "wizard_input": wizard_data,
                "optimized_prompt": generated_prompt
            }
        )

# 활용 파이프라인 (Inference Loop)
def generate_with_examples(wizard_data: dict) -> str:
    """유사 성공 사례를 참조하여 생성"""
    # 1. 유사 사례 검색
    examples = chroma_client.query(
        query_text=wizard_data['step1']['description'],
        n_results=3,
        where={"layout": wizard_data['step2']['selectedLayout']}
    )
    
    # 2. Few-Shot 프롬프트 구성
    few_shot_prompt = build_few_shot_prompt(examples, wizard_data)
    
    # 3. LLM 호출
    return llm.generate(few_shot_prompt)
```

---

## 6. AI 기술 스택 고도화

### 6.1 LangChain 통합

#### 6.1.1 목표

현재의 복잡한 4단계 로직과 블록 기반 수정 로직을 LangChain 프레임워크로 공식화합니다.

#### 6.1.2 구현 방안

| 현재 문제점 | LangChain 통합 방안 | 기술 스택 |
|------------|-------------------|----------|
| 코드 블록 관리 복잡성 | Custom Tools 정의 | `langchain-community` |
| 순차 생성 제어 | Sequential Chain | `langchain.chains` |
| 수정 라우팅 | Agentic Workflow | `langchain.agents` |

```python
# LangChain Agent 예시
from langchain.agents import AgentExecutor, create_openai_functions_agent
from langchain.tools import Tool

# 커스텀 도구 정의
redis_tool = Tool(
    name="Redis_Code_Chunk",
    description="코드 청크를 Redis에서 읽거나 쓰기",
    func=redis_chunk_handler
)

chroma_tool = Tool(
    name="Chroma_Semantic_Search",
    description="수정 요청과 관련된 코드 청크 검색",
    func=chroma_search_handler
)

# 에이전트 생성
agent = create_openai_functions_agent(
    llm=llm,
    tools=[redis_tool, chroma_tool],
    prompt=refinement_prompt
)

executor = AgentExecutor(agent=agent, tools=[redis_tool, chroma_tool])
```

### 6.2 PyTorch 통합

#### 6.2.1 시각적 QA 모델

| QA 항목 | 모델 역할 | 기술 스택 |
|--------|---------|----------|
| 시각적 일관성 | 버튼 크기, 폰트, 간격 검증 | `torch`, `torchvision` |
| 구조적 정합성 | 컴포넌트 위치 논리 검증 | YOLO 기반 객체 감지 |
| 데이터 타입 검증 | wizard_data JSON 분석 | RNN 또는 GNN |

```python
# 시각적 검증 모델 예시
import torch
from torchvision import transforms

class VisualConsistencyChecker(torch.nn.Module):
    def __init__(self):
        super().__init__()
        self.cnn = torchvision.models.resnet50(pretrained=True)
        self.classifier = torch.nn.Linear(2048, 5)  # 5가지 위반 유형
    
    def forward(self, screenshot):
        features = self.cnn(screenshot)
        violations = self.classifier(features)
        return violations

# 사용 예시
checker = VisualConsistencyChecker()
screenshot = capture_prototype()
violations = checker(screenshot)
# violations: [spacing_error, font_error, color_error, alignment_error, size_error]
```

### 6.3 최종 아키텍처

```
┌─────────────────────────────────────────────────────────────────┐
│                   ForgeFlow 2.0 AI Stack                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Layer 1: Orchestration                                          │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  LangChain                                                   ││
│  │  ├── Sequential Chain (4단계 생성)                          ││
│  │  ├── Agent (수정 라우팅)                                    ││
│  │  └── Tool Integration (Redis, Chroma)                       ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  Layer 2: Cognition                                              │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  Gemini API (SDK)                                           ││
│  │  ├── 코드 생성                                              ││
│  │  ├── 문서 내용 추출                                         ││
│  │  └── Context Caching                                        ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  Layer 3: Quality Assurance                                      │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  PyTorch (Custom Models)                                    ││
│  │  ├── Visual Consistency Checker                             ││
│  │  ├── Layout Logic Validator                                 ││
│  │  └── Structured Data Validator                              ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  Layer 4: Context Store                                          │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  Chroma DB (Knowledge)  │  Redis (State/Cache)              ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. 자동화 워크플로우 (n8n)

### 7.1 통합 목표

n8n을 활용하여 ForgeFlow의 생성-문서화-배포 파이프라인을 완전 자동화합니다.

### 7.2 워크플로우 시나리오

#### 7.2.1 문서 배포 자동화

```
┌─────────────────────────────────────────────────────────────────┐
│              문서 생성 완료 → 배포 자동화 워크플로우               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │  Webhook    │───▶│   Google    │───▶│   Slack     │         │
│  │  Trigger    │    │   Drive     │    │   Notify    │         │
│  │  (문서완료) │    │   Upload    │    │   (#dev)    │         │
│  └─────────────┘    └─────────────┘    └──────┬──────┘         │
│                                                │                 │
│                                                ▼                 │
│                                         ┌─────────────┐         │
│                                         │    Jira     │         │
│                                         │   Ticket    │         │
│                                         │   Create    │         │
│                                         └─────────────┘         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### 7.2.2 프로토타입 생성 with Context Caching

```json
{
  "name": "ForgeFlow Prototype Generator",
  "nodes": [
    {
      "name": "Webhook Trigger",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "path": "generate-prototype",
        "httpMethod": "POST"
      }
    },
    {
      "name": "AI Agent - Vector Search",
      "type": "@n8n/n8n-nodes-langchain.agent",
      "parameters": {
        "systemMessage": "Vector DB에서 유사 예제 검색",
        "tools": ["vectorStoreTool"]
      }
    },
    {
      "name": "HTTP Request - OpenAI with Cache",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "https://api.openai.com/v1/chat/completions",
        "jsonParameters": true,
        "bodyParametersJson": {
          "model": "gpt-4o",
          "messages": [
            {
              "role": "system",
              "content": [
                {
                  "type": "text",
                  "text": "{{ $json.systemPrompt }}",
                  "cache_control": {"type": "ephemeral"}
                }
              ]
            }
          ]
        }
      }
    }
  ]
}
```

### 7.3 Context Caching 효과

| 구분 | 일반 요청 | 캐시 적용 | 절감률 |
|------|----------|----------|--------|
| Input 비용 | $0.0125 | $0.0024 | 80% |
| 응답 시간 | 5초 | 2초 | 60% |

---

## 8. MCP 및 Agentic AI

### 8.1 MCP (Model Context Protocol) 도입

#### 8.1.1 ForgeFlow as MCP Tool

```typescript
// MCP Server 정의
const forgeFlowTool = {
  name: "forgeflow_generate",
  description: "ForgeFlow에서 프로토타입 생성",
  inputSchema: {
    type: "object",
    properties: {
      screenName: { type: "string" },
      layout: { type: "string" },
      components: { type: "array" }
    }
  },
  handler: async (input) => {
    const response = await forgeFlowAPI.generate(input);
    return response.prototype_html;
  }
};
```

#### 8.1.2 활용 시나리오

```
┌─────────────────────────────────────────────────────────────────┐
│                    MCP 통합 시나리오                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [Cursor/Claude Desktop]                                         │
│  User: "ForgeFlow에서 자재 관리 화면 가져와서 Grid 컬럼 수정해줘"   │
│         │                                                        │
│         ▼                                                        │
│  ┌─────────────────────┐                                        │
│  │  MCP Client         │                                        │
│  │  (Cursor Plugin)    │                                        │
│  └──────────┬──────────┘                                        │
│             │ invoke forgeflow_generate                          │
│             ▼                                                    │
│  ┌─────────────────────┐                                        │
│  │  ForgeFlow MCP      │                                        │
│  │  Server             │                                        │
│  └──────────┬──────────┘                                        │
│             │ 프로토타입 코드 반환                                │
│             ▼                                                    │
│  [IDE에 코드 자동 삽입]                                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 8.2 Agentic AI 기능

#### 8.2.1 QA Agent

```python
class QAAgent:
    """생성된 프로토타입을 자동으로 테스트하는 에이전트"""
    
    async def run_tests(self, prototype_html: str, test_script: str):
        # 1. Headless Browser 실행
        browser = await playwright.chromium.launch(headless=True)
        page = await browser.new_page()
        
        # 2. 프로토타입 로드
        await page.set_content(prototype_html)
        
        # 3. 테스트 스크립트 실행
        results = await self.execute_tests(page, test_script)
        
        # 4. 리포트 생성
        report = self.generate_report(results)
        
        return report
```

#### 8.2.2 DB Architect Agent

```python
class DBArchitectAgent:
    """데이터 모델을 기반으로 DDL 생성 및 실행"""
    
    def generate_ddl(self, wizard_data: dict) -> str:
        columns = wizard_data['step1']['columns']
        table_name = wizard_data['step1']['screenName']
        
        ddl = f"CREATE TABLE {table_name} (\n"
        for col in columns:
            ddl += f"  {col['id']} {self.map_type(col['type'])},\n"
        ddl += ");"
        
        return ddl
    
    async def execute_ddl(self, ddl: str, target_db: str):
        # 개발 DB에 테이블 생성
        await self.db_connection.execute(ddl)
```

---

## 9. 최종 산출물 패키지

### 9.1 개발자 Hand-off 패키지

**"개발자는 고민하지 말고 구현만 하세요."**

| 산출물 | 형식 | 설명 |
|--------|------|------|
| Interactive Prototype | URL | 개발 목표를 명확히 보여주는 시뮬레이션 링크 |
| Optimized Prompt | Text | 외부 도구에 바로 입력 가능한 최적화된 명령어 |
| 화면 설계서 | .docx | 스크린샷, UI 구조도, 이벤트 명세 포함 |
| 테스트 계획서 | .xlsx | TC ID, 절차, 기대 결과 포함 |
| 사용자 매뉴얼 | .docx | 최종 사용자를 위한 따라 하기 가이드 |
| 자동화 스크립트 | .spec.ts | 즉시 실행 가능한 E2E 테스트 코드 |

### 9.2 Auto-Driving 캡처 기능

```typescript
// 자동 캡처 시퀀스
async function captureAllScreenStates(iframeRef: HTMLIFrameElement) {
  const screenshots: Screenshot[] = [];
  
  // 1. 기본 화면 캡처
  screenshots.push(await capture('main'));
  
  // 2. 모든 모달 순회
  const modals = getModalList(iframeRef);
  for (const modal of modals) {
    await openModal(modal.id);
    screenshots.push(await capture(`modal-${modal.id}`));
    await closeModal(modal.id);
  }
  
  // 3. 각 상태별 캡처
  await fillSearchForm();
  await clickSearchButton();
  screenshots.push(await capture('after-search'));
  
  return screenshots;
}
```

---

## 10. 구현 로드맵

### Phase 1: 기반 구축 (4주)

| 주차 | 작업 항목 | 담당 |
|------|----------|------|
| 1 | Knowledge Base 구축 (컴포넌트 예제 40개) | Backend |
| 2 | SYSTEM_PROMPT 확장 (35,000+ 토큰) | Backend |
| 3 | Context Caching 검증 및 적용 | Backend |
| 4 | Wizard 2.0 UI 프로토타입 | Frontend |

### Phase 2: RAG 시스템 (3주)

| 주차 | 작업 항목 | 담당 |
|------|----------|------|
| 5 | ChromaDB 설정 및 RAGService 구현 | Backend |
| 6 | Code Chunking 로직 구현 | Backend |
| 7 | Semantic Routing 테스트 | Backend |

### Phase 3: 고도화 (3주)

| 주차 | 작업 항목 | 담당 |
|------|----------|------|
| 8 | LangChain Agent 통합 | Backend |
| 9 | n8n 워크플로우 구축 | DevOps |
| 10 | E2E 테스트 및 성능 최적화 | QA |

### Phase 4: 확장 (진행 중)

| 항목 | 상태 | 비고 |
|------|------|------|
| PyTorch QA 모델 | 계획 | 시각적 검증 자동화 |
| MCP 서버 구현 | 계획 | IDE 통합 |
| Agentic AI | 계획 | 자율 테스트 실행 |

---

## 📎 참고 자료

- [Google Gemini Context Caching](https://ai.google.dev/gemini-api/docs/caching)
- [LangChain Documentation](https://python.langchain.com/)
- [ChromaDB Documentation](https://docs.trychroma.com/)
- [n8n Documentation](https://docs.n8n.io/)
- [MCP Specification](https://spec.modelcontextprotocol.io/)

---

> 📅 최초 작성: 2025-01-01  
> 📅 최종 수정: 2025-06-XX  
> 👤 작성자: ForgeFlow Team  
> 🔄 버전: 2.0
