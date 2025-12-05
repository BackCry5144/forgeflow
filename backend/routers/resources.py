# -*- coding: utf-8 -*-
"""
Resource Router - Wizard 리소스 관리 API
- Layouts: 레이아웃 템플릿 CRUD
- Components: UI 컴포넌트 CRUD
- Actions: 인터랙션 액션 CRUD
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import logging

from models import get_db, Layout, Component, Action
from schemas.resource import (
    # Layout
    LayoutCreate, LayoutUpdate, LayoutResponse, LayoutListResponse,
    # Component
    ComponentCreate, ComponentUpdate, ComponentResponse, ComponentListResponse,
    # Action
    ActionCreate, ActionUpdate, ActionResponse, ActionListResponse,
    # Wizard
    WizardResourcesResponse,
)

# 로깅 설정
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/resources",
    tags=["resources"],
    responses={404: {"description": "Not found"}},
)


# ============================================================
# Wizard Resources (통합 조회)
# ============================================================

@router.get(
    "/wizard",
    response_model=WizardResourcesResponse,
    summary="Wizard 리소스 전체 조회",
    description="Wizard에서 사용하는 레이아웃, 컴포넌트, 액션을 한 번에 조회합니다."
)
async def get_wizard_resources(
    db: Session = Depends(get_db)
):
    """Wizard 리소스 전체 조회 (활성화된 항목만)"""
    layouts = db.query(Layout).filter(Layout.is_active == True).order_by(Layout.sort_order).all()
    components = db.query(Component).filter(Component.is_active == True).order_by(Component.sort_order).all()
    actions = db.query(Action).filter(Action.is_active == True).order_by(Action.sort_order).all()
    
    return {
        "layouts": layouts,
        "components": components,
        "actions": actions
    }


# ============================================================
# Layouts CRUD
# ============================================================

@router.get(
    "/layouts",
    response_model=LayoutListResponse,
    summary="레이아웃 목록 조회",
    description="전체 레이아웃 목록을 조회합니다."
)
async def get_layouts(
    skip: int = 0,
    limit: int = 100,
    include_inactive: bool = False,
    db: Session = Depends(get_db)
):
    """레이아웃 목록 조회"""
    query = db.query(Layout)
    
    if not include_inactive:
        query = query.filter(Layout.is_active == True)
    
    total = query.count()
    layouts = query.order_by(Layout.sort_order).offset(skip).limit(limit).all()
    
    return {
        "total": total,
        "items": layouts
    }


@router.get(
    "/layouts/{layout_id}",
    response_model=LayoutResponse,
    summary="레이아웃 상세 조회",
    description="특정 레이아웃의 상세 정보를 조회합니다."
)
async def get_layout(
    layout_id: str,
    db: Session = Depends(get_db)
):
    """레이아웃 상세 조회"""
    layout = db.query(Layout).filter(Layout.id == layout_id).first()
    
    if not layout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Layout '{layout_id}' not found"
        )
    
    return layout


@router.post(
    "/layouts",
    response_model=LayoutResponse,
    status_code=status.HTTP_201_CREATED,
    summary="레이아웃 생성",
    description="새로운 레이아웃을 생성합니다."
)
async def create_layout(
    layout_data: LayoutCreate,
    db: Session = Depends(get_db)
):
    """레이아웃 생성"""
    # 중복 ID 체크
    existing = db.query(Layout).filter(Layout.id == layout_data.id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Layout with ID '{layout_data.id}' already exists"
        )
    
    # areas를 dict 리스트로 변환 (Pydantic 모델 -> dict)
    areas_data = [area.model_dump() for area in layout_data.areas] if layout_data.areas else []
    
    db_layout = Layout(
        id=layout_data.id,
        name=layout_data.name,
        description=layout_data.description,
        html_template=layout_data.html_template,
        areas=areas_data,
        thumbnail=layout_data.thumbnail,
        category=layout_data.category,
        is_active=layout_data.is_active,
        sort_order=layout_data.sort_order
    )
    
    db.add(db_layout)
    db.commit()
    db.refresh(db_layout)
    
    logger.info(f"Created layout: {layout_data.id}")
    return db_layout


@router.put(
    "/layouts/{layout_id}",
    response_model=LayoutResponse,
    summary="레이아웃 수정",
    description="기존 레이아웃을 수정합니다."
)
async def update_layout(
    layout_id: str,
    layout_data: LayoutUpdate,
    db: Session = Depends(get_db)
):
    """레이아웃 수정"""
    layout = db.query(Layout).filter(Layout.id == layout_id).first()
    
    if not layout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Layout '{layout_id}' not found"
        )
    
    # 업데이트할 필드만 적용
    update_data = layout_data.model_dump(exclude_unset=True)
    
    # areas 처리 (Pydantic 모델 -> dict)
    if 'areas' in update_data and update_data['areas'] is not None:
        update_data['areas'] = [
            area.model_dump() if hasattr(area, 'model_dump') else area 
            for area in update_data['areas']
        ]
    
    for field, value in update_data.items():
        setattr(layout, field, value)
    
    db.commit()
    db.refresh(layout)
    
    logger.info(f"Updated layout: {layout_id}")
    return layout


@router.delete(
    "/layouts/{layout_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="레이아웃 삭제",
    description="레이아웃을 삭제합니다."
)
async def delete_layout(
    layout_id: str,
    db: Session = Depends(get_db)
):
    """레이아웃 삭제"""
    layout = db.query(Layout).filter(Layout.id == layout_id).first()
    
    if not layout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Layout '{layout_id}' not found"
        )
    
    db.delete(layout)
    db.commit()
    
    logger.info(f"Deleted layout: {layout_id}")


# ============================================================
# Components CRUD
# ============================================================

@router.get(
    "/components",
    response_model=ComponentListResponse,
    summary="컴포넌트 목록 조회",
    description="전체 컴포넌트 목록을 조회합니다."
)
async def get_components(
    skip: int = 0,
    limit: int = 100,
    category: str = None,
    include_inactive: bool = False,
    db: Session = Depends(get_db)
):
    """컴포넌트 목록 조회"""
    query = db.query(Component)
    
    if not include_inactive:
        query = query.filter(Component.is_active == True)
    
    if category:
        query = query.filter(Component.category == category)
    
    total = query.count()
    components = query.order_by(Component.sort_order).offset(skip).limit(limit).all()
    
    return {
        "total": total,
        "items": components
    }


@router.get(
    "/components/{component_id}",
    response_model=ComponentResponse,
    summary="컴포넌트 상세 조회",
    description="특정 컴포넌트의 상세 정보를 조회합니다."
)
async def get_component(
    component_id: str,
    db: Session = Depends(get_db)
):
    """컴포넌트 상세 조회"""
    component = db.query(Component).filter(Component.id == component_id).first()
    
    if not component:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Component '{component_id}' not found"
        )
    
    return component


@router.post(
    "/components",
    response_model=ComponentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="컴포넌트 생성",
    description="새로운 컴포넌트를 생성합니다."
)
async def create_component(
    component_data: ComponentCreate,
    db: Session = Depends(get_db)
):
    """컴포넌트 생성"""
    # 중복 ID 체크
    existing = db.query(Component).filter(Component.id == component_data.id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Component with ID '{component_data.id}' already exists"
        )
    
    db_component = Component(
        id=component_data.id,
        name=component_data.name,
        description=component_data.description,
        type=component_data.type,
        category=component_data.category,
        icon=component_data.icon,
        default_props=component_data.default_props,
        jsx_template=component_data.jsx_template,
        available_events=component_data.available_events,
        is_active=component_data.is_active,
        sort_order=component_data.sort_order
    )
    
    db.add(db_component)
    db.commit()
    db.refresh(db_component)
    
    logger.info(f"Created component: {component_data.id}")
    return db_component


@router.put(
    "/components/{component_id}",
    response_model=ComponentResponse,
    summary="컴포넌트 수정",
    description="기존 컴포넌트를 수정합니다."
)
async def update_component(
    component_id: str,
    component_data: ComponentUpdate,
    db: Session = Depends(get_db)
):
    """컴포넌트 수정"""
    component = db.query(Component).filter(Component.id == component_id).first()
    
    if not component:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Component '{component_id}' not found"
        )
    
    # 업데이트할 필드만 적용
    update_data = component_data.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(component, field, value)
    
    db.commit()
    db.refresh(component)
    
    logger.info(f"Updated component: {component_id}")
    return component


@router.delete(
    "/components/{component_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="컴포넌트 삭제",
    description="컴포넌트를 삭제합니다."
)
async def delete_component(
    component_id: str,
    db: Session = Depends(get_db)
):
    """컴포넌트 삭제"""
    component = db.query(Component).filter(Component.id == component_id).first()
    
    if not component:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Component '{component_id}' not found"
        )
    
    db.delete(component)
    db.commit()
    
    logger.info(f"Deleted component: {component_id}")


# ============================================================
# Actions CRUD
# ============================================================

@router.get(
    "/actions",
    response_model=ActionListResponse,
    summary="액션 목록 조회",
    description="전체 액션 목록을 조회합니다."
)
async def get_actions(
    skip: int = 0,
    limit: int = 100,
    category: str = None,
    include_inactive: bool = False,
    db: Session = Depends(get_db)
):
    """액션 목록 조회"""
    query = db.query(Action)
    
    if not include_inactive:
        query = query.filter(Action.is_active == True)
    
    if category:
        query = query.filter(Action.category == category)
    
    total = query.count()
    actions = query.order_by(Action.sort_order).offset(skip).limit(limit).all()
    
    return {
        "total": total,
        "items": actions
    }


@router.get(
    "/actions/{action_id}",
    response_model=ActionResponse,
    summary="액션 상세 조회",
    description="특정 액션의 상세 정보를 조회합니다."
)
async def get_action(
    action_id: str,
    db: Session = Depends(get_db)
):
    """액션 상세 조회"""
    action = db.query(Action).filter(Action.id == action_id).first()
    
    if not action:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Action '{action_id}' not found"
        )
    
    return action


@router.post(
    "/actions",
    response_model=ActionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="액션 생성",
    description="새로운 액션을 생성합니다."
)
async def create_action(
    action_data: ActionCreate,
    db: Session = Depends(get_db)
):
    """액션 생성"""
    # 중복 ID 체크
    existing = db.query(Action).filter(Action.id == action_data.id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Action with ID '{action_data.id}' already exists"
        )
    
    db_action = Action(
        id=action_data.id,
        name=action_data.name,
        description=action_data.description,
        category=action_data.category,
        icon=action_data.icon,
        params_schema=action_data.params_schema,
        code_template=action_data.code_template,
        is_active=action_data.is_active,
        sort_order=action_data.sort_order
    )
    
    db.add(db_action)
    db.commit()
    db.refresh(db_action)
    
    logger.info(f"Created action: {action_data.id}")
    return db_action


@router.put(
    "/actions/{action_id}",
    response_model=ActionResponse,
    summary="액션 수정",
    description="기존 액션을 수정합니다."
)
async def update_action(
    action_id: str,
    action_data: ActionUpdate,
    db: Session = Depends(get_db)
):
    """액션 수정"""
    action = db.query(Action).filter(Action.id == action_id).first()
    
    if not action:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Action '{action_id}' not found"
        )
    
    # 업데이트할 필드만 적용
    update_data = action_data.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(action, field, value)
    
    db.commit()
    db.refresh(action)
    
    logger.info(f"Updated action: {action_id}")
    return action


@router.delete(
    "/actions/{action_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="액션 삭제",
    description="액션을 삭제합니다."
)
async def delete_action(
    action_id: str,
    db: Session = Depends(get_db)
):
    """액션 삭제"""
    action = db.query(Action).filter(Action.id == action_id).first()
    
    if not action:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Action '{action_id}' not found"
        )
    
    db.delete(action)
    db.commit()
    
    logger.info(f"Deleted action: {action_id}")
