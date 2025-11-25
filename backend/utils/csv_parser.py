# -*- coding: utf-8 -*-
"""
CSV 유틸리티 - CSV 파일 파싱 및 검증
"""

try:
    import pandas as pd
except Exception:
    pd = None

import io
import csv
from typing import List, Dict, Any
from fastapi import UploadFile, HTTPException, status


async def parse_menu_csv(file: UploadFile) -> List[Dict[str, Any]]:
    """
    CSV 파일을 파싱하여 계층적 메뉴 데이터 리스트로 변환
    
    Args:
        file: 업로드된 CSV 파일
        
    Returns:
        메뉴 데이터 딕셔너리 리스트
        [{"name": "메뉴1", "description": "설명1", "is_folder": True, "parent_id": None, "order_index": 0}, ...]
        
    Raises:
        HTTPException: CSV 형식 오류 시
    """
    try:
        # 파일 내용 읽기
        contents = await file.read()

        # If pandas is available, prefer it (handles many CSV edge cases).
        if pd is not None:
            df = pd.read_csv(
                io.BytesIO(contents),
                encoding='utf-8-sig'  # BOM 처리
            )

            # 컬럼명 정규화
            df.columns = df.columns.str.lower().str.strip()

            # 필수 컬럼 확인
            required_cols = ['name', 'description', 'is_folder', 'parent_id', 'order_index']
            missing_cols = [col for col in required_cols if col not in df.columns]
            if missing_cols:
                raise ValueError(f"CSV 파일에 필수 컬럼이 없습니다: {', '.join(missing_cols)}")

            # NaN 값 처리
            df = df.fillna('')

            # 메뉴 데이터 리스트로 변환
            menus = []
            for _, row in df.iterrows():
                menu_name = str(row.get('name', '')).strip()
                
                # 빈 이름 스킵
                if not menu_name:
                    continue

                # is_folder 파싱
                is_folder = row.get('is_folder', False)
                if isinstance(is_folder, str):
                    is_folder = is_folder.lower() in ['true', '1', 'yes']
                
                # parent_id 파싱 (빈 문자열은 None으로)
                parent_id = str(row.get('parent_id', '')).strip()
                if not parent_id:
                    parent_id = None
                
                # order_index 파싱
                try:
                    order_index = int(row.get('order_index', 0))
                except (ValueError, TypeError):
                    order_index = 0

                menu_data = {
                    'name': menu_name,
                    'description': str(row.get('description', '')).strip() or None,
                    'is_folder': is_folder,
                    'parent_id': parent_id,  # 이름 또는 None
                    'order_index': order_index
                }
                menus.append(menu_data)

            if not menus:
                raise ValueError("CSV 파일에 유효한 메뉴 데이터가 없습니다.")

            return menus

        # Fallback: use Python's csv module when pandas is not installed
        stream = io.BytesIO(contents)
        text = stream.getvalue().decode('utf-8-sig')
        reader = csv.DictReader(io.StringIO(text))
        # normalize headers
        fieldnames = [h.lower().strip() for h in reader.fieldnames or []]

        required_cols = ['name', 'description', 'is_folder', 'parent_id', 'order_index']
        missing_cols = [col for col in required_cols if col not in fieldnames]
        if missing_cols:
            raise ValueError(f"CSV 파일에 필수 컬럼이 없습니다: {', '.join(missing_cols)}")

        menus = []
        for row in reader:
            # keys may have original case; normalize access
            row_norm = {k.lower().strip(): (v if v is not None else '') for k, v in row.items()}

            menu_name = str(row_norm.get('name', '')).strip()
            if not menu_name:
                continue

            # is_folder 파싱
            is_folder = row_norm.get('is_folder', False)
            if isinstance(is_folder, str):
                is_folder = is_folder.lower() in ['true', '1', 'yes']
            
            # parent_id 파싱
            parent_id = str(row_norm.get('parent_id', '')).strip()
            if not parent_id:
                parent_id = None
            
            # order_index 파싱
            try:
                order_index = int(row_norm.get('order_index', 0))
            except (ValueError, TypeError):
                order_index = 0

            menu_data = {
                'name': menu_name,
                'description': (str(row_norm.get('description', '')).strip() or None),
                'is_folder': is_folder,
                'parent_id': parent_id,
                'order_index': order_index
            }
            menus.append(menu_data)

        if not menus:
            raise ValueError("CSV 파일에 유효한 메뉴 데이터가 없습니다.")

        return menus

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"CSV 처리 중 오류 발생: {str(e)}"
        )


def validate_menu_data(menus: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    메뉴 데이터 검증 및 중복 제거
    
    Args:
        menus: 메뉴 데이터 리스트
        
    Returns:
        검증된 메뉴 데이터 리스트
    """
    seen_names = set()
    validated_menus = []
    
    for menu in menus:
        name = menu.get('name', '').strip()
        
        # 이름 검증
        if not name:
            continue
            
        if len(name) > 255:
            name = name[:255]
            menu['name'] = name
        
        # 중복 제거 (대소문자 구분 없이)
        name_lower = name.lower()
        if name_lower in seen_names:
            continue
            
        seen_names.add(name_lower)
        validated_menus.append(menu)
    
    return validated_menus
