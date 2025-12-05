# -*- coding: utf-8 -*-
"""
Resource Models - Wizard 리소스 테이블 모델
- Layout: 화면 레이아웃 템플릿
- Component: UI 컴포넌트 정의
- Action: 인터랙션/액션 정의
"""

from sqlalchemy import Column, String, Text, DateTime, JSON, Boolean
from datetime import datetime
from zoneinfo import ZoneInfo
from .database import Base

# 한국 시간대
KST = ZoneInfo("Asia/Seoul")


class Layout(Base):
    """
    레이아웃 템플릿 테이블
    - Wizard Step 2에서 선택 가능한 레이아웃 정의
    - HTML 템플릿과 영역(areas) 정보 포함
    """
    __tablename__ = "layouts"

    # Primary Key (문자열 ID 사용: 'search-grid', 'master-detail' 등)
    id = Column(String(50), primary_key=True, index=True, comment="레이아웃 고유 ID")
    
    # 기본 정보
    name = Column(String(100), nullable=False, comment="레이아웃 이름 (예: SearchGrid)")
    description = Column(Text, nullable=True, comment="레이아웃 설명")
    
    # 템플릿 콘텐츠
    html_template = Column(Text, nullable=False, comment="HTML/Tailwind 템플릿 코드")
    
    # 레이아웃 영역 정보 (JSON)
    # 예: [{"id": "search-area", "name": "검색 영역", "description": "...", "suggestedComponents": [...]}]
    areas = Column(JSON, nullable=False, default=list, comment="레이아웃 영역 정의 (JSON)")
    
    # 메타데이터
    thumbnail = Column(String(255), nullable=True, comment="썸네일 이미지 URL/경로")
    category = Column(String(50), nullable=False, default="general", comment="카테고리 (mes, erp, general 등)")
    
    # 활성화 상태
    is_active = Column(Boolean, nullable=False, default=True, comment="활성화 여부")
    
    # 정렬 순서
    sort_order = Column(String(10), nullable=False, default="0", comment="정렬 순서")
    
    # 타임스탬프
    created_at = Column(
        DateTime, 
        default=lambda: datetime.now(KST), 
        nullable=False,
        comment="생성일시"
    )
    updated_at = Column(
        DateTime, 
        default=lambda: datetime.now(KST),
        onupdate=lambda: datetime.now(KST),
        nullable=False,
        comment="수정일시"
    )

    def __repr__(self):
        return f"<Layout(id={self.id}, name={self.name})>"


class Component(Base):
    """
    UI 컴포넌트 정의 테이블
    - Wizard Step 3에서 선택 가능한 컴포넌트 정의
    - 컴포넌트 유형, 기본 속성, JSX 템플릿 포함
    """
    __tablename__ = "components"

    # Primary Key (문자열 ID 사용: 'textbox', 'button', 'grid' 등)
    id = Column(String(50), primary_key=True, index=True, comment="컴포넌트 고유 ID")
    
    # 기본 정보
    name = Column(String(100), nullable=False, comment="컴포넌트 이름 (예: 텍스트박스)")
    description = Column(Text, nullable=True, comment="컴포넌트 설명")
    
    # 컴포넌트 분류
    type = Column(String(50), nullable=False, comment="컴포넌트 타입 (form, data-display, layout 등)")
    category = Column(String(50), nullable=False, default="form", comment="카테고리")
    
    # 아이콘 (Lucide React 아이콘 이름)
    icon = Column(String(50), nullable=False, default="Square", comment="Lucide 아이콘 이름")
    
    # 기본 속성 (JSON)
    # 예: {"placeholder": "YYYY-MM-DD", "required": false}
    default_props = Column(JSON, nullable=True, default=dict, comment="기본 속성 (JSON)")
    
    # JSX/HTML 템플릿 (LLM이 생성에 참고할 코드 스니펫)
    jsx_template = Column(Text, nullable=True, comment="React/JSX 템플릿 코드 스니펫")
    
    # 인터랙션 가능한 이벤트 목록 (JSON)
    # 예: ["click", "change", "submit"]
    available_events = Column(JSON, nullable=True, default=list, comment="사용 가능한 이벤트 타입 (JSON)")
    
    # 활성화 상태
    is_active = Column(Boolean, nullable=False, default=True, comment="활성화 여부")
    
    # 정렬 순서
    sort_order = Column(String(10), nullable=False, default="0", comment="정렬 순서")
    
    # 타임스탬프
    created_at = Column(
        DateTime, 
        default=lambda: datetime.now(KST), 
        nullable=False,
        comment="생성일시"
    )
    updated_at = Column(
        DateTime, 
        default=lambda: datetime.now(KST),
        onupdate=lambda: datetime.now(KST),
        nullable=False,
        comment="수정일시"
    )

    def __repr__(self):
        return f"<Component(id={self.id}, name={self.name})>"


class Action(Base):
    """
    인터랙션 액션 정의 테이블
    - Wizard Step 4에서 선택 가능한 액션 정의
    - 액션 유형, 파라미터 스키마 포함
    """
    __tablename__ = "actions"

    # Primary Key (문자열 ID 사용: 'open-modal', 'api-call', 'navigation' 등)
    id = Column(String(50), primary_key=True, index=True, comment="액션 고유 ID")
    
    # 기본 정보
    name = Column(String(100), nullable=False, comment="액션 이름 (예: 모달 열기)")
    description = Column(Text, nullable=True, comment="액션 설명")
    
    # 액션 분류
    category = Column(String(50), nullable=False, default="ui", comment="카테고리 (ui, data, navigation 등)")
    
    # 아이콘 (Lucide React 아이콘 이름 또는 이모지)
    icon = Column(String(50), nullable=True, default="Zap", comment="아이콘")
    
    # 파라미터 스키마 (JSON)
    # 예: {"target_modal": {"type": "string", "required": true}, "data": {"type": "object"}}
    params_schema = Column(JSON, nullable=True, default=dict, comment="파라미터 스키마 (JSON)")
    
    # 예시 코드 스니펫
    code_template = Column(Text, nullable=True, comment="코드 템플릿 예시")
    
    # 활성화 상태
    is_active = Column(Boolean, nullable=False, default=True, comment="활성화 여부")
    
    # 정렬 순서
    sort_order = Column(String(10), nullable=False, default="0", comment="정렬 순서")
    
    # 타임스탬프
    created_at = Column(
        DateTime, 
        default=lambda: datetime.now(KST), 
        nullable=False,
        comment="생성일시"
    )
    updated_at = Column(
        DateTime, 
        default=lambda: datetime.now(KST),
        onupdate=lambda: datetime.now(KST),
        nullable=False,
        comment="수정일시"
    )

    def __repr__(self):
        return f"<Action(id={self.id}, name={self.name})>"
