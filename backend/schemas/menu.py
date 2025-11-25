# -*- coding: utf-8 -*-
"""
Menu Pydantic Schemas - 메뉴 API 요청/응답 스키마
"""

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime

if TYPE_CHECKING:
    from .screen import ScreenResponse


class MenuBase(BaseModel):
    """메뉴 기본 스키마"""
    name: str = Field(..., min_length=1, max_length=255, description="메뉴 이름")
    description: Optional[str] = Field(None, description="메뉴 설명")
    is_folder: bool = Field(default=False, description="폴더 여부")
    parent_id: Optional[int] = Field(None, description="부모 메뉴 ID")
    order_index: int = Field(default=0, description="정렬 순서")


class MenuCreate(MenuBase):
    """메뉴 생성 요청 스키마"""
    pass


class MenuUpdate(BaseModel):
    """메뉴 수정 요청 스키마 (부분 업데이트)"""
    name: Optional[str] = Field(None, min_length=1, max_length=255, description="메뉴 이름")
    description: Optional[str] = Field(None, description="메뉴 설명")
    is_folder: Optional[bool] = Field(None, description="폴더 여부")
    parent_id: Optional[int] = Field(None, description="부모 메뉴 ID")
    order_index: Optional[int] = Field(None, description="정렬 순서")


class MenuResponse(MenuBase):
    """메뉴 응답 스키마"""
    id: int = Field(..., description="메뉴 ID")
    created_at: datetime = Field(..., description="생성 시각")
    updated_at: datetime = Field(..., description="수정 시각")
    
    model_config = ConfigDict(from_attributes=True)


class MenuDetail(MenuResponse):
    """메뉴 상세 응답 스키마 (화면 목록 포함)"""
    screens: List["ScreenResponse"] = Field(default_factory=list, description="소속 화면 목록")
    children: List["MenuResponse"] = Field(default_factory=list, description="하위 메뉴 목록")
    
    model_config = ConfigDict(from_attributes=True)


class MenuListResponse(BaseModel):
    """메뉴 목록 응답 스키마"""
    total: int = Field(..., description="전체 메뉴 수")
    items: List[MenuResponse] = Field(..., description="메뉴 목록")


class MenuImportResponse(BaseModel):
    """CSV 임포트 응답 스키마"""
    created_count: int = Field(..., description="생성된 메뉴 수")
    skipped_count: int = Field(default=0, description="중복으로 건너뛴 수")
    menus: List[MenuResponse] = Field(..., description="생성된 메뉴 목록")
