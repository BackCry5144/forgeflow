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
    ScreenApproveResponse,
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
        "items": screens
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
    
    return db_screen


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
    
    return db_screen


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
    "/{screen_id}/approve",
    response_model=ScreenApproveResponse,
    summary="화면 승인",
    description="화면을 승인 상태로 변경하고 설계서를 생성합니다."
)
async def approve_screen(
    screen_id: int,
    db: Session = Depends(get_db)
):
    """화면 승인 (설계서 생성 기능은 준비 중)"""
    
    db_screen = db.query(Screen).filter(Screen.id == screen_id).first()
    
    if not db_screen:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Screen with id {screen_id} not found"
        )
    
    # 프로토타입이 있는지 확인
    if not db_screen.prototype_html:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="프로토타입이 생성되지 않았습니다. 먼저 프로토타입을 생성해주세요."
        )
    
    try:
        # TODO: 설계서 자동 생성 기능 구현 예정 (generate_design_document 메소드 필요)
        # 현재는 상태만 변경
        db_screen.status = ScreenStatusEnum.APPROVED
        db_screen.design_doc = "# 설계서\n\n설계서 자동 생성 기능은 준비 중입니다."
        db.commit()
        db.refresh(db_screen)
        
        return {
            "id": db_screen.id,
            "status": db_screen.status,
            "message": f"Screen '{db_screen.name}' has been approved successfully"
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"승인 중 오류 발생: {str(e)}"
        )


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
