# -*- coding: utf-8 -*-
"""
Feedback Model - 피드백 테이블 모델
"""

from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from zoneinfo import ZoneInfo
from .database import Base

# 한국 시간대
KST = ZoneInfo("Asia/Seoul")


class Feedback(Base):
    """
    피드백 테이블
    - 화면에 대한 사용자 피드백 저장
    - 히스토리 관리
    """
    __tablename__ = "feedback"

    # Primary Key
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # Foreign Key
    screen_id = Column(
        Integer, 
        ForeignKey("screens.id", ondelete="CASCADE"), 
        nullable=False,
        index=True,
        comment="대상 화면 ID"
    )
    
    # 피드백 내용
    content = Column(Text, nullable=False, comment="피드백 내용")
    
    # 타임스탬프
    created_at = Column(
        DateTime, 
        default=lambda: datetime.now(KST), 
        nullable=False,
        comment="생성 시각"
    )
    
    # Relationships
    screen = relationship("Screen", back_populates="feedback_list")

    def __repr__(self):
        return f"<Feedback(id={self.id}, screen_id={self.screen_id})>"

    def to_dict(self):
        """모델을 딕셔너리로 변환"""
        return {
            "id": self.id,
            "screen_id": self.screen_id,
            "content": self.content,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
