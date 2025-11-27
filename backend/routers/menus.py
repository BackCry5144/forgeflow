# -*- coding: utf-8 -*-
"""
Menu Router - 메뉴 관리 API
"""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import logging

from models import get_db, Menu
from schemas.menu import (
    MenuCreate,
    MenuUpdate,
    MenuResponse,
    MenuDetail,
    MenuListResponse
)
from utils.csv_parser import parse_menu_csv, validate_menu_data

# 로깅 설정
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/menus",
    tags=["menus"],
    responses={404: {"description": "Not found"}},
)


@router.post(
    "",
    response_model=MenuResponse,
    status_code=status.HTTP_201_CREATED,
    summary="메뉴 생성",
    description="새로운 메뉴를 생성합니다."
)
async def create_menu(
    menu_data: MenuCreate,
    db: Session = Depends(get_db)
):
    """메뉴 생성"""
    # order_index 자동 결정 (같은 레벨 내에서 최대값 + 1)
    if menu_data.order_index is None:
        max_order = db.query(Menu).filter(
            Menu.parent_id == menu_data.parent_id
        ).order_by(Menu.order_index.desc()).first()
        
        order_index = (max_order.order_index + 1) if max_order else 0
    else:
        order_index = menu_data.order_index
    
    # Menu 모델 인스턴스 생성
    db_menu = Menu(
        name=menu_data.name,
        description=menu_data.description,
        is_folder=menu_data.is_folder if menu_data.is_folder is not None else False,
        parent_id=menu_data.parent_id,
        order_index=order_index
    )
    
    # DB에 저장
    db.add(db_menu)
    db.commit()
    db.refresh(db_menu)
    
    return db_menu


@router.get(
    "",
    response_model=MenuListResponse,
    summary="메뉴 목록 조회",
    description="전체 메뉴 목록을 조회합니다."
)
async def get_menus(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """메뉴 목록 조회"""
    # 전체 개수
    total = db.query(Menu).count()
    
    # 페이지네이션
    menus = db.query(Menu).offset(skip).limit(limit).all()
    
    return {
        "total": total,
        "items": [menu.__dict__ for menu in menus]
    }


@router.get(
    "/{menu_id}",
    response_model=MenuDetail,
    summary="메뉴 상세 조회",
    description="특정 메뉴의 상세 정보를 조회합니다. (화면 목록 포함)"
)
async def get_menu(
    menu_id: int,
    db: Session = Depends(get_db)
):
    """메뉴 상세 조회"""
    db_menu = db.query(Menu).filter(Menu.id == menu_id).first()
    
    if not db_menu:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Menu with id {menu_id} not found"
        )
    
    if db_menu:
        menu_dict = db_menu.__dict__.copy()
        # screens 리스트 to_dict 적용
        if hasattr(db_menu, 'screens'):
            menu_dict['screens'] = [screen.to_dict() for screen in db_menu.screens]
        # children도 dict로 변환 (트리 구조 지원 시)
        if hasattr(db_menu, 'children'):
            menu_dict['children'] = [child.__dict__ for child in db_menu.children]
        return menu_dict
    return None


@router.put(
    "/{menu_id}",
    response_model=MenuResponse,
    summary="메뉴 수정",
    description="특정 메뉴의 정보를 수정합니다."
)
async def update_menu(
    menu_id: int,
    menu_data: MenuUpdate,
    db: Session = Depends(get_db)
):
    """메뉴 수정"""
    db_menu = db.query(Menu).filter(Menu.id == menu_id).first()
    
    if not db_menu:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Menu with id {menu_id} not found"
        )
    
    # 업데이트 (None이 아닌 필드만)
    update_data = menu_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_menu, field, value)
    
    db.commit()
    db.refresh(db_menu)
    
    return db_menu


@router.delete(
    "/{menu_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="메뉴 삭제",
    description="특정 메뉴를 삭제합니다. (소속 화면도 함께 삭제됨)"
)
async def delete_menu(
    menu_id: int,
    db: Session = Depends(get_db)
):
    """메뉴 삭제"""
    db_menu = db.query(Menu).filter(Menu.id == menu_id).first()
    
    if not db_menu:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Menu with id {menu_id} not found"
        )
    
    db.delete(db_menu)
    db.commit()
    
    return None


@router.post(
    "/import",
    response_model=dict,
    status_code=status.HTTP_201_CREATED,
    summary="CSV 파일로 계층적 메뉴 일괄 생성",
    description="CSV 파일을 업로드하여 계층적 메뉴 구조를 한 번에 생성합니다."
)
async def import_menus_from_csv(
    file: UploadFile = File(..., description="CSV 파일 (name, description, is_folder, parent_id, order_index 컬럼 필요)"),
    clear_existing: bool = False,
    db: Session = Depends(get_db)
):
    """
    CSV 임포트 (계층적 구조 지원)
    
    CSV 형식:
    ```
    name,description,is_folder,parent_id,order_index
    생산 대시보드,실시간 생산 현황,true,,0
    실시간 생산 현황,생산 현황 모니터링,false,생산 대시보드,0
    ```
    
    parent_id는 부모 메뉴의 name을 참조합니다.
    """
    logger.info(f"CSV 임포트 시작: {file.filename}, clear_existing={clear_existing}")
    
    # 파일 형식 검증
    if not file.filename.endswith('.csv'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="CSV 파일만 업로드 가능합니다."
        )
    
    try:
        # 기존 메뉴 삭제 (옵션)
        if clear_existing:
            logger.info("기존 메뉴 삭제 중...")
            db.query(Menu).delete()
            db.commit()
            logger.info("기존 메뉴 삭제 완료")
        
        # CSV 파싱
        menus_data = await parse_menu_csv(file)
        logger.info(f"CSV 파싱 완료: {len(menus_data)}개 메뉴 발견")
        
        # 데이터 검증
        validated_menus = validate_menu_data(menus_data)
        logger.info(f"검증 완료: {len(validated_menus)}개 메뉴")
        
        # 계층적 임포트: 여러 패스로 부모->자식 순서대로 생성
        name_to_id = {}  # 메뉴 이름 -> DB ID 매핑
        created_menus = []
        skipped_count = 0
        remaining_menus = validated_menus.copy()
        max_passes = 10  # 무한 루프 방지
        
        for pass_num in range(max_passes):
            if not remaining_menus:
                break
                
            logger.info(f"Pass {pass_num + 1}: {len(remaining_menus)}개 메뉴 처리 중...")
            still_pending = []
            created_this_pass = 0
            
            for menu_data in remaining_menus:
                menu_name = menu_data['name']
                parent_name = menu_data.get('parent_id')
                
                # DB에 동일 이름 메뉴 존재 여부 확인 (중복 방지)
                if menu_name in name_to_id:
                    logger.warning(f"중복 메뉴 스킵: {menu_name}")
                    skipped_count += 1
                    continue
                
                existing_menu = db.query(Menu).filter(Menu.name == menu_name).first()
                if existing_menu:
                    logger.warning(f"DB에 이미 존재하는 메뉴 스킵: {menu_name}")
                    name_to_id[menu_name] = existing_menu.id
                    skipped_count += 1
                    continue
                
                # 부모 ID 해결
                parent_db_id = None
                if parent_name:
                    if parent_name in name_to_id:
                        parent_db_id = name_to_id[parent_name]
                    else:
                        # 부모가 아직 생성되지 않음 -> 다음 패스로 연기
                        still_pending.append(menu_data)
                        continue
                
                # 새 메뉴 생성
                db_menu = Menu(
                    name=menu_name,
                    description=menu_data.get('description'),
                    is_folder=menu_data.get('is_folder', False),
                    parent_id=parent_db_id,
                    order_index=menu_data.get('order_index', 0)
                )
                db.add(db_menu)
                db.flush()  # ID 할당을 위해 flush
                
                name_to_id[menu_name] = db_menu.id
                created_menus.append(db_menu)
                created_this_pass += 1
            
            logger.info(f"Pass {pass_num + 1} 완료: {created_this_pass}개 생성, {len(still_pending)}개 대기")
            
            # 더 이상 생성되지 않으면 순환 참조 또는 누락된 부모
            if created_this_pass == 0 and still_pending:
                missing_parents = set()
                for menu_data in still_pending:
                    parent_name = menu_data.get('parent_id')
                    if parent_name and parent_name not in name_to_id:
                        missing_parents.add(parent_name)
                
                logger.error(f"순환 참조 또는 누락된 부모 메뉴: {missing_parents}")
                raise ValueError(f"다음 부모 메뉴를 찾을 수 없습니다: {', '.join(missing_parents)}")
            
            remaining_menus = still_pending
        
        # 최종 커밋
        db.commit()
        
        # 생성된 메뉴 리스트 갱신
        for menu in created_menus:
            db.refresh(menu)
        
        logger.info(f"CSV 임포트 완료: {len(created_menus)}개 생성, {skipped_count}개 스킵")
        
        return {
            "success": True,
            "created_count": len(created_menus),
            "skipped_count": skipped_count,
            "total_in_csv": len(menus_data),
            "menus": [
                {
                    "id": menu.id,
                    "name": menu.name,
                    "description": menu.description,
                    "is_folder": menu.is_folder,
                    "parent_id": menu.parent_id,
                    "order_index": menu.order_index
                }
                for menu in created_menus
            ]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"CSV 임포트 실패: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"CSV 임포트 중 오류 발생: {str(e)}"
        )
