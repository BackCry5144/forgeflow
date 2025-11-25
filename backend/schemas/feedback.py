# -*- coding: utf-8 -*-
"""
Feedback Pydantic Schemas - 피드백 API 요청/응답 스키마
"""

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime


class FeedbackBase(BaseModel):
    """피드백 기본 스키마"""
    content: str = Field(..., min_length=1, description="피드백 내용")


class FeedbackCreate(FeedbackBase):
    """피드백 생성 요청 스키마"""
    pass  # screen_id는 URL 파라미터로 전달됨


class FeedbackResponse(FeedbackBase):
    """피드백 응답 스키마"""
    id: int = Field(..., description="피드백 ID")
    screen_id: int = Field(..., description="대상 화면 ID")
    created_at: datetime = Field(..., description="생성 시각")
    
    model_config = ConfigDict(from_attributes=True)


class FeedbackListResponse(BaseModel):
    """피드백 목록 응답 스키마"""
    total: int = Field(..., description="전체 피드백 수")
    items: List[FeedbackResponse] = Field(..., description="피드백 목록")
