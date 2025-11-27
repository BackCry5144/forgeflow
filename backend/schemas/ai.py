# -*- coding: utf-8 -*-
"""
AI 생성 관련 Pydantic 스키마
"""
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any


class GenerateRequest(BaseModel):
    """프로토타입 & 설계서 생성 요청"""
    screen_id: int = Field(..., description="화면 ID")
    prompt: Optional[str] = Field(None, description="레거시 프롬프트 (wizard_data가 있으면 무시됨)")
    wizard_data: Optional[Dict[str, Any]] = Field(None, description="Wizard 원본 데이터 (Step1~4, 필수)")
    menu_name: str = Field(..., description="메뉴 이름")
    screen_name: str = Field(..., description="화면 이름")
    
    class Config:
        json_schema_extra = {
            "example": {
                "screen_id": 1,
                "wizard_data": {
                    "step1": {"screenName": "생산 일정", "description": "작업 지시를 계획하고 관리하는 화면"},
                    "step2": {"selectedLayout": "search-grid", "layoutAreas": [...]},
                    "step3": {"components": [...]},
                    "step4": {"interactions": [...]}
                },
                "menu_name": "생산 계획",
                "screen_name": "생산 일정"
            }
        }


class GenerateResponse(BaseModel):
    """프로토타입 생성 응답 (설계서는 승인 시 생성)"""
    prototype_html: str = Field(..., description="HTML 프로토타입")
    design_doc: Optional[bytes] = Field(None, description="설계서")
    
    class Config:
        json_schema_extra = {
            "example": {
                "prototype_html": "<!DOCTYPE html><html>...</html>",
                "design_doc": None
            }
        }

class GenerateAckResponse(BaseModel):
    """비동기 생성 시작 즉시 반환되는 응답 (폴링으로 진행 상황 추적)"""
    screen_id: int = Field(..., description="화면 ID")
    message: str = Field(..., description="생성 시작 안내 메시지")
    started: bool = Field(True, description="생성 프로세스 시작 여부")
    previous_prototype_cleared: bool = Field(..., description="기존 프로토타입/프롬프트 초기화 여부")

    class Config:
        json_schema_extra = {
            "example": {
                "screen_id": 132,
                "message": "프로토타입 생성이 시작되었습니다. 폴링으로 진행 상황을 확인하세요.",
                "started": True,
                "previous_prototype_cleared": True
            }
        }


class GenerateDocumentsRequest(BaseModel):
    """산출물 생성 요청 (승인 후)"""
    screen_id: int = Field(..., description="화면 ID")
    
    class Config:
        json_schema_extra = {
            "example": {
                "screen_id": 1
            }
        }


class GenerateDocumentsResponse(BaseModel):
    """산출물 생성 응답"""
    design_doc: Optional[bytes] = Field(None, description="설계서")
    test_plan: str = Field(..., description="테스트 계획서 (Markdown)")
    manual: str = Field(..., description="사용자 매뉴얼 (Markdown)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "design_doc": "# 설계서\n## 화면 개요\n...",
                "test_plan": "# 테스트 계획서\n## TC-001\n...",
                "manual": "# 사용자 매뉴얼\n## 기능 설명\n..."
            }
        }


class WizardPromptTestRequest(BaseModel):
    """Wizard 프롬프트 테스트 요청 (LLM 호출 없이 프롬프트만 생성 및 DB 저장)"""
    menu_id: Optional[int] = Field(None, description="메뉴 ID (DB 저장용)")
    screen_name: str = Field(..., description="화면 이름")
    menu_name: str = Field(..., description="메뉴 이름")
    wizard_data: Dict[str, Any] = Field(..., description="Wizard 원본 데이터 (Step1~4)")
    layout_type: Optional[str] = Field(None, description="레이아웃 타입 (search-grid, master-detail, dashboard)")
    save_to_db: bool = Field(True, description="DB 저장 여부 (False면 콘솔 출력만)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "menu_id": 93,
                "screen_name": "생산실적 조회",
                "menu_name": "생산 관리",
                "wizard_data": {
                    "step1": {"screenName": "생산실적 조회", "description": "..."},
                    "step2": {"selectedLayout": "search-grid"},
                    "step3": {"components": [...]},
                    "step4": {"interactions": [...]}
                },
                "layout_type": "search-grid",
                "save_to_db": True
            }
        }


class WizardPromptTestResponse(BaseModel):
    """Wizard 프롬프트 테스트 응답"""
    success: bool = Field(..., description="성공 여부")
    final_prompt: str = Field(..., description="생성된 최종 프롬프트 (전체)")
    final_prompt_length: int = Field(..., description="프롬프트 길이 (문자 수)")
    prompt_structure: Optional[Dict[str, Any]] = Field(None, description="MCP 프롬프트 구조")
    saved_to_db: bool = Field(..., description="DB 저장 여부")
    db_record_id: Optional[int] = Field(None, description="DB 저장 시 생성된 레코드 ID")
    execution_time_ms: int = Field(..., description="실행 시간 (밀리초)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "final_prompt": "당신은 전문 UI/UX 설계자이자...",
                "final_prompt_length": 4523,
                "prompt_structure": {"model": "gpt-4", "messages": [...]},
                "saved_to_db": True,
                "db_record_id": 1,
                "execution_time_ms": 125
            }
        }


class GenerationStatusResponse(BaseModel):
    """AI 생성 진행 상황 응답"""
    screen_id: int = Field(..., description="화면 ID")
    generation_status: str = Field(..., description="생성 상태 (idle, saving_wizard, requesting_ai, waiting_quota, generating, validating, completed, failed)")
    generation_progress: int = Field(..., description="진행률 (0-100)")
    generation_message: Optional[str] = Field(None, description="현재 단계 메시지")
    generation_step: int = Field(..., description="현재 단계 번호 (1-4)")
    retry_count: int = Field(..., description="재시도 횟수")
    has_prototype: bool = Field(..., description="프로토타입 생성 완료 여부")
    
    class Config:
        json_schema_extra = {
            "example": {
                "screen_id": 18,
                "generation_status": "waiting_quota",
                "generation_progress": 50,
                "generation_message": "API 할당량 초과 - 60초 후 재시도 (3/10)",
                "generation_step": 2,
                "retry_count": 3,
                "has_prototype": False
            }
        }
