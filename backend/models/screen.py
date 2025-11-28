# -*- coding: utf-8 -*-
"""
Screen Model - 화면 테이블 모델
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum, JSON, LargeBinary
from sqlalchemy.orm import relationship
from datetime import datetime
from zoneinfo import ZoneInfo
import enum
from .database import Base

# 한국 시간대
KST = ZoneInfo("Asia/Seoul")


class ScreenStatus(str, enum.Enum):
    """화면 상태"""
    DRAFT = "draft"
    IN_REVIEW = "in_review"
    APPROVED = "approved"


class GenerationStatus(str, enum.Enum):
    """AI 생성 진행 상태"""
    IDLE = "idle"  # 생성 전 또는 완료 후
    SAVING_WIZARD = "saving_wizard"  # Wizard 데이터 저장 중
    REQUESTING_AI = "requesting_ai"  # AI API 요청 중
    WAITING_QUOTA = "waiting_quota"  # 할당량 대기 중 (재시도)
    GENERATING = "generating"  # 코드 생성 중
    VALIDATING = "validating"  # 검증 중
    COMPLETED = "completed"  # 완료
    FAILED = "failed"  # 실패


class Screen(Base):
    """
    화면 테이블
    - 메뉴에 속함
    - AI 생성 프로토타입 및 산출물 포함
    """
    __tablename__ = "screens"

    # Primary Key
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # Foreign Key
    menu_id = Column(
        Integer, 
        ForeignKey("menus.id", ondelete="CASCADE"), 
        nullable=False,
        index=True,
        comment="소속 메뉴 ID"
    )
    
    # 화면 정보
    name = Column(String(255), nullable=False, comment="화면 이름")
    description = Column(Text, nullable=True, comment="화면 설명")
    
    # 프롬프트 & AI 생성 결과
    prompt = Column(Text, nullable=True, comment="LLM에 전달된 전체 프롬프트 (SYSTEM + USER)")
    wizard_data = Column(JSON, nullable=True, comment="Step by Step Wizard 데이터 (step1~step4)")
    prototype_html = Column(Text, nullable=True, comment="HTML 프로토타입")
    
    # 산출물
    design_doc = Column(LargeBinary, nullable=True, comment="설계서 (Binary)")
    test_plan = Column(Text, nullable=True, comment="테스트 계획서 (Markdown)")
    manual = Column(Text, nullable=True, comment="사용자 매뉴얼 (Markdown)")
    
    # 상태 관리
    status = Column(
        Enum(ScreenStatus, values_callable=lambda x: [e.value for e in x]),
        default=ScreenStatus.DRAFT,
        nullable=False,
        comment="화면 상태"
    )
    
    # AI 생성 진행 상황 추적
    generation_status = Column(
        Enum(GenerationStatus, values_callable=lambda x: [e.value for e in x]),
        default=GenerationStatus.IDLE,
        nullable=False,
        comment="AI 생성 진행 상태"
    )
    generation_progress = Column(
        Integer,
        default=0,
        nullable=False,
        comment="생성 진행률 (0-100)"
    )
    generation_message = Column(
        String(500),
        nullable=True,
        comment="현재 진행 단계 메시지"
    )
    generation_step = Column(
        Integer,
        default=0,
        nullable=False,
        comment="현재 단계 (1: Wizard 저장, 2: AI 요청, 3: 생성, 4: 검증)"
    )
    retry_count = Column(
        Integer,
        default=0,
        nullable=False,
        comment="할당량 초과로 인한 재시도 횟수"
    )
    
    # 타임스탬프
    created_at = Column(
        DateTime, 
        default=lambda: datetime.now(KST), 
        nullable=False,
        comment="생성 시각"
    )
    updated_at = Column(
        DateTime, 
        default=lambda: datetime.now(KST), 
        onupdate=lambda: datetime.now(KST),
        nullable=False,
        comment="수정 시각"
    )

    # 관계: Menu
    menu = relationship("Menu", back_populates="screens")

    def __repr__(self):
        return f"<Screen(id={self.id}, name='{self.name}', status='{self.status}')>"

    def to_dict(self):
        """모델을 딕셔너리로 변환"""
        return {
            "id": self.id,
            "menu_id": self.menu_id,
            "name": self.name,
            "description": self.description,
            "prompt": self.prompt,
            "wizard_data": self.wizard_data,
            "prototype_html": self.prototype_html,
            "design_doc": None,
            "test_plan": self.test_plan,
            "manual": self.manual,
            "status": self.status.value if isinstance(self.status, ScreenStatus) else self.status,
            "generation_status": self.generation_status.value if isinstance(self.generation_status, GenerationStatus) else self.generation_status,
            "generation_progress": self.generation_progress,
            "generation_message": self.generation_message,
            "generation_step": self.generation_step,
            "retry_count": self.retry_count,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
