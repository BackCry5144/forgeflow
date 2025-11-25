# -*- coding: utf-8 -*-
"""
Menu Model - 메뉴 테이블 모델
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship, backref
from datetime import datetime
from zoneinfo import ZoneInfo
from .database import Base

# 한국 시간대
KST = ZoneInfo("Asia/Seoul")


class Menu(Base):
    """
    메뉴 테이블
    - 최상위 엔티티
    - 여러 개의 Screen을 포함
    """
    __tablename__ = "menus"

    # Primary Key
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # 메뉴 정보
    name = Column(String(255), nullable=False, comment="메뉴 이름")
    description = Column(Text, nullable=True, comment="메뉴 설명")
    
    # 트리 구조 및 폴더 기능
    is_folder = Column(Boolean, default=False, nullable=False, comment="폴더 여부")
    parent_id = Column(Integer, ForeignKey('menus.id'), nullable=True, comment="부모 메뉴 ID")
    order_index = Column(Integer, default=0, nullable=False, comment="정렬 순서")
    
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
    
    # Relationships
    screens = relationship(
        "Screen", 
        back_populates="menu", 
        cascade="all, delete-orphan",
        lazy="selectin"  # N+1 쿼리 방지
    )
    
    # Self-referential relationship for tree structure
    children = relationship(
        "Menu",
        backref=backref('parent', remote_side='Menu.id'),
        lazy="selectin"
    )

    def __repr__(self):
        return f"<Menu(id={self.id}, name='{self.name}')>"

    def to_dict(self):
        """모델을 딕셔너리로 변환"""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
