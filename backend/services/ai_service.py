# services/ai_service.py

import os
import logging
import ssl
import asyncio
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
    # gRPC 내부 로거 비활성화
    grpc_logger = logging.getLogger('grpc')
    grpc_logger.setLevel(logging.CRITICAL)
    grpc_logger.addHandler(logging.NullHandler())
    grpc_logger.propagate = False
except Exception:
    pass
# ============================================================================


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
        self.caching_enabled = self._check_caching_feasibility()
        
        logger.info(f"AI Service initialized: {self.model_name}")
        logger.info(f"Caching: {'Enabled' if self.caching_enabled else 'Disabled'}")
    
    def _check_caching_feasibility(self) -> bool:
        prompt_length = len(SYSTEM_PROMPT)
        if prompt_length < 600:
            return False
        return True

    # -------------------------------------------------------------------------
    # 1. Chat 전송 헬퍼 (기존 _call_api_with_retry 대체)
    # -------------------------------------------------------------------------
    async def _send_chat_with_retry(self, chat_session, prompt, operation_name="Chat"):
        """ChatSession 메시지 전송 및 할당량 재시도 처리"""

        # 코드 생성에 최적화된 설정 (온도 0.2) - Gemini API 권장값
        generation_config = {
            "temperature": 0.2,        # 창의성 낮춤 -> 지시 준수 및 일관성 향상
            "max_output_tokens": 8192, # 최대 토큰 사용
            "top_p": 0.95,             # (선택) 일반적인 코드 생성 권장값
            "top_k": 40,               # (선택) 일반적인 코드 생성 권장값
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
    # 2. 단계별 이어받기 헬퍼 (기존 _continue_generation 대체)
    # -------------------------------------------------------------------------
    async def _handle_step_continuation(self, chat_session, initial_response, step_name):
        """각 단계 내에서 토큰이 잘렸을 때 문맥을 유지하며 이어받기"""
        full_text = initial_response.text
        
        if not initial_response.candidates:
             return full_text # 후보가 없으면 그대로 반환

        finish_reason = initial_response.candidates[0].finish_reason
        
        attempt = 0
        # 2 = MAX_TOKENS
        while finish_reason == 2 and attempt < self.max_continuation_attempts:
            attempt += 1
            logger.warning(f"⚠️ {step_name} truncated (MAX_TOKENS). Continuation #{attempt}...")
            
            # 문맥 유지를 위해 마지막 100자를 포함하여 요청
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
            
            # 마크다운 블록(```) 제거 로직
            if part_text.strip().startswith("```"):
                lines = part_text.strip().split('\n')
                # 첫 줄이 언어 선언일 수 있으므로 제거하고 합침
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
        # prompt: str, # Legacy 제거
        menu_name: str,
        screen_name: str,
        wizard_data: Optional[Dict[str, Any]] = None,
        progress_callback: Optional[Callable[[int, str], Awaitable[None]]] = None
    ) -> Dict[str, str]:
        """Wizard 기반 4단계 순차적 코드 생성 (진행률 콜백 포함)"""
        logger.info(f"🚀 Starting 4-Stage Generation for: {menu_name}/{screen_name}")
        
        if not wizard_data:
            raise AIServiceError("missing_wizard_data", "Wizard data required.")

        # 1. ChatSession 초기화
        chat_session = None
        cached_context = None
        
        if self.caching_enabled:
            cached_context = self.cache_service.get_cached_context(SYSTEM_PROMPT)

        try:
            if cached_context:
                logger.info(f"✨ Using CACHED context: {cached_context['cache_id']}")
                cached_content = genai.caching.CachedContent(name=cached_context['cache_id'])
                model_with_cache = genai.GenerativeModel.from_cached_content(cached_content)
                chat_session = model_with_cache.start_chat()
            else:
                logger.info("🆕 No cache found. Starting fresh chat.")
                chat_session = self.model.start_chat(history=[
                    {"role": "user", "parts": [SYSTEM_PROMPT, "Start project."]},
                    {"role": "model", "parts": ["Ready."]}
                ])
        except Exception as e:
            logger.error(f"❌ Chat setup failed: {e}")
            # 최후의 수단: 일반 모델로 시작
            chat_session = self.model.start_chat(history=[
                 {"role": "user", "parts": [SYSTEM_PROMPT, "Start."]},
                 {"role": "model", "parts": ["OK."]}
            ])

        # 2. 4단계 프롬프트 준비 (진행률 및 메시지 정의)
        try:
            steps = [
                # (Step 이름, 프롬프트 함수, 진행률(%), 사용자 표시 메시지)
                ("Step 1 (Utils)", get_step_1_prompt(wizard_data), 40, "기초 설정 및 유틸리티 정의 중..."),
                ("Step 2 (State)", get_step_2_prompt(wizard_data), 55, "상태 관리 및 비즈니스 로직 구현 중..."),
                ("Step 3 (UI)", get_step_3_prompt(wizard_data), 75, "메인 화면 UI 렌더링 중..."),
                ("Step 4 (Modals)", get_step_4_prompt(wizard_data), 90, "모달 팝업 및 최종 완성 중...")
            ]
        except Exception as e:
            raise AIServiceError("prompt_error", f"프롬프트 템플릿 생성 실패: {e}")

        # 프롬프트 로그 누적 변수 초기화
        full_prompt_log = f"=== [SYSTEM PROMPT] ===\n{SYSTEM_PROMPT}\n\n"

        # 3. 순차적 실행
        generated_code_chunks = []
        
        for i, (step_name, step_prompt, progress_percent, user_message) in enumerate(steps):
            logger.info(f"🔄 Processing {step_name}...")

            # 현재 단계의 프롬프트를 로그에 누적
            full_prompt_log += f"=== [{step_name}] ===\n{step_prompt}\n\n"

            # 🔥 진행률 업데이트 (콜백 호출)
            if progress_callback:
                try:
                    await progress_callback(progress_percent, user_message)
                except Exception as e:
                    logger.warning(f"⚠️ Progress callback failed: {e}")

            # 메시지 전송
            response = await self._send_chat_with_retry(chat_session, step_prompt, operation_name=step_name)
            
            # 결과 처리 (Continuation 포함)
            full_step_text = await self._handle_step_continuation(chat_session, response, step_name)
            
            # 마크다운 제거 및 정제
            cleaned_text = full_step_text.strip()
            if cleaned_text.startswith("```"):
                lines = cleaned_text.split('\n')
                # 첫 줄이 언어 선언(jsx, javascript)일 수 있으므로 제거
                if len(lines) > 0 and (lines[0].startswith("```jsx") or lines[0].startswith("```javascript") or lines[0].strip() == "```"):
                     cleaned_text = '\n'.join(lines[1:])
                else:
                     cleaned_text = '\n'.join(lines[1:]) # 안전하게 첫줄 제거
            if cleaned_text.endswith("```"):
                cleaned_text = cleaned_text[:-3]
            
            generated_code_chunks.append(cleaned_text.strip())
            logger.info(f"✅ {step_name} Completed. Length: {len(cleaned_text)}")

        # 4. 결과 병합 및 후처리
        final_code = "\n\n".join(generated_code_chunks)
        
        # 후처리: 중복된 React Hook 선언 제거
        import re
        hook_declarations = re.findall(r"const\s*{\s*useState.*}\s*=\s*React;", final_code)
        if len(hook_declarations) > 1:
            logger.warning(f"Found {len(hook_declarations)} duplicate hook declarations. Cleaning up...")
            # 첫 번째 선언만 남기고 나머지는 모두 제거
            first_declaration = hook_declarations[0]
            # 모든 선언을 임시 플레이스홀더로 변경
            final_code = final_code.replace(first_declaration, "__HOOK_DECLARATION_PLACEHOLDER__")
            # 나머지 중복 선언들을 제거
            for declaration in hook_declarations:
                final_code = final_code.replace(declaration, "")
            # 플레이스홀더를 다시 원본 선언으로 복원
            final_code = final_code.replace("__HOOK_DECLARATION_PLACEHOLDER__", first_declaration)
            logger.info("✅ Cleanup complete. Only one hook declaration remains.")

        # Sanity Check
        if "export default function" not in final_code:
            logger.warning("⚠️ Final code might be incomplete (missing export default)")

        return {
            "prototype_html": final_code,
            "final_prompt": "4-Step Chat Process",
            "full_prompt": full_prompt_log         # 누적된 전체 프롬프트 반환
        }

# 싱글톤 인스턴스
_ai_service_instance: Optional[AIService] = None

def get_ai_service() -> AIService:
    """AI 서비스 싱글톤 인스턴스 반환"""
    global _ai_service_instance
    if _ai_service_instance is None:
        _ai_service_instance = AIService()
    return _ai_service_instance