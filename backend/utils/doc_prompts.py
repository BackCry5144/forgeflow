import json

def _summarize_wizard_context(wizard_data: dict) -> str:
    """Wizard 데이터에서 핵심 정보만 추출하여 문자열화 (토큰 절약 및 가독성)"""
    if not wizard_data:
        return "기획 의도 정보 없음"
    return json.dumps(wizard_data, ensure_ascii=False, indent=2)

def get_dev_design_prompt(react_code: str, wizard_data: dict) -> str:
    context_str = _summarize_wizard_context(wizard_data)
    return f"""
    당신은 수석 프론트엔드 아키텍트입니다. 아래 **[기획 원본]**과 **[구현 코드]**를 정밀 분석하여, 개발자를 위한 **상세 화면 설계서 데이터**를 JSON 형식으로 추출하세요.

    1. **[기획 원본 데이터 (Context)]**: 사용자가 Wizard에서 입력한 의도입니다. (화면 개요, 컴포넌트 목록, 인터랙션 규칙)
    {context_str}

    2. **[구현된 코드 (Source)]**: 실제 작동하는 React 코드입니다. (분석의 핵심 기준)
    {react_code}

    [요청사항]
    다음 JSON 스키마에 맞춰 데이터를 추출하세요.
    - 모든 정보는 **구현된 코드**를 기준으로 하되, 개요 및 목적은 **[기획 원본]**을 참고하여 작성하세요.
    - 데이터 타입(Type)은 코드를 분석하여 String, Number, Date, Boolean 중 하나를 사용하세요.

    {{
      "basic_info": {{
        "screen_name": "화면 한글명",
        "component_name": "컴포넌트명",
        "description": "화면의 목적 및 주요 기능 요약"
      }},
      "ui_structure": [
        "화면 레이아웃 구조 설명 (예: 상단 검색 영역, 중앙 그리드 영역)"
      ],
      "state_specs": [
        {{
          "name": "변수명 (예: searchParams)",
          "type": "Object 또는 Array",
          "initial_value": "초기값 요약",
          "description": "상태의 역할과 포함된 주요 필드 설명"
        }}
      ],
      "event_handlers": [
        {{
          "name": "함수명 (예: handleSearch)",
          "trigger": "실행 조건 (예: 조회 버튼 클릭)",
          "logic": "내부 처리 로직 (예: 상태 업데이트, API 호출, 유효성 검사)",
          "ui_element": "연관된 UI 요소"
        }}
      ],
      "user_flow": [
        "1. 사용자가 화면에 진입하는 순간의 초기 동작 설명",
        "2. 표준 시나리오 (Happy Path)에 따른 단계별 동작 순서"
      ],
      "components": [
        {{
          "label": "컴포넌트 한글 라벨 (예: 라인 코드)",
          "type": "컴포넌트 타입 (Input, CodeView, Select, Grid 등)",
          "is_input": true
        }}
      ]
    }}
    """