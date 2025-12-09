import json

def _summarize_wizard_context(wizard_data: dict) -> str:
    """Wizard 데이터에서 핵심 정보만 추출하여 문자열화 (토큰 절약 및 가독성)"""
    if not wizard_data:
        return "기획 의도 정보 없음"
    return json.dumps(wizard_data, ensure_ascii=False, indent=2)


def get_design_spec_prompt(react_code: str, wizard_data: dict) -> str:
    context_summary = {
        "screen_name": wizard_data.get('step1', {}).get('screenName'),
        "description": wizard_data.get('step1', {}).get('description'),
        "layout": wizard_data.get('step2', {}).get('selectedLayout'),
        # 컴포넌트/인터랙션 개수만 요약
        "components_count": len(wizard_data.get('step3', {}).get('components', [])),
        "interactions_count": len(wizard_data.get('step4', {}).get('interactions', []))
    }
    context_str = json.dumps(context_summary, ensure_ascii=False, indent=2)

    return f"""
당신은 SI 프로젝트의 수석 기획자이자 테크니컬 라이터입니다.
아래 **[기획 의도]**와 **[구현된 코드]**를 분석하여, 화면 설계서 데이터를 추출하세요.

1. **[기획 의도]**: {context_str}
2. **[구현된 코드]**: {react_code}

[요청사항]
다음 JSON 구조에 맞춰 데이터를 추출하세요.
1. **layout_structure (UI 구조):** 화면을 위에서 아래로(Header->Search->Grid->Footer) 훑으며 구역(Zone)을 나누고, 각 구역의 컴포넌트 라벨을 나열하세요.
2. **user_flow (동작 흐름):** 사용자가 화면에 진입하여 업무를 처리하는 표준 시나리오(Happy Path)를 단계별로 기술하세요.
3. **event_handlers:** `trigger` 항목 작성 시 `onClick` 같은 코드명 대신 **'클릭', '값 변경', '엔터 입력'** 등 **한글 기획 용어**를 사용하세요.
4. **overview:** [기획 의도]의 설명을 참고하여 비즈니스 관점에서 서술하세요.

[출력 JSON 포맷]
{{
  "basic_info": {{
    "screen_name": "화면명",
    "component_name": "컴포넌트명",
    "description": "화면 개요"
  }},
  "layout_structure": [
    {{
      "area_name": "1. 상단 검색 영역",
      "description": "조회 조건 입력",
      "components": ["일자(From)", "일자(To)", "라인 코드", "조회 버튼"]
    }}
  ],
  "user_flow": [
    {{
      "step": 1,
      "action": "화면 진입",
      "system_response": "초기 데이터 조회",
      "description": "메뉴 클릭 시 동작"
    }}
  ],
  "state_specs": [
    {{ "name": "searchParams", "type": "Object", "initial_value": "{{...}}", "description": "검색 조건" }}
  ],
  "event_handlers": [
    {{
      "ui_element": "조회 버튼", 
      "name": "handleSearch", 
      "trigger": "클릭", 
      "logic": "API 호출 및 그리드 갱신" 
    }}
  ]
}}

**주의:** 오직 JSON 데이터만 출력하세요. 마크다운(```json)은 포함해도 됩니다.
"""


def get_test_plan_prompt(react_code: str, wizard_data: dict) -> str:
    """테스트 계획서용 LLM 프롬프트"""
    context_summary = {
        "screen_name": wizard_data.get('step1', {}).get('screenName'),
        "description": wizard_data.get('step1', {}).get('description'),
        "layout": wizard_data.get('step2', {}).get('selectedLayout'),
        "components": [
            {"label": c.get('label'), "type": c.get('type'), "required": c.get('required', False)}
            for c in wizard_data.get('step3', {}).get('components', [])
        ],
        "interactions": [
            {"trigger": i.get('triggerComponentId'), "action": i.get('actionType')}
            for i in wizard_data.get('step4', {}).get('interactions', [])
        ]
    }
    context_str = json.dumps(context_summary, ensure_ascii=False, indent=2)

    return f"""
당신은 SI 프로젝트의 QA 전문가이자 테스트 설계 전문가입니다.
아래 **[기획 의도]**와 **[구현된 코드]**를 분석하여, 테스트 계획서 데이터를 생성하세요.

1. **[기획 의도]**: {context_str}
2. **[구현된 코드]**: {react_code}

[요청사항]
1. **test_cases**: 각 기능별 테스트 케이스를 작성하세요.
   - 정상 케이스(Positive)와 예외 케이스(Negative) 모두 포함
   - 필수 입력 검증, 버튼 동작, 그리드 표시 등 UI 검증 포함
2. **test_scenarios**: 사용자 시나리오 기반 통합 테스트
3. **boundary_tests**: 경계값 테스트 (날짜 범위, 숫자 범위 등)

[출력 JSON 포맷]
{{
  "overview": {{
    "screen_name": "화면명",
    "test_objective": "테스트 목적 설명",
    "test_scope": "테스트 범위 설명",
    "preconditions": ["사전 조건1", "사전 조건2"]
  }},
  "test_cases": [
    {{
      "tc_id": "TC-001",
      "category": "기능 테스트",
      "test_item": "조회 기능",
      "test_description": "검색 조건 입력 후 조회 버튼 클릭",
      "test_steps": ["1. 시작일자 입력", "2. 조회 버튼 클릭"],
      "expected_result": "조건에 맞는 데이터가 그리드에 표시됨",
      "priority": "High"
    }}
  ],
  "test_scenarios": [
    {{
      "scenario_id": "TS-001",
      "scenario_name": "정상 조회 시나리오",
      "description": "사용자가 조건을 입력하고 데이터를 조회하는 시나리오",
      "steps": ["화면 진입", "조건 입력", "조회 버튼 클릭", "결과 확인"]
    }}
  ],
  "boundary_tests": [
    {{
      "field": "시작일자",
      "test_type": "날짜 범위",
      "min_value": "1900-01-01",
      "max_value": "2099-12-31",
      "invalid_cases": ["빈 값", "잘못된 형식"]
    }}
  ]
}}

**주의:** 오직 JSON 데이터만 출력하세요. 한글로 작성하세요.
"""


def get_user_manual_prompt(react_code: str, wizard_data: dict) -> str:
    """사용자 매뉴얼용 LLM 프롬프트"""
    context_summary = {
        "screen_name": wizard_data.get('step1', {}).get('screenName'),
        "description": wizard_data.get('step1', {}).get('description'),
        "layout": wizard_data.get('step2', {}).get('selectedLayout'),
        "layout_areas": [
            {"id": a.get('id'), "name": a.get('name')}
            for a in wizard_data.get('step2', {}).get('layoutAreas', [])
        ],
        "components": [
            {"label": c.get('label'), "type": c.get('type'), "area": c.get('areaId')}
            for c in wizard_data.get('step3', {}).get('components', [])
        ],
        "interactions": [
            {"trigger": i.get('triggerComponentId'), "action": i.get('actionType'), "event": i.get('triggerEvent')}
            for i in wizard_data.get('step4', {}).get('interactions', [])
        ]
    }
    context_str = json.dumps(context_summary, ensure_ascii=False, indent=2)

    return f"""
당신은 SI 프로젝트의 사용자 교육 전문가이자 매뉴얼 작성 전문가입니다.
아래 **[기획 의도]**와 **[구현된 코드]**를 분석하여, 사용자 매뉴얼 데이터를 생성하세요.

1. **[기획 의도]**: {context_str}
2. **[구현된 코드]**: {react_code}

[요청사항]
1. **description**: 현업 담당자가 이해할 수 있는 쉬운 언어로 화면 설명
2. **ui_structure**: 화면 구성 요소를 트리 구조로 설명
3. **procedures**: 업무별 상세 수행 절차 (Step-by-Step)
   - 각 절차는 캡처 위치를 고려하여 작성
   - 사용자 액션과 시스템 반응을 명확히 구분
4. **troubleshooting**: 자주 발생하는 문제와 해결 방법

[출력 JSON 포맷]
{{
  "overview": {{
    "screen_name": "화면명",
    "description": "이 화면은 ... 업무를 수행하기 위해 사용됩니다.",
    "target_users": "현업 담당자, 관리자 등"
  }},
  "ui_structure": [
    {{
      "area_name": "검색 영역",
      "description": "데이터를 조회하기 위한 조건을 입력하는 영역입니다.",
      "components": [
        {{"name": "시작일자", "description": "조회 시작 날짜를 선택합니다.", "is_required": true}},
        {{"name": "조회 버튼", "description": "입력한 조건으로 데이터를 조회합니다."}}
      ]
    }}
  ],
  "procedures": [
    {{
      "procedure_id": 1,
      "title": "데이터 조회하기",
      "description": "원하는 조건으로 데이터를 검색하는 방법입니다.",
      "steps": [
        {{"step": 1, "action": "시작일자 입력란을 클릭합니다.", "system_response": "달력 팝업이 표시됩니다."}},
        {{"step": 2, "action": "원하는 날짜를 선택합니다.", "system_response": "선택한 날짜가 입력됩니다."}},
        {{"step": 3, "action": "[조회] 버튼을 클릭합니다.", "system_response": "조건에 맞는 데이터가 표시됩니다."}}
      ],
      "tips": ["Tip: 날짜 범위는 최대 1년까지 설정 가능합니다."]
    }}
  ],
  "troubleshooting": [
    {{
      "symptom": "조회 버튼을 눌러도 데이터가 표시되지 않습니다.",
      "cause": "필수 입력 항목이 비어있거나, 조회 조건에 맞는 데이터가 없습니다.",
      "solution": "1. 필수 항목(*)이 모두 입력되었는지 확인하세요.\\n2. 검색 조건을 변경하여 다시 시도하세요."
    }}
  ]
}}

**주의:** 
- 오직 JSON 데이터만 출력하세요.
- 현업 담당자가 이해할 수 있는 쉬운 언어를 사용하세요.
- 기술 용어(onClick, useState 등)는 사용하지 마세요.
"""