# -*- coding: utf-8 -*-
"""
AI 프롬프트 템플릿 모음
"""
import json
import os


def load_design_tokens():
    """디자인 토큰 JSON 파일 로드"""
    token_path = os.path.join(
        os.path.dirname(os.path.dirname(__file__)),
        'design_tokens.json'
    )
    try:
        with open(token_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"[WARNING] Failed to load design tokens: {e}")
        return {}


DESIGN_TOKENS = load_design_tokens()


def get_essential_colors():
    """필수 컬러만 추출하여 문자열로 반환 (토큰 최적화)"""
    colors = DESIGN_TOKENS.get('uxon', {}).get('color', {})
    blue = colors.get('blue', {}).get('500', '#2563eb')
    green = colors.get('green', {}).get('500', '#16a34a')
    red = colors.get('red', {}).get('500', '#dc2626')
    neutral = colors.get('neutral', {}).get('500', '#8c8c8c')
    return (
        f"Primary: {blue} | Success: {green} | "
        f"Danger: {red} | Neutral: {neutral}"
    )


# 시스템 프롬프트 - UI/UX 설계 전문가 역할 (토큰 최적화 버전)
SYSTEM_PROMPT = f"""shadcn/ui와 Tailwind CSS 전문 React 개발자입니다.

# 구현 요구사항
- 단일 React 컴포넌트 (export default function 형식)
- 순수 JavaScript 작성 (타입 어노테이션 금지: no :string, :number 등)
- import 문 제외 (외부 의존성 없이 즉시 실행 가능)
- shadcn/ui 스타일을 표준 HTML 태그로 구현 (div, button, input 등)
- 5개 이상의 현실적인 샘플 데이터 포함
- 아이콘 필요시 Lucide 아이콘 사용 (예: <Search size={{20}} className="text-gray-500" />)
- 반응형 디자인 적용
# 컴포넌트 구현 규칙 (반드시 준수)

1. Modal/Dialog:
- useState로 open 상태 관리 (예: isModalOpen, setIsModalOpen)
- 모달 배경: fixed inset-0 bg-black/50 z-50 (오버레이)
- 모달 컨테이너: fixed inset-0 z-50 flex items-center justify-center
- 모달 내용: bg-white rounded-lg shadow-xl (크기는 지정된 size에 따라)
- 모달 헤더(제목+닫기), 본문(p-6), 푸터(버튼) 구조 준수

2. CodeView (팝업 검색용 입력창) - 반드시 아래 JSX 구조를 사용할 것:
const CodeView = ({{ label, value, onClick, placeholder = "검색", required = false, disabled = false }}) => (
  <div className="flex flex-col space-y-1.5">
    {{label && (
      <label className="text-sm font-medium text-gray-700">
        {{label}}
        {{required && <span className="text-red-500 ml-1">*</span>}}
      </label>
    )}}
    <div className="relative">
      <input
        type="text"
        value={{value || ""}}
        readOnly
        disabled={{disabled}}
        onClick={{!disabled ? onClick : undefined}}
        placeholder={{placeholder}}
        className={{`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 transition-colors ${{
          disabled ? "cursor-not-allowed opacity-50 bg-gray-100" : "cursor-pointer hover:bg-gray-50"
        }}`}}
      />
      <button
        type="button"
        onClick={{!disabled ? onClick : undefined}}
        disabled={{disabled}}
        className="absolute right-0 top-0 h-10 w-10 flex items-center justify-center text-gray-500 hover:text-blue-600 disabled:opacity-50"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </button>
    </div>
  </div>
);

3. 📸 스크린샷 캡처 지원 (필수 - 반드시 아래 코드를 그대로 복사):

[중요] 모달 상태 변수명 규칙 (반드시 준수):
- 첫 번째 모달: isModal0Open, setIsModal0Open
- 두 번째 모달: isModal1Open, setIsModal1Open  
- 세 번째 모달: isModal2Open, setIsModal2Open
- 절대로 다른 이름(예: isProdOrderModalOpen, isSearchModalOpen 등) 사용 금지!

메인 컴포넌트 최상단에 아래 useEffect를 반드시 그대로 추가:
```javascript
// 📸 스크린샷 캡처를 위한 PostMessage 리스너 (수정 금지)
useEffect(() => {{
  const handleMessage = (event) => {{
    if (event.data && event.data.type === 'OPEN_MODAL') {{
      const modalIndex = event.data.modalId.replace('modal-', '');
      if (modalIndex === '0') setIsModal0Open(true);
      if (modalIndex === '1') setIsModal1Open(true);
      if (modalIndex === '2') setIsModal2Open(true);
      if (modalIndex === '3') setIsModal3Open(true);
      if (modalIndex === '4') setIsModal4Open(true);
      setTimeout(() => {{
        window.parent.postMessage({{ type: 'MODAL_OPENED', modalId: event.data.modalId }}, '*');
      }}, 300);
    }}
    if (event.data && event.data.type === 'CLOSE_MODAL') {{
      setIsModal0Open(false);
      setIsModal1Open(false);
      setIsModal2Open(false);
      setIsModal3Open(false);
      setIsModal4Open(false);
      setTimeout(() => {{
        window.parent.postMessage({{ type: 'MODAL_CLOSED' }}, '*');
      }}, 100);
    }}
  }};
  window.addEventListener('message', handleMessage);
  return () => window.removeEventListener('message', handleMessage);
}}, []);
```

4. 모달 상태 선언 (반드시 이 형식 사용):
```javascript
const [isModal0Open, setIsModal0Open] = useState(false); // 첫 번째 모달
const [isModal1Open, setIsModal1Open] = useState(false); // 두 번째 모달
// 모달 개수만큼 추가 (isModal2Open, isModal3Open...)
```

# 디자인 컬러
{get_essential_colors()}

# 출력 형식
순수 JSX 코드만 반환 (설명이나 ``` 마크다운 블록 제외)"""


# ============================================================================
# 4단계 분할 프롬프트 생성 함수들
# [Step 1/4] 기초 설정 및 유틸리티 정의
# [Step 2/4] 상태(State) 및 비즈니스 로직 구현
# [Step 3/4] 메인 화면 UI 렌더링
# [Step 4/4] 모달 구현 및 최종 완성
# ============================================================================


def get_step_1_prompt(wizard_data: dict) -> str:
    """Step 1: 유틸리티, 아이콘, 공통 컴포넌트 정의"""
    step1 = wizard_data.get('step1', {})
    step3 = wizard_data.get('step3', {})
    step4 = wizard_data.get('step4', {})
    
    screen_name = step1.get('screenName', 'Unknown Screen')
    description = step1.get('description', '')
    components = step3.get('components', [])
    interactions = step4.get('interactions', [])

    return f"""
# [Step 1/4] 기초 설정 및 유틸리티 정의

**화면 컨텍스트:**
- 화면명: {screen_name}
- 설명: {description}
- 주요 컴포넌트: {_format_components(components)}
- 주요 액션: {_format_interactions(interactions, components, wizard_data.get('step2', {}).get('layoutAreas', []))}

다음 요구사항에 맞춰 React 파일의 **상단부(Top-level)**만 작성하세요.

**작성할 내용:**
1. `React`의 Hook들 (`useState`, `useEffect`, `useCallback` 등) 구조 분해 할당.
2. 필요한 **모든 Lucide 아이콘** 정의 (SVG).
3. `sampleData`: **'{screen_name}'**용 샘플 데이터 (5건 이상).
4. `Modal` 컴포넌트 정의 (SYSTEM_PROMPT 규칙 준수).
5. `CodeView`, `Input`, `Select` 등 UI 컴포넌트 정의.
6. 메인 컴포넌트 선언: `export default function [화면명_PascalCase]() {{`

🔴 **매우 중요:**
- `export default function ... {{` 의 **여는 중괄호 `{{` 까지만** 작성하고 즉시 멈추세요.
- 컴포넌트 내부 로직(useState 등)은 절대 작성하지 마세요.
"""


def get_step_2_prompt(wizard_data: dict) -> str:
    """Step 2: 상태(State) 및 핸들러 로직 정의"""
    step2 = wizard_data.get('step2', {})
    step3 = wizard_data.get('step3', {})
    step4 = wizard_data.get('step4', {})
    
    components = step3.get('components', [])
    interactions = step4.get('interactions', [])
    layout_areas = step2.get('layoutAreas', [])
    
    # 모달 개수 계산 및 상태 변수 목록 생성
    modal_interactions = [i for i in interactions if i.get('actionType') == 'open-modal']
    modal_count = len(modal_interactions)
    
    modal_state_declarations = ""
    if modal_count > 0:
        modal_state_declarations = "\n**🔴 모달 상태 선언 (반드시 이 이름 사용):**\n```javascript\n"
        for i, modal in enumerate(modal_interactions):
            title = modal.get('modalConfig', {}).get('title', f'모달{i}')
            modal_state_declarations += f"const [isModal{i}Open, setIsModal{i}Open] = useState(false); // {title}\n"
        modal_state_declarations += "```\n⚠️ 절대로 다른 이름 사용 금지! (isProdOrderModalOpen ❌)"
    
    return f"""
# [Step 2/4] 상태(State) 및 비즈니스 로직 구현

**지시 사항:**
이전 단계에서 작성한 `export default function ... {{` **바로 뒤에 이어질 내부 로직**만 작성하세요.

**작성할 내용:**
1. **📸 PostMessage 리스너:** SYSTEM_PROMPT의 스크린샷 캡처 useEffect 먼저 추가
2. **State 정의:** `searchParams`, `gridData` 등.
{modal_state_declarations}
3. **Helper 정의:** `gradeOptions` 등 상수.
4. **Event Handlers:** `handleSearch`, `handleReset`, `handleSubmit` 등.

**참고 정보:**
- 컴포넌트: {_format_components(components)}
- 인터랙션: {_format_interactions(interactions, components, layout_areas)}

🔴 **매우 중요 (엄격 준수):**
- **앞 단계의 코드(아이콘 정의, Modal 정의, 컴포넌트 선언부)를 절대 반복하지 마세요.**
- `const {{ useState }}` 등을 다시 적지 마세요.
- 오직 `useState` 선언부터 시작해서 핸들러 함수들까지만 작성하세요.
- **UI 렌더링 코드(`return ( ... )`)는 절대 포함하지 마세요.**
"""


def get_step_3_prompt(wizard_data: dict) -> str:
    """Step 3: 메인 UI 레이아웃 (검색영역 + 그리드)"""
    step2 = wizard_data.get('step2', {})
    step3 = wizard_data.get('step3', {})
    
    layout_type = step2.get('selectedLayout', 'search-grid')
    layout_areas = step2.get('layoutAreas', [])
    components = step3.get('components', [])
    
    return f"""
# [Step 3/4] 메인 화면 UI 렌더링

**지시 사항:**
이전 단계(핸들러 함수들)의 **바로 뒤에 이어질 렌더링 함수와 메인 리턴문**만 작성하세요.

**작성할 내용:**
1. `renderSearchArea()`: 검색 영역 JSX.
2. `renderGridToolbar()`: 툴바 JSX.
3. `renderGridArea()`: 그리드/테이블 JSX.
4. 메인 `return (` 문 시작 및 레이아웃 구성.
   - `{{renderSearchArea()}}`, `{{renderGridArea()}}` 호출 포함.

**정보:**
- 레이아웃: {layout_type}
- 배치: {_format_components_by_area(components, layout_areas)}

🔴 **매우 중요 (엄격 준수):**
- **앞 단계의 코드(상태 정의, 핸들러)를 절대 반복하지 마세요.**
- `render...` 함수 정의부터 바로 시작하세요.
- **모달(Modal) 컴포넌트들은 아직 렌더링하지 마세요.**
- 메인 레이아웃의 닫는 태그 `</div>` 직전까지만 작성하고 멈추세요.
"""


def get_step_4_prompt(wizard_data: dict) -> str:
    """Step 4: 모달 구현 및 파일 완성"""
    step2 = wizard_data.get('step2', {})
    step3 = wizard_data.get('step3', {})
    step4 = wizard_data.get('step4', {})
    
    components = step3.get('components', [])
    layout_areas = step2.get('layoutAreas', [])
    interactions = step4.get('interactions', [])
    
    # 모달 개수 계산
    modal_interactions = [i for i in interactions if i.get('actionType') == 'open-modal']
    modal_count = len(modal_interactions)
    
    # 모달 상태 변수 목록 생성
    modal_state_list = "\n".join([
        f"  - isModal{i}Open, setIsModal{i}Open → {modal_interactions[i].get('modalConfig', {}).get('title', f'모달{i}')}"
        for i in range(modal_count)
    ]) if modal_count > 0 else "  - (모달 없음)"
    
    return f"""
# [Step 4/4] 모달 구현 및 최종 완성

**지시 사항:**
메인 레이아웃의 끝부분(`</div>` 직전)에 **삽입될 모달들과 파일의 마무리**만 작성하세요.

**🔴 모달 상태 변수명 규칙 (필수 준수):**
{modal_state_list}

⚠️ 다른 이름 사용 금지! (예: isProdOrderModalOpen ❌, isSearchModalOpen ❌)
반드시 isModal0Open, isModal1Open... 형식만 사용하세요.

**작성할 내용:**
1. 요구사항의 **모든 팝업 모달(`Modal`)** JSX 작성.
   - 첫 번째 모달: `{{isModal0Open && (<div className="fixed...">...`
   - 두 번째 모달: `{{isModal1Open && (<div className="fixed...">...`
2. 메인 컴포넌트의 `return` 문 닫기 `);`
3. 메인 컴포넌트 함수 닫기 `}}`

**모달 명세:**
{_format_interactions(interactions, components, layout_areas)}

🔴 **매우 중요 (엄격 준수):**
- **앞 단계의 코드(메인 UI 등)를 절대 반복하지 마세요.**
- 오직 `{{isModal0Open && (...` 코드들부터 작성하세요.
- 마지막에 `}}` 로 파일이 문법적으로 완벽하게 닫히도록 하세요.
"""


def _format_layout_areas(layout_areas: list) -> str:
    """레이아웃 영역 정보를 간결하게 포맷팅 (토큰 최적화)"""
    if not layout_areas:
        return "-"
    
    result = []
    for area in layout_areas:
        area_name = area.get('name', 'Unknown')
        area_desc = area.get('description', '')
        result.append(f"• {area_name}: {area_desc}")
    
    return "\n".join(result)


def _format_components_by_area(components: list, layout_areas: list) -> str:
    """컴포넌트를 영역별로 그룹화하여 포맷팅 (토큰 최적화)"""
    if not components:
        return "-"
    
    # 영역 ID -> 이름 매핑
    area_map = {area.get('id'): area.get('name', 'Unknown') for area in layout_areas}
    
    # 영역별로 컴포넌트 그룹화
    components_by_area = {}
    for comp in components:
        area_id = comp.get('areaId', 'unknown')
        area_name = area_map.get(area_id, area_id)
        
        if area_name not in components_by_area:
            components_by_area[area_name] = []
        
        comp_type = comp.get('type', 'unknown')
        label = comp.get('label', '-')
        components_by_area[area_name].append(f"{label}({comp_type})")
    
    # 포맷팅
    result = []
    for area_name, comps in components_by_area.items():
        result.append(f"[{area_name}]")
        for comp in comps:
            result.append(f"  • {comp}")
    
    return "\n".join(result)


def _format_components(components: list) -> str:
    """컴포넌트 목록을 간결하게 포맷팅 (토큰 최적화)"""
    if not components:
        return "-"

    result = []
    for comp in components:
        comp_type = comp.get('type', 'unknown')
        label = comp.get('label', '-')
        area_id = comp.get('areaId', '')

        line = f"• {label} ({comp_type})"
        if area_id:
            line += f" → {area_id}"
        result.append(line)

    return "\n".join(result)


def _format_interactions(interactions: list, components: list, layout_areas: list) -> str:
    """인터랙션 목록을 간결하게 포맷팅 (토큰 최적화)"""
    if not interactions:
        return "-"

    # 이벤트 라벨 매핑
    event_labels = {
        'click': '클릭',
        'double-click': '더블클릭',
        'row-click': '행클릭',
        'cell-click': '셀클릭',
        'change': '변경',
        'submit': '제출',
        'hover': '호버',
        'select': '선택',
    }
    
    # 액션 타입 라벨 매핑
    action_labels = {
        'fetch-data': '데이터 조회',
        'submit': '데이터 저장',
        'clear': '초기화',
        'open-modal': '모달 열기',
        'validate': '유효성 검사',
        'navigate': '화면 이동',
    }

    # 컴포넌트 ID -> 레이블 매핑
    comp_map = {comp.get('id'): comp.get('label', 'Unknown') for comp in components}
    
    # 영역 ID -> 이름 매핑
    area_map = {area.get('id'): area.get('name', 'Unknown') for area in layout_areas}

    result = []
    for interaction in interactions:
        action = interaction.get('actionType', 'unknown')
        trigger_comp_id = interaction.get('triggerComponentId', '')
        trigger_event = interaction.get('triggerEvent', 'click')
        target_area_id = interaction.get('targetAreaId', '')
        modal_config = interaction.get('modalConfig')
        desc = interaction.get('description', '')

        # 컴포넌트 레이블 가져오기
        trigger_label = comp_map.get(trigger_comp_id, trigger_comp_id)
        event_label = event_labels.get(trigger_event, trigger_event)
        action_label = action_labels.get(action, action)
        line = f"• [{trigger_label}] {event_label} → {action_label}"
        if target_area_id:
            target_area_name = area_map.get(target_area_id, target_area_id)
            line += f" → {target_area_name}"
        
        if modal_config:
            modal_title = modal_config.get('title', '')
            modal_type = modal_config.get('type', '')
            modal_size = modal_config.get('size', 'md')
            modal_fields = modal_config.get('fields', [])
            modal_content = modal_config.get('content', '')
            
            # 모달 타입 라벨
            modal_type_label = {
                'form': '입력폼',
                'detail': '상세정보',
                'confirm': '확인대화상자',
                'custom': '커스텀'
            }.get(modal_type, modal_type)
            
            # 모달 크기 라벨
            modal_size_label = {
                'sm': '작게(400px)',
                'md': '중간(600px)',
                'lg': '크게(800px)',
                'xl': '매우크게(1200px)',
                'full': '전체화면'
            }.get(modal_size, modal_size)
            
            line += f"\n  └─ 모달: {modal_title} [{modal_type_label}, {modal_size_label}]"
            
            # 모달 필드 정보 (form 타입인 경우)
            if modal_fields and len(modal_fields) > 0:
                field_info = []
                for field in modal_fields:
                    field_label = field.get('label', '')
                    field_type = field.get('type', 'textbox')
                    field_required = '필수' if field.get('required', False) else '선택'
                    field_info.append(f"{field_label}({field_type}, {field_required})")
                line += f"\n     필드: {', '.join(field_info)}"
            
            # 모달 내용 (confirm/detail/custom 타입인 경우)
            if modal_content:
                line += f"\n     내용: {modal_content[:50]}{'...' if len(modal_content) > 50 else ''}"
        
        if desc:
            line += f" - {desc}"

        result.append(line)

    return "\n".join(result)
