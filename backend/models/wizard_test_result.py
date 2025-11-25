# -*- coding: utf-8 -*-
"""
Wizard Test Result 모델 정의
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, JSON
from sqlalchemy.sql import func
from models.database import Base


class WizardTestResult(Base):
    """
    Wizard 기반 프로토타입 생성 테스트 결과 저장
    Playwright 자동화 테스트용으로 설계되었으나, 
    실제 프로토타입 생성 시에도 활용
    """
    __tablename__ = "wizard_test_results"

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime(timezone=False), server_default=func.now())
    menu_id = Column(Integer, nullable=False)
    screen_name = Column(String(255), nullable=False)
    layout_type = Column(String(50), nullable=False)  # 'search-grid', 'master-detail', 'dashboard'
    raw_wizard_data = Column(JSON, nullable=False)  # Wizard 원본 데이터 (step1~step4)
    final_prompt = Column(Text, nullable=True)  # LLM에 전달된 최종 프롬프트
    test_status = Column(String(20), default='pending')  # 'success', 'failed', 'pending'
    error_message = Column(Text, nullable=True)
    test_duration_ms = Column(Integer, nullable=True)
    browser_type = Column(String(50), nullable=True)
