import json

def _summarize_wizard_context(wizard_data: dict) -> str:
    """Wizard 데이터에서 핵심 정보만 추출하여 문자열화 (토큰 절약 및 가독성)"""
    if not wizard_data:
        return "기획 의도 정보 없음"
    return json.dumps(wizard_data, ensure_ascii=False, indent=2)

def get_dev_design_prompt(react_code: str, wizard_data: dict) -> str:
    context_str = _summarize_wizard_context(wizard_data)
    return f"""
당신은 수석 개발자입니다. 아래 두 정보를 결합하여 **화면 설계서** 작성을 위한 데이터를 JSON으로 추출하세요.

1. **[기획 의도 (Wizard)]**: 사용자가 원래 의도한 화면의 목적과 주요 기능입니다.
{context_str}

2. **[구현 코드 (React)]**: 실제 작성된 코드입니다. (분석의 핵심 기준)
{react_code}

[요청사항]
- **개요:** 기획 의도의 `description`을 바탕으로 작성하되, 기술적 구현 방식(코드 분석)을 덧붙여 풍성하게 작성하세요.
- **UI 구조:** 코드의 JSX 구조를 분석하여 레이아웃을 설명하세요.
- **이벤트:** 코드의 핸들러 함수(`handle...`)와 기획 의도의 `interactions`를 매핑하여 설명하세요.

[출력 JSON 형식]
{{
  "basic_info": {{ "screen_name": "...", "component_name": "...", "description": "..." }},
  "ui_structure": ["상단: 검색조건", "중앙: 그리드..."],
  "state_specs": [ {{ "name": "searchParams", "type": "Object", "description": "..." }} ],
  "event_handlers": [ {{ "name": "handleSearch", "trigger": "조회 버튼 클릭", "logic": "..." }} ]
}}
"""

def get_user_manual_prompt(react_code: str, wizard_data: dict) -> str:
    context_str = _summarize_wizard_context(wizard_data)
    return f"""
당신은 테크니컬 라이터입니다. **최종 사용자 매뉴얼**을 작성하세요.

[기획 정보]
{context_str}
[참고 코드]
{react_code}

[요청사항]
- 개발 용어(State, Handler)를 쓰지 말고, **버튼 이름과 화면 라벨**을 기준으로 설명하세요.
- `step4`의 인터랙션 정보를 참고하여 주요 과업(예: 조회, 등록)별로 절차를 나누세요.
- 결과는 JSON으로 출력하세요: {{ "title": "...", "introduction": "...", "sections": [ {{ "title": "조회하기", "steps": ["1. ...", "2. ..."] }} ] }}
"""

def get_test_plan_prompt(react_code: str) -> str:
    return f"""
당신은 QA 엔지니어입니다. React 코드를 분석하여 **단위 테스트 케이스**를 도출하세요.
실제 코드에 존재하는 로직(유효성 검사, API 호출, 모달 등)을 검증해야 합니다.

[코드]
{react_code}

[출력 JSON 형식]
{{
  "test_scenarios": [
    {{ "id": "TC-01", "title": "필수값 미입력 테스트", "steps": ["1. ..."], "expected": "알림창 표시" }}
  ]
}}
"""