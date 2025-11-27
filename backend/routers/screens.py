# -*- coding: utf-8 -*-
"""
Screen Router - 화면 관리 API
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from models import get_db, Screen, Menu, Feedback
from schemas.screen import (
    ScreenCreate,
    ScreenUpdate,
    ScreenResponse,
    ScreenDetail,
    ScreenListResponse,
    ScreenStatusEnum
)
from schemas.feedback import FeedbackCreate, FeedbackResponse

router = APIRouter(
    prefix="/api/screens",
    tags=["screens"],
    responses={404: {"description": "Not found"}},
)
@router.post(
    "",
    response_model=ScreenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="화면 생성",
    description="새로운 화면을 생성합니다."
)
async def create_screen(
    screen_data: ScreenCreate,
    db: Session = Depends(get_db)
):
    """화면 생성"""
    # 메뉴 존재 확인
    menu = db.query(Menu).filter(Menu.id == screen_data.menu_id).first()
    if not menu:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Menu with id {screen_data.menu_id} not found"
        )
    
    # Screen 모델 인스턴스 생성
    db_screen = Screen(
        menu_id=screen_data.menu_id,
        name=screen_data.name,
        description=screen_data.description,
        prompt=screen_data.prompt
    )
    
    # DB에 저장
    db.add(db_screen)
    db.commit()
    db.refresh(db_screen)
    
    return db_screen


@router.get(
    "",
    response_model=ScreenListResponse,
    summary="화면 목록 조회",
    description="화면 목록을 조회합니다. menu_id로 필터링 가능."
)
async def get_screens(
    menu_id: Optional[int] = Query(None, description="메뉴 ID로 필터링"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """화면 목록 조회"""
    query = db.query(Screen)
    
    # 메뉴 ID 필터링
    if menu_id is not None:
        query = query.filter(Screen.menu_id == menu_id)
    
    # 전체 개수
    total = query.count()
    
    # 페이지네이션
    screens = query.offset(skip).limit(limit).all()
    
    return {
        "total": total,
        "items": [screen.to_dict() for screen in screens]
    }


@router.get(
    "/{screen_id}",
    response_model=ScreenDetail,
    summary="화면 상세 조회",
    description="특정 화면의 상세 정보를 조회합니다. (피드백 목록 포함)"
)
async def get_screen(
    screen_id: int,
    db: Session = Depends(get_db)
):
    """화면 상세 조회"""
    db_screen = db.query(Screen).filter(Screen.id == screen_id).first()
    
    if not db_screen:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Screen with id {screen_id} not found"
        )
    
    return db_screen.to_dict() if db_screen else None


@router.put(
    "/{screen_id}",
    response_model=ScreenResponse,
    summary="화면 수정",
    description="특정 화면의 정보를 수정합니다."
)
async def update_screen(
    screen_id: int,
    screen_data: ScreenUpdate,
    db: Session = Depends(get_db)
):
    """화면 수정"""
    db_screen = db.query(Screen).filter(Screen.id == screen_id).first()
    
    if not db_screen:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Screen with id {screen_id} not found"
        )
    
    # 업데이트 (None이 아닌 필드만)
    update_data = screen_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_screen, field, value)
    
    db.commit()
    db.refresh(db_screen)
    
    return db_screen.to_dict() if db_screen else None


@router.delete(
    "/{screen_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="화면 삭제",
    description="특정 화면을 삭제합니다. (피드백도 함께 삭제됨)"
)
async def delete_screen(
    screen_id: int,
    db: Session = Depends(get_db)
):
    """화면 삭제"""
    db_screen = db.query(Screen).filter(Screen.id == screen_id).first()
    
    if not db_screen:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Screen with id {screen_id} not found"
        )
    
    db.delete(db_screen)
    db.commit()
    
    return None

@router.post(
    "/{screen_id}/feedback",
    response_model=FeedbackResponse,
    status_code=status.HTTP_201_CREATED,
    summary="피드백 추가",
    description="화면에 피드백을 추가합니다."
)
async def add_feedback(
    screen_id: int,
    feedback_data: FeedbackCreate,
    db: Session = Depends(get_db)
):
    """피드백 추가"""
    # 화면 존재 확인
    db_screen = db.query(Screen).filter(Screen.id == screen_id).first()
    
    if not db_screen:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Screen with id {screen_id} not found"
        )
    
    # Feedback 생성
    db_feedback = Feedback(
        screen_id=screen_id,
        content=feedback_data.content
    )
    
    db.add(db_feedback)
    db.commit()
    db.refresh(db_feedback)
    
    return db_feedback
