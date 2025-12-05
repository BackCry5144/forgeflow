# -*- coding: utf-8 -*-
"""
Resource Pydantic Schemas - Wizard 리소스 API 요청/응답 스키마
"""

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime


# ============================================================
# Layout Schemas (레이아웃)
# ============================================================

class LayoutAreaSchema(BaseModel):
    """레이아웃 영역 스키마"""
    id: str = Field(..., description="영역 ID")
    name: str = Field(..., description="영역 이름")
    description: Optional[str] = Field(None, description="영역 설명")
    suggestedComponents: Optional[List[str]] = Field(default_factory=list, description="권장 컴포넌트 타입 목록")


class LayoutBase(BaseModel):
    """레이아웃 기본 스키마"""
    id: str = Field(..., min_length=1, max_length=50, description="레이아웃 ID")
    name: str = Field(..., min_length=1, max_length=100, description="레이아웃 이름")
    description: Optional[str] = Field(None, description="레이아웃 설명")
    html_template: str = Field(..., description="HTML 템플릿 코드")
    areas: List[LayoutAreaSchema] = Field(default_factory=list, description="레이아웃 영역 정의")
    thumbnail: Optional[str] = Field(None, description="썸네일 URL")
    category: str = Field(default="general", description="카테고리")
    is_active: bool = Field(default=True, description="활성화 여부")
    sort_order: str = Field(default="0", description="정렬 순서")


class LayoutCreate(LayoutBase):
    """레이아웃 생성 요청 스키마"""
    pass


class LayoutUpdate(BaseModel):
    """레이아웃 수정 요청 스키마 (부분 업데이트)"""
    name: Optional[str] = Field(None, max_length=100, description="레이아웃 이름")
    description: Optional[str] = Field(None, description="레이아웃 설명")
    html_template: Optional[str] = Field(None, description="HTML 템플릿 코드")
    areas: Optional[List[LayoutAreaSchema]] = Field(None, description="레이아웃 영역 정의")
    thumbnail: Optional[str] = Field(None, description="썸네일 URL")
    category: Optional[str] = Field(None, description="카테고리")
    is_active: Optional[bool] = Field(None, description="활성화 여부")
    sort_order: Optional[str] = Field(None, description="정렬 순서")


class LayoutResponse(LayoutBase):
    """레이아웃 응답 스키마"""
    created_at: datetime = Field(..., description="생성 시각")
    updated_at: datetime = Field(..., description="수정 시각")
    
    model_config = ConfigDict(from_attributes=True)


class LayoutListResponse(BaseModel):
    """레이아웃 목록 응답 스키마"""
    total: int = Field(..., description="전체 개수")
    items: List[LayoutResponse] = Field(..., description="레이아웃 목록")


# ============================================================
# Component Schemas (컴포넌트)
# ============================================================

class ComponentBase(BaseModel):
    """컴포넌트 기본 스키마"""
    id: str = Field(..., min_length=1, max_length=50, description="컴포넌트 ID")
    name: str = Field(..., min_length=1, max_length=100, description="컴포넌트 이름")
    description: Optional[str] = Field(None, description="컴포넌트 설명")
    type: str = Field(..., description="컴포넌트 타입 (form, data-display, layout)")
    category: str = Field(default="form", description="카테고리")
    icon: str = Field(default="Square", description="Lucide 아이콘 이름")
    default_props: Optional[Dict[str, Any]] = Field(default_factory=dict, description="기본 속성")
    jsx_template: Optional[str] = Field(None, description="JSX 템플릿 코드 스니펫")
    available_events: Optional[List[str]] = Field(default_factory=list, description="사용 가능한 이벤트 타입")
    is_active: bool = Field(default=True, description="활성화 여부")
    sort_order: str = Field(default="0", description="정렬 순서")


class ComponentCreate(ComponentBase):
    """컴포넌트 생성 요청 스키마"""
    pass


class ComponentUpdate(BaseModel):
    """컴포넌트 수정 요청 스키마 (부분 업데이트)"""
    name: Optional[str] = Field(None, max_length=100, description="컴포넌트 이름")
    description: Optional[str] = Field(None, description="컴포넌트 설명")
    type: Optional[str] = Field(None, description="컴포넌트 타입")
    category: Optional[str] = Field(None, description="카테고리")
    icon: Optional[str] = Field(None, description="Lucide 아이콘 이름")
    default_props: Optional[Dict[str, Any]] = Field(None, description="기본 속성")
    jsx_template: Optional[str] = Field(None, description="JSX 템플릿 코드 스니펫")
    available_events: Optional[List[str]] = Field(None, description="사용 가능한 이벤트 타입")
    is_active: Optional[bool] = Field(None, description="활성화 여부")
    sort_order: Optional[str] = Field(None, description="정렬 순서")


class ComponentResponse(ComponentBase):
    """컴포넌트 응답 스키마"""
    created_at: datetime = Field(..., description="생성 시각")
    updated_at: datetime = Field(..., description="수정 시각")
    
    model_config = ConfigDict(from_attributes=True)


class ComponentListResponse(BaseModel):
    """컴포넌트 목록 응답 스키마"""
    total: int = Field(..., description="전체 개수")
    items: List[ComponentResponse] = Field(..., description="컴포넌트 목록")


# ============================================================
# Action Schemas (액션/인터랙션)
# ============================================================

class ActionParamSchema(BaseModel):
    """액션 파라미터 스키마"""
    type: str = Field(..., description="파라미터 타입 (string, number, boolean, object)")
    required: bool = Field(default=False, description="필수 여부")
    description: Optional[str] = Field(None, description="파라미터 설명")
    default: Optional[Any] = Field(None, description="기본값")


class ActionBase(BaseModel):
    """액션 기본 스키마"""
    id: str = Field(..., min_length=1, max_length=50, description="액션 ID")
    name: str = Field(..., min_length=1, max_length=100, description="액션 이름")
    description: Optional[str] = Field(None, description="액션 설명")
    category: str = Field(default="ui", description="카테고리 (ui, data, navigation)")
    icon: Optional[str] = Field(default="Zap", description="아이콘")
    params_schema: Optional[Dict[str, Any]] = Field(default_factory=dict, description="파라미터 스키마")
    code_template: Optional[str] = Field(None, description="코드 템플릿 예시")
    is_active: bool = Field(default=True, description="활성화 여부")
    sort_order: str = Field(default="0", description="정렬 순서")


class ActionCreate(ActionBase):
    """액션 생성 요청 스키마"""
    pass


class ActionUpdate(BaseModel):
    """액션 수정 요청 스키마 (부분 업데이트)"""
    name: Optional[str] = Field(None, max_length=100, description="액션 이름")
    description: Optional[str] = Field(None, description="액션 설명")
    category: Optional[str] = Field(None, description="카테고리")
    icon: Optional[str] = Field(None, description="아이콘")
    params_schema: Optional[Dict[str, Any]] = Field(None, description="파라미터 스키마")
    code_template: Optional[str] = Field(None, description="코드 템플릿 예시")
    is_active: Optional[bool] = Field(None, description="활성화 여부")
    sort_order: Optional[str] = Field(None, description="정렬 순서")


class ActionResponse(ActionBase):
    """액션 응답 스키마"""
    created_at: datetime = Field(..., description="생성 시각")
    updated_at: datetime = Field(..., description="수정 시각")
    
    model_config = ConfigDict(from_attributes=True)


class ActionListResponse(BaseModel):
    """액션 목록 응답 스키마"""
    total: int = Field(..., description="전체 개수")
    items: List[ActionResponse] = Field(..., description="액션 목록")


# ============================================================
# 통합 응답 스키마 (Wizard용)
# ============================================================

class WizardResourcesResponse(BaseModel):
    """Wizard에서 사용하는 전체 리소스 응답"""
    layouts: List[LayoutResponse] = Field(..., description="레이아웃 목록")
    components: List[ComponentResponse] = Field(..., description="컴포넌트 목록")
    actions: List[ActionResponse] = Field(..., description="액션 목록")
