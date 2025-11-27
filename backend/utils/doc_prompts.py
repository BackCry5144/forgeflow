import json

def _summarize_wizard_context(wizard_data: dict) -> str:
    """Wizard 데이터에서 핵심 정보만 추출하여 문자열화 (토큰 절약 및 가독성)"""
    if not wizard_data:
        return "기획 의도 정보 없음"
    return json.dumps(wizard_data, ensure_ascii=False, indent=2)


def get_design_spec_prompt(react_code: str, wizard_data: dict) -> str:
    """
    개발자용 화면 설계서 데이터 추출 프롬프트
    """
    # Wizard 데이터에서 핵심 정보만 추출 (토큰 최적화)
    context_summary = {
        "screen_name": wizard_data.get('step1', {}).get('screenName'),
        "description": wizard_data.get('step1', {}).get('description'),
        "layout": wizard_data.get('step2', {}).get('selectedLayout'),
        "components_count": len(wizard_data.get('step3', {}).get('components', [])),
        "interactions_count": len(wizard_data.get('step4', {}).get('interactions', []))
    }
    context_str = json.dumps(context_summary, ensure_ascii=False, indent=2)

    return f"""
당신은 수석 프론트엔드 아키텍트이자 테크니컬 라이터입니다.
아래 제공된 **[기획 의도]**와 **[구현된 코드]**를 정밀 분석하여, 개발자를 위한 **상세 화면 설계서 데이터**를 JSON 형식으로 추출하세요.

1. **[기획 의도 (Context)]**: 이 화면을 만든 목적입니다.
{context_str}

2. **[구현된 코드 (Source)]**: 실제 작동하는 React 코드입니다. (분석의 기준)
{react_code}

[요청사항]
다음 JSON 구조에 맞춰 데이터를 추출하세요.
- **basic_info**: 화면의 기본 정보와 목적을 기술하세요.
- **ui_structure**: 화면을 위에서 아래로 훑어보며 구역(Header, Search, Grid 등)을 설명하세요.
- **state_specs**: `useState`로 선언된 주요 상태 변수들의 명세(변수명, 타입, 용도)를 작성하세요.
- **event_handlers**: 주요 함수(핸들러)들의 명세(함수명, 트리거 조건, 내부 로직 요약)를 작성하세요.

[출력 JSON 포맷]
{{
  "basic_info": {{
    "screen_name": "화면명 (한글)",
    "component_name": "컴포넌트명 (PascalCase)",
    "description": "화면의 목적 및 주요 기능 요약 (3문장 내외)"
  }},
  "ui_structure": [
    "1. 상단 검색 영역: 조회 조건(일자, 구분 등) 입력",
    "2. 중앙 그리드: 조회된 데이터 목록 표시",
    "3. ..."
  ],
  "state_specs": [
    {{ "name": "searchParams", "type": "Object", "initial_value": "{{...}}", "description": "검색 조건 상태 관리" }},
    {{ "name": "gridData", "type": "Array", "initial_value": "[]", "description": "조회된 목록 데이터" }}
  ],
  "event_handlers": [
    {{ "name": "handleSearch", "trigger": "조회 버튼 클릭", "logic": "API 호출 후 gridData 갱신" }}
  ]
}}

**주의:** 오직 JSON 데이터만 출력하세요. 마크다운(```json)은 포함해도 됩니다.
"""