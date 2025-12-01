# services/ai_service.py

import os
import logging
import ssl
import asyncio
import re
from typing import Dict, Any, Optional, Callable, Awaitable
from datetime import timedelta
import google.generativeai as genai
from google.api_core import exceptions as google_exceptions

from utils.prompt_templates import (
    SYSTEM_PROMPT,
    get_step_1_prompt,
    get_step_2_prompt,
    get_step_3_prompt,
    get_step_4_prompt,
)
from services.cache_service import get_cache_service

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============================================================================
# SSL 인증서 검증 완전 우회 설정 (개발 환경용)
# ============================================================================
os.environ['GRPC_VERBOSITY'] = 'NONE'
os.environ['GRPC_TRACE'] = ''
os.environ['GRPC_ENABLE_FORK_SUPPORT'] = '1'
os.environ['GRPC_SSL_CIPHER_SUITES'] = 'HIGH+ECDSA'
os.environ['GRPC_DEFAULT_SSL_ROOTS_FILE_PATH'] = ''
os.environ['SSL_CERT_FILE'] = ''
os.environ['REQUESTS_CA_BUNDLE'] = ''
os.environ['CURL_CA_BUNDLE'] = ''
os.environ['PYTHONHTTPSVERIFY'] = '0'
ssl._create_default_https_context = ssl._create_unverified_context

try:
    import warnings
    warnings.filterwarnings('ignore', category=DeprecationWarning)
    grpc_logger = logging.getLogger('grpc')
    grpc_logger.setLevel(logging.CRITICAL)
    grpc_logger.addHandler(logging.NullHandler())
    grpc_logger.propagate = False
except Exception:
    pass
# ============================================================================

# Context Caching 최소 토큰 요구사항 (Gemini 1.5 Pro 기준: 32,768 토큰)
# 대략 4자 = 1토큰으로 계산하면 약 130,000자 이상 필요
# 하지만 실제로는 더 적은 양으로도 시도 가능 (API가 거부하면 fallback)
MIN_TOKENS_FOR_CACHING = 32768
MIN_CHARS_FOR_CACHING = MIN_TOKENS_FOR_CACHING * 4  # ~130,000자

class AIServiceError(Exception):
    """Structured exception for AI service failures."""
    def __init__(self, error_type: str, message: str, raw_output: Optional[str] = None):
        super().__init__(message)
        self.error_type = error_type
        self.message = message
        self.raw_output = raw_output


class AIService:
    """Google AI Studio (Gemini) API를 사용한 AI 서비스 with Context Caching & ChatSession"""
    
    def __init__(self):
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_API_KEY 환경 변수가 설정되지 않았습니다")
        
        genai.configure(api_key=api_key)
        
        self.model_name = os.getenv("GEMINI_MODEL", "gemini-1.5-pro")
        if self.model_name.endswith("-latest"):
            self.model_name = self.model_name[:-7]
            
        self.model = genai.GenerativeModel(self.model_name)
        self.cache_service = get_cache_service()
        
        # 설정값
        self.max_continuation_attempts = 3
        self.max_quota_retries = 10
        self.retry_delay_seconds = 60
        self.cache_ttl_hours = 1  # Context Cache TTL (1시간)
        self.caching_enabled = self._check_caching_feasibility()
        
        logger.info(f"AI Service initialized: {self.model_name}")
        logger.info(f"Context Caching: {'Enabled' if self.caching_enabled else 'Disabled'} (SYSTEM_PROMPT: {len(SYSTEM_PROMPT)} chars)")
    
    def _check_caching_feasibility(self) -> bool:
        """Context Caching 가능 여부 확인 (최소 토큰 요구사항)"""
        prompt_length = len(SYSTEM_PROMPT)
        # Gemini Context Caching은 최소 32,768 토큰 필요
        # 현재 SYSTEM_PROMPT가 이보다 작으면 일반 ChatSession 사용
        if prompt_length < 600:  # 너무 작은 경우 비활성화
            logger.info(f"⚠️ SYSTEM_PROMPT too short for caching ({prompt_length} chars)")
            return False
        return True

    # -------------------------------------------------------------------------
    # Context Caching 헬퍼
    # -------------------------------------------------------------------------
    def _create_context_cache(self) -> Optional[str]:
        """
        Google Gemini Context Cache 생성 및 Redis에 저장
        
        Returns:
            str: 캐시 ID (성공 시) 또는 None (실패 시)
        """
        try:
            logger.info("🔄 Creating new Gemini Context Cache...")
            
            # Context Cache 생성 (SYSTEM_PROMPT를 캐싱)
            cached_content = genai.caching.CachedContent.create(
                model=f"models/{self.model_name}",
                display_name="forgeflow-system-prompt",
                contents=[
                    {
                        "role": "user",
                        "parts": [{"text": SYSTEM_PROMPT}]
                    },
                    {
                        "role": "model", 
                        "parts": [{"text": "시스템 프롬프트를 이해했습니다. React 프로토타입 생성을 시작할 준비가 되었습니다."}]
                    }
                ],
                ttl=timedelta(hours=self.cache_ttl_hours)
            )
            
            cache_id = cached_content.name
            logger.info(f"✅ Context Cache created: {cache_id}")
            
            # Redis에 캐시 ID 저장
            if self.cache_service.is_available():
                self.cache_service.set_cached_context(
                    system_prompt=SYSTEM_PROMPT,
                    cache_id=cache_id,
                    ttl_hours=self.cache_ttl_hours
                )
            
            return cache_id
            
        except google_exceptions.InvalidArgument as e:
            # 토큰 수가 부족한 경우 (최소 32,768 토큰 필요)
            logger.warning(f"⚠️ Context Cache creation failed (token count too low): {e}")
            return None
        except Exception as e:
            logger.error(f"❌ Context Cache creation failed: {e}")
            return None

    def _get_or_create_cached_model(self):
        """
        캐시된 모델 가져오기 또는 새로 생성
        
        Returns:
            tuple: (model, is_cached)
        """
        if not self.caching_enabled:
            return self.model, False
        
        # 1. Redis에서 기존 캐시 조회
        cached_context = self.cache_service.get_cached_context(SYSTEM_PROMPT)
        
        if cached_context:
            try:
                logger.info(f"✨ Using existing Context Cache: {cached_context['cache_id']}")
                cached_content = genai.caching.CachedContent.get(cached_context['cache_id'])
                model_with_cache = genai.GenerativeModel.from_cached_content(cached_content)
                return model_with_cache, True
            except Exception as e:
                logger.warning(f"⚠️ Failed to load cached content: {e}. Creating new cache...")
                # 캐시가 만료되었거나 유효하지 않음 - Redis에서 삭제
                self.cache_service.invalidate_cache(SYSTEM_PROMPT)
        
        # 2. 새 캐시 생성 시도
        cache_id = self._create_context_cache()
        
        if cache_id:
            try:
                cached_content = genai.caching.CachedContent.get(cache_id)
                model_with_cache = genai.GenerativeModel.from_cached_content(cached_content)
                return model_with_cache, True
            except Exception as e:
                logger.error(f"❌ Failed to use new cache: {e}")
        
        # 3. 캐싱 실패 시 일반 모델 반환
        logger.info("📝 Using standard model (no caching)")
        return self.model, False

    # -------------------------------------------------------------------------
    # 1. Chat 전송 헬퍼 (ChatSession 기반)
    # -------------------------------------------------------------------------
    async def _send_chat_with_retry(self, chat_session, prompt, operation_name="Chat"):
        """ChatSession 메시지 전송 및 할당량 재시도 처리"""
        
        # 코드 생성에 최적화된 설정 (온도 0.2)
        generation_config = {
            "temperature": 0.2,
            "max_output_tokens": 8192,
            "top_p": 0.95,
            "top_k": 40,
        }

        for attempt in range(self.max_quota_retries + 1):
            try:
                response = await chat_session.send_message_async(
                    prompt,
                    generation_config=generation_config
                )
                return response
            except google_exceptions.ResourceExhausted:
                if attempt < self.max_quota_retries:
                    wait_time = self.retry_delay_seconds
                    logger.warning(f"⏳ [{operation_name}] Quota exceeded. Retrying in {wait_time}s...")
                    await asyncio.sleep(wait_time)
                else:
                    raise AIServiceError("quota_exceeded", f"Quota exceeded after {self.max_quota_retries} retries.")
            except Exception as e:
                logger.error(f"❌ [{operation_name}] Failed: {e}")
                raise e
        raise AIServiceError("unknown_error", "Unexpected error in chat retry")

    # -------------------------------------------------------------------------
    # 2. 단계별 이어받기 헬퍼 (Continuation)
    # -------------------------------------------------------------------------
    async def _handle_step_continuation(self, chat_session, initial_response, step_name):
        """각 단계 내에서 토큰이 잘렸을 때 문맥을 유지하며 이어받기"""
        full_text = initial_response.text
        
        if not initial_response.candidates:
             return full_text

        finish_reason = initial_response.candidates[0].finish_reason
        
        attempt = 0
        # 2 = MAX_TOKENS
        while finish_reason == 2 and attempt < self.max_continuation_attempts:
            attempt += 1
            logger.warning(f"⚠️ {step_name} truncated (MAX_TOKENS). Continuation #{attempt}...")
            
            # 문맥 유지를 위해 마지막 줄을 포함하여 요청
            last_chars = full_text.strip()[-100:]
            continuation_prompt = (
                f"⚠️ SYSTEM: Previous response was truncated. "
                f"CONTINUE generating the code exactly from where it stopped:\n"
                f"...{last_chars}\n"
                f"(Do NOT repeat the context above. Just output the rest of the code.)"
            )
            
            response = await self._send_chat_with_retry(
                chat_session, 
                continuation_prompt, 
                operation_name=f"{step_name} Continuation #{attempt}"
            )
            
            part_text = response.text
            
            # 마크다운 블록 제거
            if part_text.strip().startswith("```"):
                lines = part_text.strip().split('\n')
                if len(lines) > 0 and (lines[0].startswith("```") or "jsx" in lines[0] or "javascript" in lines[0]):
                     part_text = '\n'.join(lines[1:])
            if part_text.strip().endswith("```"):
                part_text = part_text.strip()[:-3]
            
            full_text += part_text
            
            if response.candidates:
                finish_reason = response.candidates[0].finish_reason
            else:
                break
            
        if finish_reason == 2:
            logger.error(f"❌ {step_name} still truncated after max attempts.")
            
        return full_text

    # -------------------------------------------------------------------------
    # 3. 메인 생성 함수 (4단계 순차 실행 + 진행률 콜백)
    # -------------------------------------------------------------------------
    async def generate_prototype(
        self, 
        menu_name: str,
        screen_name: str,
        wizard_data: Optional[Dict[str, Any]] = None,
        progress_callback: Optional[Callable[[int, str], Awaitable[None]]] = None
    ) -> Dict[str, str]:
        """Wizard 기반 4단계 순차적 코드 생성 (진행률 콜백 포함)"""
        logger.info(f"🚀 Starting 4-Stage Generation for: {menu_name}/{screen_name}")
        
        if not wizard_data:
            raise AIServiceError("missing_wizard_data", "Wizard data required.")

        # 1. ChatSession 초기화 (Context Caching 적용)
        chat_session = None
        is_cached = False
        
        try:
            # 캐시된 모델 또는 일반 모델 가져오기
            model, is_cached = self._get_or_create_cached_model()
            
            if is_cached:
                # 캐시된 모델 사용 - SYSTEM_PROMPT가 이미 포함됨
                logger.info("✨ Starting chat with CACHED context")
                chat_session = model.start_chat()
            else:
                # 일반 모델 사용 - SYSTEM_PROMPT를 history에 포함
                logger.info("📝 Starting chat with fresh context")
                chat_session = model.start_chat(history=[
                    {"role": "user", "parts": [SYSTEM_PROMPT, "프로젝트를 시작합니다."]},
                    {"role": "model", "parts": ["네, 준비되었습니다. React 프로토타입 생성을 시작하겠습니다."]}
                ])
        except Exception as e:
            logger.error(f"❌ Chat setup failed: {e}")
            # 폴백: 기본 모델로 시작
            chat_session = self.model.start_chat(history=[
                {"role": "user", "parts": [SYSTEM_PROMPT, "Start."]},
                {"role": "model", "parts": ["Ready."]}
            ])

        # 2. 4단계 프롬프트 준비
        try:
            steps = [
                ("Step 1 (Utils)", get_step_1_prompt(wizard_data), 40, "기초 설정 및 유틸리티 정의 중..."),
                ("Step 2 (State)", get_step_2_prompt(wizard_data), 55, "상태 관리 및 비즈니스 로직 구현 중..."),
                ("Step 3 (UI)", get_step_3_prompt(wizard_data), 75, "메인 화면 UI 렌더링 중..."),
                ("Step 4 (Modals)", get_step_4_prompt(wizard_data), 90, "모달 팝업 및 최종 완성 중...")
            ]
        except Exception as e:
            raise AIServiceError("prompt_error", f"프롬프트 템플릿 생성 실패: {e}")

        full_prompt_log = f"=== [SYSTEM PROMPT] ===\n{SYSTEM_PROMPT}\n\n"

        # 3. 순차적 실행
        generated_code_chunks = []
        
        for i, (step_name, step_prompt, progress_percent, user_message) in enumerate(steps):
            logger.info(f"🔄 Processing {step_name}...")
            
            full_prompt_log += f"=== [{step_name}] ===\n{step_prompt}\n\n"

            if progress_callback:
                try:
                    await progress_callback(progress_percent, user_message)
                except Exception as e:
                    logger.warning(f"⚠️ Progress callback failed: {e}")

            response = await self._send_chat_with_retry(chat_session, step_prompt, operation_name=step_name)
            
            full_step_text = await self._handle_step_continuation(chat_session, response, step_name)
            
            # 마크다운 정제
            cleaned_text = full_step_text.strip()
            if cleaned_text.startswith("```"):
                lines = cleaned_text.split('\n')
                if len(lines) > 0 and (lines[0].startswith("```") or "jsx" in lines[0] or "javascript" in lines[0]):
                     cleaned_text = '\n'.join(lines[1:])
            if cleaned_text.endswith("```"):
                cleaned_text = cleaned_text[:-3]
            
            generated_code_chunks.append(cleaned_text.strip())
            logger.info(f"✅ {step_name} Completed. Length: {len(cleaned_text)}")

        # 4. 결과 병합 및 후처리
        final_code = "\n\n".join(generated_code_chunks)
        
        # 중복 Hook 선언 제거
        hook_declarations = re.findall(r"const\s*{\s*useState.*}\s*=\s*React;", final_code)
        if len(hook_declarations) > 1:
            logger.warning(f"Found {len(hook_declarations)} duplicate hook declarations. Cleaning up...")
            first_declaration = hook_declarations[0]
            final_code = final_code.replace(first_declaration, "__HOOK_PLACEHOLDER__")
            for decl in hook_declarations:
                final_code = final_code.replace(decl, "")
            final_code = final_code.replace("__HOOK_PLACEHOLDER__", first_declaration)

        # Sanity Check
        if "export default function" not in final_code:
            logger.warning("⚠️ Final code might be incomplete (missing export default)")

        return {
            "prototype_html": final_code,
            "final_prompt": "4-Step Chat Process",
            "full_prompt": full_prompt_log
        }

# 싱글톤 인스턴스
_ai_service_instance: Optional[AIService] = None

def get_ai_service() -> AIService:
    """AI 서비스 싱글톤 인스턴스 반환"""
    global _ai_service_instance
    if _ai_service_instance is None:
        _ai_service_instance = AIService()
    return _ai_service_instance