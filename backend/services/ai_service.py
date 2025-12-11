# services/ai_service.py
"""
AI 서비스 - GeminiClient를 사용한 프로토타입 생성

이 서비스는 GeminiClient를 통해 Gemini REST API를 호출하여
4단계 프로토타입 생성을 수행합니다.
"""

import logging
from typing import Dict, Any, Optional, Callable, Awaitable

from utils.prompt_templates import (
    SYSTEM_PROMPT,
    get_step_1_prompt,
    get_step_2_prompt,
    get_step_3_prompt,
    get_step_4_prompt,
)
from services.gemini_client import get_gemini_client, GeminiClientError

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class AIServiceError(Exception):
    """AI 서비스 오류"""
    def __init__(self, error_type: str, message: str, raw_output: Optional[str] = None):
        super().__init__(message)
        self.error_type = error_type
        self.message = message
        self.raw_output = raw_output


class AIService:
    """
    GeminiClient를 사용한 AI 서비스
    
    4단계 프로토타입 생성을 위한 고수준 API 제공
    """
    
    def __init__(self):
        self.client = get_gemini_client()
        logger.info(f"AI Service initialized with GeminiClient: {self.client.model_name}")
    
    async def generate_prototype(
        self, 
        menu_name: str,
        screen_name: str,
        wizard_data: Optional[Dict[str, Any]] = None,
        progress_callback: Optional[Callable[[int, str], Awaitable[None]]] = None
    ) -> Dict[str, str]:
        """
        Wizard 기반 4단계 순차적 코드 생성 (진행률 콜백 포함)
        
        Args:
            menu_name: 메뉴명
            screen_name: 화면명
            wizard_data: 위자드 데이터 (step1~step4)
            progress_callback: 진행률 콜백 async (percent, message) -> None
            
        Returns:
            {"prototype_html": str, "final_prompt": str, "full_prompt": str}
            
        Raises:
            AIServiceError: 생성 실패 시
        """
        logger.info(f"🚀 Starting 4-Stage Generation for: {menu_name}/{screen_name}")
        
        if not wizard_data:
            raise AIServiceError("missing_wizard_data", "Wizard data required.")
        
        # 전체 프롬프트 조합
        try:
            # Step 1~4 프롬프트를 하나로 합침
            step1_prompt = get_step_1_prompt(wizard_data)
            step2_prompt = get_step_2_prompt(wizard_data)
            step3_prompt = get_step_3_prompt(wizard_data)
            step4_prompt = get_step_4_prompt(wizard_data)
            
            # 전체 프롬프트 생성
            full_prompt = f"""
# {menu_name} - {screen_name}

{step1_prompt}

{step2_prompt}

{step3_prompt}

{step4_prompt}
"""
        except Exception as e:
            raise AIServiceError("prompt_error", f"프롬프트 템플릿 생성 실패: {e}")
        
        # 진행률 콜백 래핑 (GeminiClient 시그니처에 맞게)
        async def wrapped_progress_callback(message: str, current: int, total: int):
            if progress_callback:
                percent = int((current / total) * 100)
                await progress_callback(percent, message)
        
        try:
            # GeminiClient의 generate_prototype 호출
            result = await self.client.generate_prototype(
                full_prompt=full_prompt,
                system_prompt=SYSTEM_PROMPT,
                progress_callback=wrapped_progress_callback
            )
            
            # 결과 형식 변환
            return {
                "prototype_html": result.get("code", ""),
                "final_prompt": full_prompt[:500] + "...",  # 요약
                "full_prompt": full_prompt
            }
            
        except GeminiClientError as e:
            logger.error(f"❌ Prototype generation failed: {e.error_type}: {e.message}")
            raise AIServiceError(e.error_type, e.message, e.raw_output)
        except Exception as e:
            logger.error(f"❌ Unexpected error: {type(e).__name__}: {e}")
            raise AIServiceError("unknown_error", str(e))


# 싱글톤 인스턴스
_ai_service_instance: Optional[AIService] = None


def get_ai_service() -> AIService:
    """AI 서비스 싱글톤 인스턴스 반환"""
    global _ai_service_instance
    if _ai_service_instance is None:
        _ai_service_instance = AIService()
    return _ai_service_instance
