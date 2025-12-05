# -*- coding: utf-8 -*-
"""
Seed Resources Script
- 기존 TypeScript 하드코딩 데이터를 DB로 마이그레이션
- 테이블이 비어있을 때만 초기 데이터 삽입
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from models import Layout, Component, Action
from models.database import SessionLocal, engine, Base

# ============================================================
# Layout 초기 데이터
# ============================================================

LAYOUT_AREAS = {
    'search-grid': [
        {
            'id': 'search-area',
            'name': '검색 영역',
            'description': '상단 검색 조건 입력',
            'suggestedComponents': ['textbox', 'codeview', 'combo', 'date-picker', 'number-input', 'button']
        },
        {
            'id': 'grid-toolbar',
            'name': '그리드 툴바',
            'description': '그리드 상단 액션 버튼',
            'suggestedComponents': ['button', 'file-upload']
        },
        {
            'id': 'grid-area',
            'name': '그리드 영역',
            'description': '데이터 표시',
            'suggestedComponents': ['grid', 'badge', 'progress-bar']
        }
    ],
    'master-detail': [
        {
            'id': 'master-toolbar',
            'name': '마스터 툴바',
            'description': '좌측 목록 상단',
            'suggestedComponents': ['button', 'textbox', 'codeview']
        },
        {
            'id': 'master-list',
            'name': '마스터 목록',
            'description': '좌측 항목 목록',
            'suggestedComponents': ['card', 'badge']
        },
        {
            'id': 'detail-header',
            'name': '상세 헤더',
            'description': '우측 상단 정보',
            'suggestedComponents': ['button', 'badge']
        },
        {
            'id': 'detail-form',
            'name': '상세 폼',
            'description': '우측 상세 내용',
            'suggestedComponents': ['textbox', 'codeview', 'combo', 'textarea', 'date-picker', 'number-input', 'checkbox', 'radio']
        }
    ],
    'dashboard': [
        {
            'id': 'kpi-area',
            'name': 'KPI 카드 영역',
            'description': '상단 주요 지표',
            'suggestedComponents': ['card', 'badge', 'progress-bar']
        },
        {
            'id': 'chart-left',
            'name': '좌측 차트',
            'description': '왼쪽 통계 차트',
            'suggestedComponents': ['chart', 'combo', 'date-picker']
        },
        {
            'id': 'chart-right',
            'name': '우측 차트',
            'description': '오른쪽 통계 차트',
            'suggestedComponents': ['chart', 'combo', 'progress-bar']
        },
        {
            'id': 'data-table',
            'name': '하단 데이터 테이블',
            'description': '상세 데이터',
            'suggestedComponents': ['grid', 'button', 'badge']
        }
    ],
    'kanban': [
        {
            'id': 'kanban-header',
            'name': '칸반 헤더',
            'description': '상단 필터/액션',
            'suggestedComponents': ['combo', 'button', 'textbox', 'codeview', 'date-picker']
        },
        {
            'id': 'todo-column',
            'name': 'To Do 컬럼',
            'description': '예정 작업',
            'suggestedComponents': ['card', 'badge', 'button']
        },
        {
            'id': 'inprogress-column',
            'name': 'In Progress 컬럼',
            'description': '진행 중 작업',
            'suggestedComponents': ['card', 'badge', 'progress-bar', 'button']
        },
        {
            'id': 'done-column',
            'name': 'Done 컬럼',
            'description': '완료 작업',
            'suggestedComponents': ['card', 'badge', 'button']
        }
    ],
    'form': [
        {
            'id': 'form-header',
            'name': '폼 헤더',
            'description': '상단 제목/설명',
            'suggestedComponents': ['label', 'divider']
        },
        {
            'id': 'form-section1',
            'name': '기본 정보',
            'description': '첫 번째 섹션',
            'suggestedComponents': ['textbox', 'codeview', 'combo', 'date-picker', 'time-picker', 'number-input', 'checkbox', 'radio']
        },
        {
            'id': 'form-section2',
            'name': '추가 정보',
            'description': '두 번째 섹션',
            'suggestedComponents': ['textarea', 'file-upload', 'checkbox', 'combo', 'codeview']
        },
        {
            'id': 'form-actions',
            'name': '액션 버튼',
            'description': '하단 저장/취소',
            'suggestedComponents': ['button']
        }
    ]
}

LAYOUTS_DATA = [
    {
        'id': 'search-grid',
        'name': 'SearchGrid',
        'description': '검색 + 그리드 레이아웃 (작업지시 조회, 자재 목록)',
        'category': 'mes',
        'sort_order': '1',
        'html_template': '''<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SearchGrid Layout</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script defer src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js"></script>
</head>
<body class="bg-gray-100">
  <div class="container mx-auto p-6">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">{{title}}</h1>
      <p class="text-gray-600">{{description}}</p>
    </div>

    <!-- Search Bar -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="flex gap-4">
        <!-- search-area components here -->
      </div>
    </div>

    <!-- Grid Toolbar -->
    <div class="bg-white rounded-lg shadow p-2 mb-2">
      <!-- grid-toolbar components here -->
    </div>

    <!-- Data Grid -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <!-- grid-area components here -->
    </div>
  </div>
</body>
</html>'''
    },
    {
        'id': 'master-detail',
        'name': 'MasterDetail',
        'description': '마스터-디테일 레이아웃 (작업지시서, 설비 정보)',
        'category': 'mes',
        'sort_order': '2',
        'html_template': '''<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MasterDetail Layout</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script defer src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js"></script>
</head>
<body class="bg-gray-100 h-screen">
  <div class="flex h-full">
    <!-- Master List (Left) -->
    <div class="w-1/3 bg-white border-r border-gray-200 overflow-y-auto">
      <div class="p-4 border-b border-gray-200">
        <!-- master-toolbar -->
      </div>
      <div class="divide-y divide-gray-200">
        <!-- master-list -->
      </div>
    </div>

    <!-- Detail Panel (Right) -->
    <div class="flex-1 bg-gray-50 overflow-y-auto p-6">
      <!-- detail-header -->
      <!-- detail-form -->
    </div>
  </div>
</body>
</html>'''
    },
    {
        'id': 'dashboard',
        'name': 'Dashboard',
        'description': '대시보드 레이아웃 (생산 현황판, 실시간 모니터링)',
        'category': 'mes',
        'sort_order': '3',
        'html_template': '''<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard Layout</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script defer src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js"></script>
</head>
<body class="bg-gray-100">
  <div class="container mx-auto p-6">
    <!-- KPI Cards -->
    <div class="grid grid-cols-3 gap-6 mb-6">
      <!-- kpi-area -->
    </div>

    <!-- Charts -->
    <div class="grid grid-cols-2 gap-6 mb-6">
      <!-- chart-left -->
      <!-- chart-right -->
    </div>

    <!-- Data Table -->
    <div class="bg-white rounded-lg shadow p-6">
      <!-- data-table -->
    </div>
  </div>
</body>
</html>'''
    },
    {
        'id': 'kanban',
        'name': 'Kanban',
        'description': '칸반보드 레이아웃 (작업 진행 상태, 공정 관리)',
        'category': 'mes',
        'sort_order': '4',
        'html_template': '''<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kanban Layout</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script defer src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js"></script>
</head>
<body class="bg-gray-100 h-screen">
  <div class="h-full flex flex-col">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 p-4">
      <!-- kanban-header -->
    </div>

    <!-- Kanban Board -->
    <div class="flex-1 overflow-x-auto p-6">
      <div class="flex gap-6 h-full">
        <!-- todo-column -->
        <!-- inprogress-column -->
        <!-- done-column -->
      </div>
    </div>
  </div>
</body>
</html>'''
    },
    {
        'id': 'form',
        'name': 'Form',
        'description': '입력 폼 레이아웃 (작업 등록, 품질 검사)',
        'category': 'mes',
        'sort_order': '5',
        'html_template': '''<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Form Layout</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script defer src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js"></script>
</head>
<body class="bg-gray-100">
  <div class="container max-w-2xl mx-auto p-6">
    <!-- Form Header -->
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <!-- form-header -->
    </div>

    <!-- Form Body -->
    <form class="bg-white rounded-lg shadow p-6 space-y-6">
      <!-- form-section1 -->
      <!-- form-section2 -->
      
      <!-- Actions -->
      <div class="flex gap-3 pt-4">
        <!-- form-actions -->
      </div>
    </form>
  </div>
</body>
</html>'''
    }
]

# ============================================================
# Component 초기 데이터
# ============================================================

COMPONENTS_DATA = [
    # Form Controls
    {'id': 'button', 'name': '버튼', 'description': '클릭 가능한 버튼', 'type': 'button', 'category': 'form', 'icon': 'MousePointer', 'sort_order': '01', 'available_events': ['click', 'double-click']},
    {'id': 'textbox', 'name': '텍스트박스', 'description': '단일 줄 텍스트 입력', 'type': 'textbox', 'category': 'form', 'icon': 'Type', 'sort_order': '02', 'available_events': ['change', 'submit']},
    {'id': 'codeview', 'name': '코드뷰', 'description': 'Code 조회 (텍스트박스 + 검색 아이콘)', 'type': 'codeview', 'category': 'form', 'icon': 'Search', 'sort_order': '03', 'available_events': ['click', 'change', 'submit']},
    {'id': 'combo', 'name': '콤보박스', 'description': '드롭다운 선택', 'type': 'combo', 'category': 'form', 'icon': 'List', 'sort_order': '04', 'available_events': ['change', 'select']},
    {'id': 'checkbox', 'name': '체크박스', 'description': '다중 선택', 'type': 'checkbox', 'category': 'form', 'icon': 'CheckSquare', 'sort_order': '05', 'available_events': ['change']},
    {'id': 'radio', 'name': '라디오', 'description': '단일 선택', 'type': 'radio', 'category': 'form', 'icon': 'Circle', 'sort_order': '06', 'available_events': ['change']},
    {'id': 'date-picker', 'name': '날짜선택', 'description': '날짜 입력', 'type': 'date-picker', 'category': 'form', 'icon': 'Calendar', 'sort_order': '07', 'available_events': ['change', 'select']},
    {'id': 'time-picker', 'name': '시간선택', 'description': '시간 입력', 'type': 'time-picker', 'category': 'form', 'icon': 'Clock', 'sort_order': '08', 'available_events': ['change', 'select']},
    {'id': 'number-input', 'name': '숫자입력', 'description': '숫자만 입력', 'type': 'number-input', 'category': 'form', 'icon': 'Hash', 'sort_order': '09', 'available_events': ['change', 'submit']},
    {'id': 'textarea', 'name': '텍스트영역', 'description': '여러 줄 텍스트', 'type': 'textarea', 'category': 'form', 'icon': 'FileText', 'sort_order': '10', 'available_events': ['change']},
    {'id': 'file-upload', 'name': '파일업로드', 'description': '파일 첨부', 'type': 'file-upload', 'category': 'form', 'icon': 'Upload', 'sort_order': '11', 'available_events': ['change']},
    
    # Data Display
    {'id': 'grid', 'name': '그리드', 'description': '데이터 테이블', 'type': 'grid', 'category': 'data-display', 'icon': 'Table', 'sort_order': '20', 'available_events': ['row-click', 'cell-click', 'double-click']},
    {'id': 'chart', 'name': '차트', 'description': '데이터 시각화', 'type': 'chart', 'category': 'data-display', 'icon': 'BarChart3', 'sort_order': '21', 'available_events': ['click', 'hover']},
    {'id': 'card', 'name': '카드', 'description': '정보 카드', 'type': 'card', 'category': 'data-display', 'icon': 'CreditCard', 'sort_order': '22', 'available_events': ['click', 'hover']},
    {'id': 'badge', 'name': '뱃지', 'description': '상태 표시', 'type': 'badge', 'category': 'data-display', 'icon': 'Tag', 'sort_order': '23', 'available_events': ['click']},
    {'id': 'progress-bar', 'name': '진행바', 'description': '진행 상태', 'type': 'progress-bar', 'category': 'data-display', 'icon': 'TrendingUp', 'sort_order': '24', 'available_events': ['click']},
    
    # Layout
    {'id': 'divider', 'name': '구분선', 'description': '섹션 구분', 'type': 'divider', 'category': 'layout', 'icon': 'Minus', 'sort_order': '30', 'available_events': []},
    {'id': 'label', 'name': '레이블', 'description': '텍스트 표시', 'type': 'label', 'category': 'layout', 'icon': 'Tag', 'sort_order': '31', 'available_events': ['click']},
]

# ============================================================
# Action 초기 데이터
# ============================================================

ACTIONS_DATA = [
    # UI Actions
    {
        'id': 'open-modal',
        'name': '모달 열기',
        'description': '모달 팝업을 엽니다',
        'category': 'ui',
        'icon': 'Maximize2',
        'sort_order': '01',
        'params_schema': {
            'modalId': {'type': 'string', 'required': True, 'description': '열 모달의 ID'},
            'data': {'type': 'object', 'required': False, 'description': '전달할 데이터'}
        }
    },
    {
        'id': 'close-modal',
        'name': '모달 닫기',
        'description': '모달 팝업을 닫습니다',
        'category': 'ui',
        'icon': 'X',
        'sort_order': '02',
        'params_schema': {
            'modalId': {'type': 'string', 'required': False, 'description': '닫을 모달의 ID (없으면 현재 모달)'}
        }
    },
    {
        'id': 'show-alert',
        'name': '알림 표시',
        'description': '알림 메시지를 표시합니다',
        'category': 'ui',
        'icon': 'Bell',
        'sort_order': '03',
        'params_schema': {
            'message': {'type': 'string', 'required': True, 'description': '표시할 메시지'},
            'type': {'type': 'string', 'required': False, 'description': 'success, warning, error, info'}
        }
    },
    {
        'id': 'show-confirm',
        'name': '확인 대화상자',
        'description': '확인/취소 대화상자를 표시합니다',
        'category': 'ui',
        'icon': 'AlertCircle',
        'sort_order': '04',
        'params_schema': {
            'message': {'type': 'string', 'required': True, 'description': '확인 메시지'},
            'onConfirm': {'type': 'function', 'required': False, 'description': '확인 시 실행할 액션'},
            'onCancel': {'type': 'function', 'required': False, 'description': '취소 시 실행할 액션'}
        }
    },
    
    # Data Actions
    {
        'id': 'api-call',
        'name': 'API 호출',
        'description': '백엔드 API를 호출합니다',
        'category': 'data',
        'icon': 'Globe',
        'sort_order': '10',
        'params_schema': {
            'url': {'type': 'string', 'required': True, 'description': 'API URL'},
            'method': {'type': 'string', 'required': False, 'description': 'GET, POST, PUT, DELETE'},
            'body': {'type': 'object', 'required': False, 'description': '요청 본문'}
        }
    },
    {
        'id': 'refresh-data',
        'name': '데이터 새로고침',
        'description': '그리드 또는 폼 데이터를 다시 로드합니다',
        'category': 'data',
        'icon': 'RefreshCw',
        'sort_order': '11',
        'params_schema': {
            'targetId': {'type': 'string', 'required': False, 'description': '새로고침할 컴포넌트 ID'}
        }
    },
    {
        'id': 'save-form',
        'name': '폼 저장',
        'description': '폼 데이터를 저장합니다',
        'category': 'data',
        'icon': 'Save',
        'sort_order': '12',
        'params_schema': {
            'formId': {'type': 'string', 'required': False, 'description': '저장할 폼 ID'},
            'endpoint': {'type': 'string', 'required': False, 'description': '저장 API 엔드포인트'}
        }
    },
    {
        'id': 'export-excel',
        'name': '엑셀 내보내기',
        'description': '데이터를 엑셀 파일로 내보냅니다',
        'category': 'data',
        'icon': 'FileSpreadsheet',
        'sort_order': '13',
        'params_schema': {
            'gridId': {'type': 'string', 'required': False, 'description': '내보낼 그리드 ID'},
            'filename': {'type': 'string', 'required': False, 'description': '파일 이름'}
        }
    },
    
    # Navigation Actions
    {
        'id': 'navigate',
        'name': '페이지 이동',
        'description': '다른 페이지로 이동합니다',
        'category': 'navigation',
        'icon': 'ArrowRight',
        'sort_order': '20',
        'params_schema': {
            'path': {'type': 'string', 'required': True, 'description': '이동할 경로'},
            'params': {'type': 'object', 'required': False, 'description': 'URL 파라미터'}
        }
    },
    {
        'id': 'go-back',
        'name': '뒤로 가기',
        'description': '이전 페이지로 돌아갑니다',
        'category': 'navigation',
        'icon': 'ArrowLeft',
        'sort_order': '21',
        'params_schema': {}
    },
]


def seed_layouts(db: Session) -> int:
    """Layout 데이터 시딩"""
    count = db.query(Layout).count()
    if count > 0:
        print(f"⏭️  Layouts: 이미 {count}개 데이터 존재 (건너뜀)")
        return 0
    
    inserted = 0
    for data in LAYOUTS_DATA:
        layout = Layout(
            id=data['id'],
            name=data['name'],
            description=data['description'],
            html_template=data['html_template'],
            areas=LAYOUT_AREAS.get(data['id'], []),
            category=data['category'],
            sort_order=data['sort_order'],
            is_active=True
        )
        db.add(layout)
        inserted += 1
    
    db.commit()
    print(f"✅ Layouts: {inserted}개 삽입 완료")
    return inserted


def seed_components(db: Session) -> int:
    """Component 데이터 시딩"""
    count = db.query(Component).count()
    if count > 0:
        print(f"⏭️  Components: 이미 {count}개 데이터 존재 (건너뜀)")
        return 0
    
    inserted = 0
    for data in COMPONENTS_DATA:
        component = Component(
            id=data['id'],
            name=data['name'],
            description=data['description'],
            type=data['type'],
            category=data['category'],
            icon=data['icon'],
            sort_order=data['sort_order'],
            available_events=data.get('available_events', []),
            is_active=True
        )
        db.add(component)
        inserted += 1
    
    db.commit()
    print(f"✅ Components: {inserted}개 삽입 완료")
    return inserted


def seed_actions(db: Session) -> int:
    """Action 데이터 시딩"""
    count = db.query(Action).count()
    if count > 0:
        print(f"⏭️  Actions: 이미 {count}개 데이터 존재 (건너뜀)")
        return 0
    
    inserted = 0
    for data in ACTIONS_DATA:
        action = Action(
            id=data['id'],
            name=data['name'],
            description=data['description'],
            category=data['category'],
            icon=data['icon'],
            sort_order=data['sort_order'],
            params_schema=data.get('params_schema', {}),
            is_active=True
        )
        db.add(action)
        inserted += 1
    
    db.commit()
    print(f"✅ Actions: {inserted}개 삽입 완료")
    return inserted


def main():
    """메인 실행 함수"""
    print("=" * 50)
    print("🌱 ForgeFlow Resource Seeding Script")
    print("=" * 50)
    
    # 테이블 생성 (없으면)
    print("\n📦 테이블 확인/생성 중...")
    Base.metadata.create_all(bind=engine)
    print("✅ 테이블 준비 완료")
    
    # 데이터 시딩
    print("\n📥 데이터 시딩 시작...")
    db = SessionLocal()
    try:
        layout_count = seed_layouts(db)
        component_count = seed_components(db)
        action_count = seed_actions(db)
        
        total = layout_count + component_count + action_count
        print(f"\n🎉 시딩 완료! 총 {total}개 레코드 삽입")
    except Exception as e:
        print(f"\n❌ 시딩 실패: {e}")
        db.rollback()
        raise
    finally:
        db.close()
    
    print("=" * 50)


if __name__ == "__main__":
    main()
