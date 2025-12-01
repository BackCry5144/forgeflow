# -*- coding: utf-8 -*-
"""
캐시 관리 API 라우터
"""
from fastapi import APIRouter, Depends
from services.cache_service import CacheService, get_cache_service
from services.ai_service import get_ai_service, AIService
from typing import Dict, Any

router = APIRouter(prefix="/api/cache", tags=["Cache"])


@router.get("/stats")
async def get_cache_stats(
    cache_service: CacheService = Depends(get_cache_service)
) -> Dict[str, Any]:
    """
    캐시 통계 조회
    
    Returns:
        dict: 캐시 통계 정보
    """
    return cache_service.get_cache_stats()


@router.get("/context-cache/status")
async def get_context_cache_status(
    cache_service: CacheService = Depends(get_cache_service)
) -> Dict[str, Any]:
    """
    Gemini Context Cache 상태 조회
    
    Returns:
        dict: Context Cache 상태 정보
    """
    from utils.prompt_templates import SYSTEM_PROMPT
    
    prompt_length = len(SYSTEM_PROMPT)
    estimated_tokens = prompt_length // 4  # 대략적인 토큰 수 추정
    
    cached_context = cache_service.get_cached_context(SYSTEM_PROMPT)
    
    return {
        "system_prompt": {
            "length_chars": prompt_length,
            "estimated_tokens": estimated_tokens,
            "min_tokens_required": 32768,
            "meets_requirement": estimated_tokens >= 32768
        },
        "cache": {
            "is_cached": cached_context is not None,
            "cache_id": cached_context.get('cache_id') if cached_context else None,
            "created_at": cached_context.get('created_at') if cached_context else None,
            "expires_at": cached_context.get('expires_at') if cached_context else None,
        },
        "redis_available": cache_service.is_available()
    }


@router.post("/context-cache/create")
async def create_context_cache() -> Dict[str, Any]:
    """
    Gemini Context Cache 생성 (수동)
    
    SYSTEM_PROMPT를 Gemini에 캐싱합니다.
    최소 32,768 토큰이 필요합니다.
    
    Returns:
        dict: 생성 결과
    """
    ai_service = get_ai_service()
    
    try:
        cache_id = ai_service._create_context_cache()
        
        if cache_id:
            return {
                "success": True,
                "cache_id": cache_id,
                "message": "Context Cache가 성공적으로 생성되었습니다."
            }
        else:
            return {
                "success": False,
                "cache_id": None,
                "message": "Context Cache 생성 실패. SYSTEM_PROMPT가 최소 토큰 요구사항(32,768)을 충족하지 못할 수 있습니다."
            }
    except Exception as e:
        return {
            "success": False,
            "cache_id": None,
            "message": f"Context Cache 생성 중 오류: {str(e)}"
        }


@router.delete("/clear")
async def clear_all_caches(
    cache_service: CacheService = Depends(get_cache_service)
) -> Dict[str, Any]:
    """
    모든 캐시 삭제
    
    Returns:
        dict: 삭제 결과
    """
    deleted = cache_service.clear_all_caches()
    return {
        "success": True,
        "deleted_count": deleted,
        "message": f"{deleted}개의 캐시가 삭제되었습니다."
    }


@router.delete("/invalidate")
async def invalidate_system_prompt_cache(
    cache_service: CacheService = Depends(get_cache_service)
) -> Dict[str, Any]:
    """
    SYSTEM_PROMPT 캐시 무효화
    (SYSTEM_PROMPT 변경 시 호출)
    
    Returns:
        dict: 무효화 결과
    """
    from utils.prompt_templates import SYSTEM_PROMPT
    
    success = cache_service.invalidate_cache(SYSTEM_PROMPT)
    
    return {
        "success": success,
        "message": "SYSTEM_PROMPT 캐시가 무효화되었습니다." if success else "캐시 무효화 실패"
    }


@router.post("/test")
async def test_cache_with_design_tokens(
    cache_service: CacheService = Depends(get_cache_service)
) -> Dict[str, Any]:
    """
    디자인 토큰이 포함된 SYSTEM_PROMPT를 Redis에 캐싱 테스트
    
    Returns:
        dict: 테스트 결과 (prompt 크기, 캐시 키, 캐시 상태)
    """
    from utils.prompt_templates import SYSTEM_PROMPT, DESIGN_TOKENS
    
    # SYSTEM_PROMPT 크기 측정
    prompt_size = len(SYSTEM_PROMPT)
    prompt_size_kb = prompt_size / 1024
    
    # 디자인 토큰 크기 측정
    import json
    tokens_json = json.dumps(DESIGN_TOKENS, ensure_ascii=False)
    tokens_size = len(tokens_json)
    tokens_size_kb = tokens_size / 1024
    
    # 캐시 키 생성
    cache_key = cache_service.get_cache_key(SYSTEM_PROMPT)
    
    # 캐시 존재 여부 확인
    cached_context = cache_service.get_cached_context(SYSTEM_PROMPT)
    is_cached = cached_context is not None
    
    # 캐시되지 않았으면 임시로 설정 (실제 Gemini API 호출 없이 테스트)
    if not is_cached and cache_service.is_available():
        # 테스트용 캐시 데이터 설정
        test_cache_id = f"test_cache_{cache_key[-8:]}"
        cache_service.set_cached_context(SYSTEM_PROMPT, test_cache_id, ttl_hours=1)
        cached_context = cache_service.get_cached_context(SYSTEM_PROMPT)
        is_cached = True
        cache_status = "newly_cached_for_test"
    elif is_cached:
        cache_status = "already_cached"
    else:
        cache_status = "redis_unavailable"
    
    return {
        "success": True,
        "system_prompt": {
            "size_bytes": prompt_size,
            "size_kb": round(prompt_size_kb, 2),
            "preview": SYSTEM_PROMPT[:200] + "..." if len(SYSTEM_PROMPT) > 200 else SYSTEM_PROMPT
        },
        "design_tokens": {
            "size_bytes": tokens_size,
            "size_kb": round(tokens_size_kb, 2),
            "color_count": len(DESIGN_TOKENS.get('uxon', {}).get('color', {})),
            "has_typography": 'typography' in DESIGN_TOKENS.get('uxon', {}),
            "has_spacing": 'spacing' in DESIGN_TOKENS.get('uxon', {})
        },
        "cache": {
            "key": cache_key,
            "status": cache_status,
            "is_cached": is_cached,
            "cached_data": cached_context if is_cached else None
        },
        "redis_available": cache_service.is_available()
    }
