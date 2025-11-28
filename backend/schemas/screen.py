# -*- coding: utf-8 -*-
"""
Screen Pydantic Schemas - 화면 API 요청/응답 스키마
"""

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any, TYPE_CHECKING
from datetime import datetime
from enum import Enum

class ScreenStatusEnum(str, Enum):
    """화면 상태 열거형"""
    DRAFT = "draft"
    IN_REVIEW = "in_review"
    APPROVED = "approved"


class ScreenBase(BaseModel):
    """화면 기본 스키마"""
    menu_id: int = Field(..., description="소속 메뉴 ID")
    name: str = Field(..., min_length=1, max_length=255, description="화면 이름")
    description: Optional[str] = Field(None, description="화면 설명")
    prompt: Optional[str] = Field(None, description="LLM에 전달된 전체 프롬프트 (SYSTEM + USER)")


class ScreenCreate(ScreenBase):
    """화면 생성 요청 스키마"""
    pass


class ScreenUpdate(BaseModel):
    """화면 수정 요청 스키마 (부분 업데이트)"""
    name: Optional[str] = Field(None, min_length=1, max_length=255, description="화면 이름")
    description: Optional[str] = Field(None, description="화면 설명")
    prompt: Optional[str] = Field(None, description="LLM에 전달된 전체 프롬프트 (SYSTEM + USER)")
    wizard_data: Optional[Dict[str, Any]] = Field(None, description="Step by Step Wizard 데이터")
    prototype_html: Optional[str] = Field(None, description="HTML 프로토타입")
    design_doc: Optional[bytes] = Field(None, description="설계서")
    test_plan: Optional[str] = Field(None, description="테스트 계획서")
    manual: Optional[str] = Field(None, description="사용자 매뉴얼")
    status: Optional[ScreenStatusEnum] = Field(None, description="화면 상태")


class ScreenResponse(ScreenBase):
    """화면 응답 스키마"""
    id: int = Field(..., description="화면 ID")
    wizard_data: Optional[Dict[str, Any]] = Field(None, description="Step by Step Wizard 데이터")
    prototype_html: Optional[str] = Field(None, description="HTML 프로토타입")
    design_doc: Optional[bytes] = Field(None, description="설계서")
    test_plan: Optional[str] = Field(None, description="테스트 계획서")
    manual: Optional[str] = Field(None, description="사용자 매뉴얼")
    status: ScreenStatusEnum = Field(..., description="화면 상태")
    created_at: datetime = Field(..., description="생성 시각")
    updated_at: datetime = Field(..., description="수정 시각")
    
    model_config = ConfigDict(from_attributes=True)





class ScreenListResponse(BaseModel):
    """화면 목록 응답 스키마"""
    total: int = Field(..., description="전체 화면 수")
    items: List[ScreenResponse] = Field(..., description="화면 목록")


