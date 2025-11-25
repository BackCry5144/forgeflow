## 💡 Wizard 단계별 프롬프트 수정 계획

알겠습니다. 현재 4단계 Wizard 입력을 **하나의 거대한 프롬프트**로 합쳐서 전송하는 방식 대신, 각 Wizard 단계를 **순차적인 코드 생성(Continuation)** 프롬롬프트로 활용하는 수정 계획을 제안합니다.

핵심 아이디어는 **Wizard의 각 단계가 이전 단계에서 생성된 코드의 '마지막 줄'에 이어서 다음 코드 조각을 생성하도록 명확하게 지시**하는 것입니다.

---

### `SYSTEM_PROMPT` (변경 없음)

현재 `SYSTEM_PROMPT`는 규칙을 정의하는 **'마스터 룰북'** 역할을 하므로 그대로 유지합니다.

---

### Wizard 1단계: 화면 설명 (→ 기초 파일 및 유틸리티 생성)

이 단계의 목표는 React 컴포넌트의 가장 기본이 되는 **'상단부(Head)'와 '유틸리티'**를 생성하는 것입니다.

* **기존 입력:** "이상발생관리 > 이상발생관리 화면"
* **수정된 프롬프트 지시:**
    > 1.  `SYSTEM_PROMPT`의 모든 요구사항을 준수합니다.
    > 2.  `React`의 `useState`, `useMemo`, `useCallback`, `useEffect`를 정의합니다.
    > 3.  필요한 모든 **Lucide 아이콘**(`AlertTriangle`, `Search`, `X` 등)을 SVG 컴포넌트로 정의합니다.
    > 4.  요구사항에 명시된 `sampleData` 배열(샘플 데이터)을 정의합니다.
    > 5.  `modalSizeMap` 상수를 정의합니다.
    > 6.  `SYSTEM_PROMPT`의 Modal 요구사항을 완벽히 따르는 재사용 가능한 **`Modal` 컴포넌트**를 정의합니다.
    > 7.  재사용 가능한 모든 **입력 컴포넌트**(`Input`, `CodeView`, `Select`, `Textarea`, `DatePicker`)를 정의합니다.
    > 8.  메인 컴포넌트 `export default function AnomalyManagement() {` 를 선언합니다.
    > 9.  **정확히 `AnomalyManagement() {`의 여는 중괄호 `{` 직후에서 응답을 중지합니다.** (상태나 핸들러는 아직 작성하지 않습니다.)

---

### Wizard 2단계: 레이아웃 (→ 상태 및 핸들러 정의)

이 단계의 목표는 컴포넌트의 **'두뇌(Brain)'**에 해당하는 모든 상태와 비즈니스 로직을 정의하는 것입니다.

* **기존 입력:** "search-grid" 레이아웃, 검색/툴바/그리드 영역 구조
* **수정된 프롬프트 지시:**
    > 1.  **이전 단계 코드(`...AnomalyManagement() {`)에 이어서 작성합니다.**
    > 2.  모든 `useState` 변수를 선언합니다. (예: `searchParams`, `gridData`, `isLoading`, `isLineModalOpen`, `isProcessModalOpen`..., `detailForm`)
    > 3.  모든 `useMemo` 변수를 선언합니다. (예: `gradeOptions`, `typeOptions`, `statusOptions`)
    > 4.  **인터랙션(4단계)을 제외한** 모든 핵심 핸들러 함수를 정의합니다. (예: `handleSearchChange`, `handleDetailChange`, `handleSearch`, `handleReset`, `handleExcelDownload`, `openDetailModal`, `handleDetailSubmit`)
    > 5.  그리드 스타일링 헬퍼 함수(`getGradeClass`, `getStatusClass`)를 정의합니다.
    > 6.  **마지막 핸들러 함수(예: `handleDetailSubmit`)의 닫는 중괄호 `}` 직후에서 응답을 중지합니다.** (렌더링 함수나 `return` 문은 아직 작성하지 않습니다.)

---

### Wizard 3단계: 컴포넌트 (→ 메인 UI 렌더링 함수 및 `return`)

이 단계의 목표는 **'신체(Body)'**의 주요 골격, 즉 모달을 제외한 메인 화면을 렌더링하는 것입니다.

* **기존 입력:** [검색 영역], [그리드 툴바], [그리드 영역]의 모든 컴포넌트 목록
* **수정된 프롬프트 지시:**
    > 1.  **이전 단계 코드(마지막 핸들러 함수)에 이어서 작성합니다.**
    > 2.  [**Wizard 3단계 입력(컴포넌트 목록)**]을 기반으로, `renderSearchArea` 함수를 **완전히 구현**합니다. (모든 `DatePicker`, `Select`, `CodeView` 등 포함)
    > 3.  `renderGridToolbar` 함수를 **완전히 구현**합니다. ('엑셀', '접수' 버튼 포함)
    > 4.  `renderGridArea` 함수를 **완전히 구현**합니다. (`<table>` 구조, `gridData` 반복, `onClick` 이벤트 핸들러 포함)
    > 5.  메인 `return` 문을 작성하고, `renderSearchArea()`, `renderGridToolbar()`, `renderGridArea()`를 호출하여 **기본 레이아웃을 완성**합니다.
    > 6.  **`return` 문의 최상위 `</div>` 닫는 태그 직후, `return` 문의 닫는 소괄호 `)` 직전에서 응답을 중지합니다.** (모달은 아직 작성하지 않습니다.)

---

### Wizard 4단계: 인터랙션 (→ 모달 구현 및 코드 완성)

이 단계의 목표는 **'손발(Limbs)'**에 해당하는 모든 인터랙션(모달)을 구현하고 파일을 **'완성(Complete)'**하는 것입니다.

* **기존 입력:** 모든 클릭 이벤트 및 모달 정의 (라인, 공정, 설비, 자재, 접수자, 이상발생 상세)
* **수정된 프롬프트 지시:**
    > 1.  **이전 단계 코드(메인 `</div>` 태그 직후)에 이어서 작성합니다.**
    > 2.  먼저, 공통 팝업 모달의 내용을 그릴 `renderCodeListModalContent` 헬퍼 함수를 정의합니다.
    > 3.  [**Wizard 4단계 입력(인터랙션 목록)**]을 기반으로, **요청된 모든 `Modal` 컴포넌트의 JSX를 순서대로 구현**합니다.
    >     - `라인 목록 조회` 모달 (md, `isLineModalOpen`)
    >     - `공정 목록 조회` 모달 (md, `isProcessModalOpen`)
    >     - ... (기타 모든 'md' 사이즈 모달) ...
    >     - `이상발생 상세` 모달 (**full**, `isDetailModalOpen`, **입력폼 타입**). 이 모달은 요구된 모든 필드(`Select`, `CodeView`, `Textarea` 등)를 포함하는 **복잡한 내부 레이아웃(grid, sections)**을 완벽하게 구현해야 합니다.
    > 4.  모든 모달 JSX 작성이 끝나면, `return` 문의 닫는 소괄호 `)`와 `AnomalyManagement` 함수의 닫는 중괄호 `}`를 추가하여 **React 컴포넌트 코드를 최종적으로 완성합니다.**



## 💡 컨텍스트 캐싱(Redis)과 RAG(Chroma DB) 결합 전략

현재 `SYSTEM_PROMPT`를 Redis에 캐싱하는 것은 **"정적 컨텍스트 캐싱"**으로, 매번 동일한 프롬프트를 전송하지 않아 토큰을 절약하는 훌륭한 방법입니다.

여기에 Chroma DB(RAG)를 결합하여 프롬프트를 **"동적으로 조립"**하고 **"예제 기반으로 생성"**하도록 진화시킬 수 있습니다.

---

### 1. (기존) Redis: "마스터 룰북" 캐싱

* **역할:** 불변의 `SYSTEM_PROMPT` 텍스트 규칙(Rule)을 캐싱합니다.
* **대상:** `SYSTEM_PROMPT`에서 **코드를 제외한** 모든 텍스트 지침.
    > "shadcn/ui와 Tailwind CSS 전문 React 개발자입니다..."
    > "단일 React 컴포넌트..."
    > "순수 JavaScript 작성..."
    > "아이콘 필요시 Lucide 아이콘 사용..."
    > "Modal/Dialog 구현 (중요!)..."
* **활용:** 이 룰북은 모든 프롬프트의 기본 베이스가 됩니다.

### 2. (신규) Chroma DB (RAG - 전략 1): "재사용 코드 청크" 주입

* **아이디어:** `SYSTEM_PROMPT`에 포함된 거대한 **"재사용 코드 블록"**을 Chroma DB에 저장하고, 필요할 때만 RAG로 가져와 프롬프트에 주입합니다.
* **Chroma DB 저장 내용 (벡터화):**
    * **청크 1 (Icons):** 모든 Lucide 아이콘 SVG 정의 (`const AlertTriangle = ...`, `const Search = ...` 등)
    * **청크 2 (Modal):** `SYSTEM_PROMPT`에 정의된 표준 `Modal` 컴포넌트 코드 (`const Modal = ({ isOpen, ... }) => ...`)
    * **청크 3 (Inputs):** 표준 입력 컴포넌트 코드 (`const Input = ...`, `const CodeView = ...`, `const Select = ...` 등)
* **워크플로우 (동적 프롬프트 조립):**
    1.  사용자가 Wizard 4단계(인터랙션)에서 **모달을 정의하지 않으면**, Chroma DB에서 `청크 2 (Modal)`를 **가져오지 않습니다.**
    2.  사용자가 Wizard 3단계(컴포넌트)에서 `codeview`를 사용하지 않으면, `청크 3 (Inputs)`에서 `CodeView` 코드를 **가져오지 않습니다.**
* **기대 효과 (토큰 절약):**
    * `SYSTEM_PROMPT`가 매우 가벼워집니다.
    * Wizard 입력에 따라 **꼭 필요한 코드 청크만** RAG로 가져와 프롬프트에 포함시키므로, 불필요한 코드(예: 안 쓰는 아이콘, 모달)가 프롬프트 토큰을 낭비하지 않습니다.

### 3. (신규) Chroma DB (RAG - 전략 2): "유사 컴포넌트" 예제 주입

이것이 **가장 강력한 토큰 절약 및 품질 향상 전략**입니다.

* **아이디어:** LLM에게 긴 지시사항(`SYSTEM_PROMPT`)을 매번 주는 대신, **"전에 만들었던 유사한 컴포넌트"**를 예제로 주고 "이것과 비슷하게 만들어줘"라고 요청합니다.
* **Chroma DB 저장 내용 (벡터화):**
    * Wizard를 통해 **성공적으로 생성된 모든 React 컴포넌트의 완성본**을 저장합니다.
    * *메타데이터:* `screen_name: '이상발생관리'`, `layout: 'search-grid'`, `components: ['date-picker', 'grid', 'modal']`
* **워크플로우 (Few-Shot Learning):**
    1.  사용자가 4단계 Wizard 입력을 완료합니다.
    2.  프로그램은 Wizard 입력 내용을 기반으로 Chroma DB에 **유사도 검색**을 요청합니다. (예: "search-grid 레이아웃과 modal이 있는 화면")
    3.  Chroma DB가 가장 유사한 기존 컴포넌트(예: `UserManagement.jsx`)를 반환합니다.
    4.  LLM에게 전송할 프롬프트가 완전히 달라집니다.

> **(기존 프롬프트)**
> `[Redis의 긴 룰북]` + `[RAG 청크 코드]` + "이 Wizard 입력으로 컴포넌트를 만들어줘: `[Wizard 입력]`"
>
> **(RAG 예제 프롬프트 - 훨씬 짧음)**
> `[Redis의 핵심 룰북 (간소화 버전)]`
>
> "아래는 이전에 아주 잘 만들어진 **search-grid 레이아웃의 예제**입니다."
> `[Chroma DB에서 가져온 UserManagement.jsx 전체 코드]`
>
> "이제 이 예제 스타일을 참고하여, **다음 요구사항**에 맞는 **'이상발생관리'** 컴포넌트를 생성해 주세요."
> `[Wizard 입력 요약]`

* **기대 효과 (토큰 절약 + 품질 향상):**
    * LLM은 긴 지시사항(Prompt)보다 **구체적인 코드 예제(Example)**를 훨씬 잘 따릅니다.
    * 아이콘, 모달, 입력 컴포넌트 정의 등 **반복되는 모든 보일러플레이트 코드를 예제에 포함**시킬 수 있으므로, `SYSTEM_PROMPT`에서 해당 내용을 **모두 제거**할 수 있습니다. (엄청난 토큰 절약)
    * 생성되는 모든 컴포넌트의 코드 스타일과 구조가 매우 **일관성** 있게 유지됩니다.

---

## 🏆 통합 워크플로우 제안

1.  **시작:** 사용자가 Wizard 입력을 시작합니다.
2.  **(Redis):** `SYSTEM_PROMPT`의 핵심 **룰북(텍스트 규칙)**을 Redis에서 로드합니다.
3.  **(Chroma - RAG 1):** Wizard 3, 4단계가 채워지면, `SYSTEM_PROMPT`에서 분리해둔 **필요한 코드 청크**(`Modal`, `Input` 등)를 Chroma DB에서 로드합니다.
4.  **(Chroma - RAG 2):** Wizard 입력이 완료되면, 완성된 **유사 컴포넌트 예제**를 Chroma DB에서 검색합니다.
5.  **프롬프트 조립:**
    * **Case A (유사 예제 발견):** `[룰북]` + `[유사 컴포넌트 예제]` + `[새 Wizard 입력]`
    * **Case B (유사 예제 없음):** `[룰북]` + `[필요한 코드 청크]` + `[새 Wizard 입력]`
6.  **생성 및 저장:** LLM이 코드를 생성합니다.
7.  **(Chroma - 학습):** 성공적으로 생성된 새 컴포넌트를 **Chroma DB에 다시 저장**하여, 다음 요청을 위한 RAG 예제로 활용합니다.