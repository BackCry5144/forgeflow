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