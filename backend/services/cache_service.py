# -*- coding: utf-8 -*-
"""
Redis Cache Service for Context Caching
"""
import os
import json
import hashlib
import logging
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
import redis

logger = logging.getLogger(__name__)


class CacheService:
    """Redis 기반 캐시 서비스"""
    
    def __init__(self):
        """Redis 연결 초기화"""
        redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
        
        try:
            self.redis_client = redis.from_url(
                redis_url,
                decode_responses=True,
                socket_connect_timeout=5,
                socket_timeout=5
            )
            # 연결 테스트
            self.redis_client.ping()
            logger.info(f"✅ Redis connected: {redis_url}")
        except redis.ConnectionError as e:
            logger.warning(f"⚠️ Redis connection failed: {e}. Caching disabled.")
            self.redis_client = None
    
    def is_available(self) -> bool:
        """Redis 사용 가능 여부"""
        return self.redis_client is not None
    
    def get_cache_key(self, system_prompt: str) -> str:
        """
        System Prompt의 해시를 생성하여 캐시 키로 사용
        
        Args:
            system_prompt: 시스템 프롬프트
            
        Returns:
            str: 캐시 키 (예: "gemini_cache:abc123...")
        """
        prompt_hash = hashlib.sha256(system_prompt.encode()).hexdigest()[:16]
        return f"gemini_cache:{prompt_hash}"
    
    def get_cached_context(self, system_prompt: str) -> Optional[Dict[str, Any]]:
        """
        캐시된 컨텍스트 가져오기
        
        Args:
            system_prompt: 시스템 프롬프트
            
        Returns:
            dict: 캐시 데이터 (cache_id, created_at, expires_at) 또는 None
        """
        if not self.is_available():
            return None
        
        try:
            cache_key = self.get_cache_key(system_prompt)
            cached_data = self.redis_client.get(cache_key)
            
            if cached_data:
                data = json.loads(cached_data)
                
                # 만료 시간 체크
                expires_at = datetime.fromisoformat(data['expires_at'])
                if datetime.now() < expires_at:
                    logger.info(f"✅ Cache HIT: {cache_key}")
                    return data
                else:
                    logger.info(f"⏰ Cache EXPIRED: {cache_key}")
                    self.redis_client.delete(cache_key)
                    return None
            
            logger.info(f"❌ Cache MISS: {cache_key}")
            return None
            
        except Exception as e:
            logger.error(f"Error getting cached context: {e}")
            return None
    
    def set_cached_context(
        self,
        system_prompt: str,
        cache_id: str,
        ttl_hours: int = 1
    ) -> bool:
        """
        캐시된 컨텍스트 저장
        
        Args:
            system_prompt: 시스템 프롬프트
            cache_id: Gemini API에서 반환한 캐시 ID
            ttl_hours: 캐시 만료 시간 (시간)
            
        Returns:
            bool: 저장 성공 여부
        """
        if not self.is_available():
            return False
        
        try:
            cache_key = self.get_cache_key(system_prompt)
            now = datetime.now()
            expires_at = now + timedelta(hours=ttl_hours)
            
            cache_data = {
                "cache_id": cache_id,
                "created_at": now.isoformat(),
                "expires_at": expires_at.isoformat(),
                "system_prompt_hash": cache_key
            }
            
            # Redis에 저장 (TTL 설정)
            self.redis_client.setex(
                cache_key,
                timedelta(hours=ttl_hours),
                json.dumps(cache_data)
            )
            
            logger.info(f"💾 Cache SAVED: {cache_key} (expires in {ttl_hours}h)")
            return True
            
        except Exception as e:
            logger.error(f"Error setting cached context: {e}")
            return False
    
    def invalidate_cache(self, system_prompt: str) -> bool:
        """
        캐시 무효화 (SYSTEM_PROMPT 변경 시 호출)
        
        Args:
            system_prompt: 시스템 프롬프트
            
        Returns:
            bool: 무효화 성공 여부
        """
        if not self.is_available():
            return False
        
        try:
            cache_key = self.get_cache_key(system_prompt)
            deleted = self.redis_client.delete(cache_key)
            
            if deleted:
                logger.info(f"🗑️ Cache INVALIDATED: {cache_key}")
            
            return bool(deleted)
            
        except Exception as e:
            logger.error(f"Error invalidating cache: {e}")
            return False
    
    def clear_all_caches(self) -> int:
        """
        모든 Gemini 캐시 삭제
        
        Returns:
            int: 삭제된 캐시 개수
        """
        if not self.is_available():
            return 0
        
        try:
            pattern = "gemini_cache:*"
            keys = list(self.redis_client.scan_iter(match=pattern))
            
            if keys:
                deleted = self.redis_client.delete(*keys)
                logger.info(f"🗑️ Cleared {deleted} cache entries")
                return deleted
            
            return 0
            
        except Exception as e:
            logger.error(f"Error clearing caches: {e}")
            return 0
    
    def get_cache_stats(self) -> Dict[str, Any]:
        """
        캐시 통계 정보
        
        Returns:
            dict: 캐시 통계 (총 개수, Redis 정보 등)
        """
        if not self.is_available():
            return {"available": False}
        
        try:
            pattern = "gemini_cache:*"
            keys = list(self.redis_client.scan_iter(match=pattern))
            
            info = self.redis_client.info()
            
            return {
                "available": True,
                "total_caches": len(keys),
                "redis_version": info.get("redis_version"),
                "used_memory_human": info.get("used_memory_human"),
                "connected_clients": info.get("connected_clients"),
            }
            
        except Exception as e:
            logger.error(f"Error getting cache stats: {e}")
            return {"available": False, "error": str(e)}


# 싱글톤 인스턴스
_cache_service_instance: Optional[CacheService] = None


def get_cache_service() -> CacheService:
    """캐시 서비스 싱글톤 인스턴스 반환"""
    global _cache_service_instance
    if _cache_service_instance is None:
        _cache_service_instance = CacheService()
    return _cache_service_instance


# 모듈 레벨 인스턴스 생성
cache_service = get_cache_service()
