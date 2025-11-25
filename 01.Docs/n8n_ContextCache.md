# n8n AI Agent + OpenAI Context Caching 전략

## 목표
n8n의 AI Agent 노드를 최대한 활용하면서 OpenAI의 Context Caching 기능을 통합하여 비용 절감 및 응답 속도 향상

## 🎯 핵심 아이디어

**AI Agent와 HTTP Request 노드를 조합**하여 각자의 장점을 극대화:
- **AI Agent**: Vector Store Tool을 활용한 컨텍스트 검색 및 추론
- **HTTP Request**: OpenAI API 직접 호출로 `cache_control` 파라미터 적용

## 방법 1: AI Agent + HTTP Request 하이브리드 (권장)

### 워크플로우 구조

```
┌─────────────────────────────────────┐
│  1. Vector Store Tool (AI Agent)    │  ← Chroma DB에서 컨텍스트 검색
│     - Vector DB 쿼리                 │
│     - 관련 예제 추출                  │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│  2. Function 노드                    │  ← 검색 결과 포맷팅
│     - 검색 결과 정리                  │
│     - Cache-friendly 구조 생성        │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│  3. HTTP Request (OpenAI)           │  ← Context Caching 적용
│     - cache_control 파라미터          │
│     - 시스템 프롬프트 + 벡터 결과      │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│  4. AI Agent (최종 생성)              │  ← 생성 로직
│     - 캐시된 컨텍스트 활용             │
│     - HTML/코드 생성                  │
└─────────────────────────────────────┘
```

### 장점
- ✅ AI Agent의 Vector Store 기능 활용
- ✅ OpenAI Context Caching 적용
- ✅ 비용 절감 (캐시 히트 시 90% 할인)
- ✅ 응답 속도 향상 (캐시된 토큰은 즉시 처리)

## 방법 2: AI Agent의 System Message 활용

AI Agent 노드의 **System Message**에 정적인 가이드를 넣고, 동적인 Vector 결과만 User Message로 전달:

```javascript
// n8n Workflow 구조
{
  "nodes": [
    {
      "name": "AI Agent - Context Retrieval",
      "type": "@n8n/n8n-nodes-langchain.agent",
      "parameters": {
        "systemMessage": `
          # 프로토타입 생성 전문가
          당신은 HTML 프로토타입 생성 전문가입니다.
          
          ## 지원 레이아웃
          - search-grid: 검색 기능 + 그리드 뷰
          - master-detail: 마스터-디테일 패턴
          - dashboard: 대시보드 레이아웃
          
          ## 생성 원칙
          1. 시맨틱 HTML 사용
          2. Tailwind CSS 클래스 적용
          3. 반응형 디자인
        `,
        "text": "={{ $json.wizardData }}", // 동적 데이터
        "tools": ["vectorStoreTool"] // Chroma DB 검색
      }
    }
  ]
}
```

### 한계
- ⚠️ AI Agent 노드는 `cache_control` 파라미터를 직접 지원하지 않음
- ⚠️ 시스템 메시지가 변경될 때마다 새로운 캐시 생성

## 방법 3: AI Agent + Sub-Agent 패턴

여러 전문 에이전트를 조합하여 각 단계별로 캐싱:

```
Main AI Agent (Orchestrator)
  ├─ Sub-Agent 1: Layout Selection (캐시된 시스템 프롬프트)
  ├─ Sub-Agent 2: Component Placement (캐시된 시스템 프롬프트)
  └─ Sub-Agent 3: HTML Generation (캐시된 시스템 프롬프트)
```

### Sub-Agent 예시

```javascript
// Sub-Agent 1: Layout Expert
{
  "name": "Layout Expert Agent",
  "type": "@n8n/n8n-nodes-langchain.agent",
  "parameters": {
    "systemMessage": `
      # Layout Selection Expert
      당신은 UI 레이아웃 전문가입니다.
      
      ## 지원 레이아웃
      1. search-grid: 검색 + 그리드 뷰
         - 사용 사례: 목록 조회, 필터링이 많은 화면
         - 구성: 검색바 + 필터 + 테이블/카드 그리드
      
      2. master-detail: 마스터-디테일 패턴
         - 사용 사례: 상세 정보 표시가 중요한 화면
         - 구성: 왼쪽 목록 + 오른쪽 상세 패널
      
      3. dashboard: 대시보드 레이아웃
         - 사용 사례: 통계, 집계, 차트가 많은 화면
         - 구성: 위젯 그리드 + 차트 + KPI 카드
      
      ## 선택 기준
      - 데이터 조회가 많으면: search-grid
      - 상세 정보 표시가 중요하면: master-detail
      - 통계/집계가 많으면: dashboard
    `,
    "tools": ["vectorStoreTool"]
  }
}
```

## 🚀 ForgeFlow Lite 실전 적용

### 완전한 n8n 워크플로우 JSON

```json
{
  "name": "ForgeFlow Prototype Generator with Context Caching",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "generate-prototype",
        "responseMode": "responseNode"
      },
      "id": "webhook-trigger",
      "name": "Webhook Trigger",
      "type": "n8n-nodes-base.webhook",
      "position": [250, 300],
      "typeVersion": 1
    },
    {
      "parameters": {
        "functionCode": "// Wizard 데이터 파싱 및 구조화\nconst wizardData = $input.item.json;\n\nreturn {\n  json: {\n    screenName: wizardData.step1.screenName,\n    description: wizardData.step1.description,\n    layout: wizardData.step2.selectedLayout,\n    components: wizardData.step3.components,\n    interactions: wizardData.step4.interactions\n  }\n};"
      },
      "id": "parse-wizard-data",
      "name": "Parse Wizard Data",
      "type": "n8n-nodes-base.function",
      "position": [450, 300],
      "typeVersion": 1
    },
    {
      "parameters": {
        "systemMessage": "당신은 Vector DB 검색 전문가입니다. 사용자의 레이아웃 요구사항에 맞는 예제를 찾아주세요.",
        "text": "={{ $json.layout }} 레이아웃에 해당하는 HTML 예제와 컴포넌트 패턴을 검색해주세요.",
        "hasOutputParser": false,
        "options": {
          "systemMessage": "",
          "maxIterations": 10,
          "returnIntermediateSteps": false
        },
        "model": "gpt-4o-mini"
      },
      "id": "ai-agent-vector-search",
      "name": "AI Agent - Vector Search",
      "type": "@n8n/n8n-nodes-langchain.agent",
      "position": [650, 300],
      "typeVersion": 1
    },
    {
      "parameters": {
        "functionCode": "// Vector 검색 결과 + 시스템 가이드 결합\nconst vectorResults = $input.item.json.output;\nconst wizardData = $('Parse Wizard Data').item.json;\n\n// Context Caching을 위한 구조 생성\nconst cachedContext = {\n  systemPrompt: `# HTML 프로토타입 생성 전문가\n\n당신은 사용자의 요구사항을 분석하여 고품질 HTML 프로토타입을 생성하는 전문가입니다.\n\n## 생성 원칙\n1. 시맨틱 HTML5 태그 사용\n2. Tailwind CSS 유틸리티 클래스 적용\n3. 반응형 디자인 (모바일 퍼스트)\n4. 접근성 고려 (ARIA 속성)\n\n## 레이아웃 패턴\n### search-grid\n- 검색바 + 필터 영역\n- 그리드/테이블 뷰\n- 페이지네이션\n\n### master-detail\n- 왼쪽: 항목 목록\n- 오른쪽: 선택된 항목 상세\n- 반응형: 모바일에서는 스택\n\n### dashboard\n- KPI 카드 그리드\n- 차트 영역\n- 위젯 레이아웃\n\n## 컴포넌트 라이브러리\n- button: Tailwind 버튼 스타일\n- textbox: Input 필드 + 레이블\n- combo: Select 드롭다운\n`,\n  examples: vectorResults,\n  wizardData: wizardData\n};\n\nreturn { json: cachedContext };"
      },
      "id": "build-cached-context",
      "name": "Build Cached Context",
      "type": "n8n-nodes-base.function",
      "position": [850, 300],
      "typeVersion": 1
    },
    {
      "parameters": {
        "method": "POST",
        "url": "https://api.openai.com/v1/chat/completions",
        "authentication": "predefinedCredentialType",
        "nodeCredentialType": "openAiApi",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "Content-Type",
              "value": "application/json"
            }
          ]
        },
        "sendBody": true,
        "contentType": "json",
        "bodyParameters": {
          "parameters": []
        },
        "jsonParameters": true,
        "options": {},
        "bodyParametersJson": "={\n  \"model\": \"gpt-4o\",\n  \"messages\": [\n    {\n      \"role\": \"system\",\n      \"content\": [\n        {\n          \"type\": \"text\",\n          \"text\": {{ $json.systemPrompt }} + \"\\n\\n## 참고 예제\\n\" + {{ $json.examples }},\n          \"cache_control\": {\"type\": \"ephemeral\"}\n        }\n      ]\n    },\n    {\n      \"role\": \"user\",\n      \"content\": \"다음 요구사항에 맞는 HTML 프로토타입을 생성해주세요:\\n\\n화면명: {{ $json.wizardData.screenName }}\\n설명: {{ $json.wizardData.description }}\\n레이아웃: {{ $json.wizardData.layout }}\\n컴포넌트: {{ JSON.stringify($json.wizardData.components) }}\\n상호작용: {{ JSON.stringify($json.wizardData.interactions) }}\"\n    }\n  ],\n  \"temperature\": 0.7,\n  \"max_tokens\": 4096\n}"
      },
      "id": "http-openai-cache",
      "name": "HTTP Request - OpenAI with Cache",
      "type": "n8n-nodes-base.httpRequest",
      "position": [1050, 300],
      "typeVersion": 4.1
    },
    {
      "parameters": {
        "functionCode": "// OpenAI 응답 파싱\nconst response = $input.item.json;\nconst generatedHtml = response.choices[0].message.content;\n\n// Cache 사용 여부 확인\nconst cacheUsed = response.usage?.prompt_tokens_details?.cached_tokens > 0;\n\nreturn {\n  json: {\n    prototype_html: generatedHtml,\n    cache_hit: cacheUsed,\n    usage: response.usage\n  }\n};"
      },
      "id": "parse-response",
      "name": "Parse OpenAI Response",
      "type": "n8n-nodes-base.function",
      "position": [1250, 300],
      "typeVersion": 1
    },
    {
      "parameters": {
        "systemMessage": "당신은 생성된 HTML을 검증하고 최종 정리하는 전문가입니다.",
        "text": "={{ $json.prototype_html }}\\n\\n위 HTML을 검증하고 필요시 개선해주세요. 최종 결과만 반환하세요.",
        "options": {
          "model": "gpt-4o"
        }
      },
      "id": "ai-agent-final",
      "name": "AI Agent - Final Validation",
      "type": "@n8n/n8n-nodes-langchain.agent",
      "position": [1450, 300],
      "typeVersion": 1
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ { success: true, prototype_html: $json.output, cache_hit: $('Parse OpenAI Response').item.json.cache_hit, usage: $('Parse OpenAI Response').item.json.usage } }}"
      },
      "id": "respond-to-webhook",
      "name": "Respond to Webhook",
      "type": "n8n-nodes-base.respondToWebhook",
      "position": [1650, 300],
      "typeVersion": 1
    }
  ],
  "connections": {
    "Webhook Trigger": {
      "main": [[{ "node": "Parse Wizard Data", "type": "main", "index": 0 }]]
    },
    "Parse Wizard Data": {
      "main": [[{ "node": "AI Agent - Vector Search", "type": "main", "index": 0 }]]
    },
    "AI Agent - Vector Search": {
      "main": [[{ "node": "Build Cached Context", "type": "main", "index": 0 }]]
    },
    "Build Cached Context": {
      "main": [[{ "node": "HTTP Request - OpenAI with Cache", "type": "main", "index": 0 }]]
    },
    "HTTP Request - OpenAI with Cache": {
      "main": [[{ "node": "Parse OpenAI Response", "type": "main", "index": 0 }]]
    },
    "Parse OpenAI Response": {
      "main": [[{ "node": "AI Agent - Final Validation", "type": "main", "index": 0 }]]
    },
    "AI Agent - Final Validation": {
      "main": [[{ "node": "Respond to Webhook", "type": "main", "index": 0 }]]
    }
  },
  "settings": {
    "executionOrder": "v1"
  }
}
```

## 📊 Context Caching 효과

### 비용 절감
```
일반 요청 (캐시 없음):
- Input tokens: 5,000 tokens × $2.50/1M = $0.0125
- Output tokens: 1,000 tokens × $10.00/1M = $0.0100
- 총 비용: $0.0225

캐시 적용 (캐시 히트):
- Cached input tokens: 4,500 tokens × $0.25/1M = $0.0011
- New input tokens: 500 tokens × $2.50/1M = $0.0013
- Output tokens: 1,000 tokens × $10.00/1M = $0.0100
- 총 비용: $0.0124

절감률: 45%
```

### 속도 향상
- 캐시된 토큰: 즉시 처리 (레이턴시 없음)
- 새로운 토큰만 추론 필요
- 평균 응답 시간 30~50% 감소

## 🔧 구현 단계

### 1단계: Vector DB 준비 (Chroma DB)
```python
# 3개 Collection 생성
collections = [
    "layouts",      # 레이아웃 예제
    "components",   # 컴포넌트 패턴
    "interactions"  # 상호작용 로직
]
```

### 2단계: n8n 워크플로우 배포
- 위 JSON을 n8n에 import
- Webhook URL 획득
- OpenAI API 키 설정

### 3단계: Frontend 연동
```typescript
// frontend/src/services/aiService.ts
export const generatePrototypeWithN8N = async (wizardData: WizardData) => {
  const response = await fetch('https://n8n.your-domain.com/webhook/generate-prototype', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(wizardData)
  });
  return response.json();
};
```

## 💡 최적화 팁

### 1. System Message 고정
시스템 메시지는 가능한 변경하지 않기 (캐시 재사용률 증가)

### 2. 예제 템플릿 정리
Vector DB에 저장할 예제는 **일관된 포맷**으로 정리

### 3. 캐시 TTL 관리
- Ephemeral cache: 5분 TTL
- 자주 변경되는 부분은 캐시 외부에 배치

### 4. 비용 모니터링
```javascript
// Parse Response에서 캐시 사용량 추적
{
  prompt_tokens: 5000,
  cached_tokens: 4500,  // 90% 캐시 히트!
  completion_tokens: 1000
}
```

## 🎯 기대 효과

1. **비용 절감**: 동일한 컨텍스트 재사용 시 90% 할인
2. **응답 속도**: 캐시 히트 시 30~50% 빠른 응답
3. **일관성**: 동일한 시스템 프롬프트로 일관된 품질
4. **확장성**: Vector DB + Agent 조합으로 유연한 확장

## 📚 참고 자료

- [OpenAI Prompt Caching](https://platform.openai.com/docs/guides/prompt-caching)
- [n8n AI Agent Node](https://docs.n8n.io/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/)
- [LangChain Vector Store](https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.vectorstoresupabase/)

---

**작성일**: 2025-11-07  
**프로젝트**: ForgeFlow Lite  
**목적**: AI Agent 노드 활용 + Context Caching 통합 전략
