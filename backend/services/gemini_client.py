# services/gemini_client.py
"""
Gemini API 클라이언트 - LangChain 호환 인터페이스 + 직접 REST API

이 파일은 두 가지 접근 방식을 결합합니다:
1. LangChain 호환 인터페이스 (Message, Memory 등)
2. 직접 REST API 호출 (SSL 우회 - requests with verify=False)

LangChain SDK를 직접 사용할 수 없는 이유:
- 자체 서명 인증서 환경에서 SSL 검증 우회가 불가능
- google-generativeai SDK 내부 HTTP 클라이언트는 verify=False 지원 안 함

해결 방법:
- LangChain의 추상화 (Message, Memory 등)를 사용하되
- 실제 API 호출은 requests 라이브러리 직접 사용 (verify=False)

필요한 패키지:
pip install langchain langchain-core requests

환경 변수:
- GOOGLE_API_KEY: Google AI Studio API 키
- GEMINI_MODEL: 모델명 (기본값: gemini-2.5-flash)
"""

import os
import logging
import asyncio
import warnings
import re
import time
import requests
from typing import Dict, Any, Optional, List, Callable, Awaitable, Tuple

# SSL 경고 비활성화
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
warnings.filterwarnings('ignore', category=DeprecationWarning)

logger = logging.getLogger(__name__)

# =============================================================================
# LangChain 임포트 (인터페이스 및 메모리 관리용)
# =============================================================================
# [LangChain 사용] 메시지 타입 - 표준화된 메시지 인터페이스
from langchain_core.messages import (
    HumanMessage, 
    AIMessage, 
    SystemMessage, 
    BaseMessage
)
# [LangChain 사용] 대화 메모리 - 최신 방식 (ChatMessageHistory)
from langchain_core.chat_history import InMemoryChatMessageHistory
# [LangChain 사용] 콜백 핸들러 - 진행률 추적
from langchain_core.callbacks import BaseCallbackHandler

# =============================================================================
# [미사용] 아래는 SSL 문제로 직접 사용할 수 없음
# from langchain_google_genai import ChatGoogleGenerativeAI
# llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", transport="rest")
# → SSLError: certificate verify failed
# =============================================================================


class GeminiClientError(Exception):
    """Gemini API 오류"""
    def __init__(self, error_type: str, message: str, status_code: int = 0, raw_output: Optional[str] = None):
        super().__init__(message)
        self.error_type = error_type
        self.message = message
        self.status_code = status_code
        self.raw_output = raw_output


# =============================================================================
# LangChain 콜백 핸들러 (진행률 추적용)
# =============================================================================
class ProgressCallbackHandler(BaseCallbackHandler):
    """
    LangChain 콜백 핸들러 - 진행률 추적
    
    [LangChain 방식]
    - on_llm_start, on_llm_end 등 이벤트 콜백
    - BaseCallbackHandler 상속
    
    [기존 REST API 방식]
    - 직접 progress_callback 함수 호출
    - if progress_callback: await progress_callback(step, message)
    """
    
    def __init__(self, progress_callback: Optional[Callable] = None):
        self.progress_callback = progress_callback
        self.current_step = 0
    
    def on_llm_start(self, serialized: Dict[str, Any], prompts: List[str], **kwargs):
        """LLM 호출 시작 시"""
        logger.info(f"🔄 LangChain LLM Start: {len(prompts)} prompts")
    
    def on_llm_end(self, response, **kwargs):
        """LLM 호출 완료 시"""
        logger.info(f"✅ LangChain LLM End")
    
    def on_llm_error(self, error: Exception, **kwargs):
        """LLM 오류 발생 시"""
        logger.error(f"❌ LangChain LLM Error: {error}")


# =============================================================================
# LangChain 호환 ChatSession
# =============================================================================
class ChatSession:
    """
    LangChain 호환 ChatSession
    
    [LangChain 방식 - 인터페이스]
    - HumanMessage, AIMessage 타입 사용
    - ConversationBufferMemory로 히스토리 관리
    
    [REST API 방식 - 실제 호출]
    - requests.post(url, json=payload, verify=False)
    - Google Generative AI REST API 직접 호출
    """
    
    def __init__(self, client: 'GeminiClient', system_prompt: Optional[str] = None):
        self.client = client
        self.system_prompt = system_prompt
        
        # [LangChain] InMemoryChatMessageHistory 사용 (최신 방식)
        # 기존: ConversationBufferMemory (deprecated)
        # 변경: InMemoryChatMessageHistory - langchain_core.chat_history
        self.message_history = InMemoryChatMessageHistory()
        
        # [REST API용] 직접 관리하는 히스토리
        # Google API 형식: [{"role": "user/model", "parts": [{"text": "..."}]}]
        self._rest_history: List[Dict[str, Any]] = []
        
        # 시스템 프롬프트가 있으면 초기 컨텍스트로 추가
        if system_prompt:
            # [LangChain] 메시지 히스토리에 저장
            initial_input = system_prompt + "\n\n프로젝트를 시작합니다."
            initial_output = "네, 준비되었습니다. React 프로토타입 생성을 시작하겠습니다."
            self.message_history.add_user_message(initial_input)
            self.message_history.add_ai_message(initial_output)
            # [REST API] 히스토리에 추가
            self._rest_history.append({
                "role": "user",
                "parts": [{"text": system_prompt + "\n\n프로젝트를 시작합니다."}]
            })
            self._rest_history.append({
                "role": "model",
                "parts": [{"text": "네, 준비되었습니다. React 프로토타입 생성을 시작하겠습니다."}]
            })
    
    def send_message(
        self,
        prompt: str,
        temperature: float = 0.2,
        max_output_tokens: int = 8192
    ) -> Dict[str, Any]:
        """
        메시지 전송 (동기)
        
        [LangChain 인터페이스]
        - HumanMessage, AIMessage 객체 생성
        - ConversationBufferMemory에 저장
        
        [REST API 호출]
        - requests.post(url, json=payload, verify=False)
        """
        try:
            # [REST API] 사용자 메시지 추가
            self._rest_history.append({
                "role": "user",
                "parts": [{"text": prompt}]
            })
            
            # [REST API] 직접 호출
            response = self.client._call_api(
                contents=self._rest_history,
                temperature=temperature,
                max_output_tokens=max_output_tokens
            )
            
            text = response.get("text", "")
            finish_reason = response.get("finish_reason", 1)
            
            # [REST API] 응답 히스토리에 추가
            self._rest_history.append({
                "role": "model",
                "parts": [{"text": text}]
            })
            
            # [LangChain] 메시지 히스토리에 저장 (최신 방식)
            self.message_history.add_user_message(prompt)
            self.message_history.add_ai_message(text)
            
            is_truncated = finish_reason == 2
            
            return {
                "text": text,
                "finish_reason": finish_reason,
                "is_truncated": is_truncated
            }
            
        except Exception as e:
            logger.error(f"❌ ChatSession.send_message failed: {e}")
            raise GeminiClientError("api_error", str(e))
    
    async def send_message_async(
        self,
        prompt: str,
        temperature: float = 0.2,
        max_output_tokens: int = 8192
    ) -> Dict[str, Any]:
        """
        메시지 전송 (비동기)
        
        [비동기 처리]
        - asyncio.to_thread()로 동기 메서드 래핑
        
        [참고] LangChain SDK 직접 사용 시 ainvoke() 지원
        - response = await llm.ainvoke(messages)
        """
        return await asyncio.to_thread(
            self.send_message,
            prompt,
            temperature,
            max_output_tokens
        )
    
    def get_langchain_messages(self) -> List[BaseMessage]:
        """
        [LangChain] 메시지 히스토리에서 메시지 리스트 반환
        
        반환 형식:
        - List[HumanMessage | AIMessage]
        
        기존 방식: self.memory.load_memory_variables({}).get("chat_history", [])
        최신 방식: self.message_history.messages
        """
        return self.message_history.messages


# =============================================================================
# 메인 GeminiClient 클래스
# =============================================================================
class GeminiClient:
    """
    LangChain 호환 인터페이스 + REST API 직접 호출
    
    [LangChain 인터페이스]
    - Message 객체 (HumanMessage, AIMessage, SystemMessage)
    - ConversationBufferMemory
    - ProgressCallbackHandler
    
    [REST API 직접 호출]
    - requests.post(url, verify=False)
    - SSL 인증서 검증 우회
    
    [왜 이렇게 구현했나?]
    - LangChain SDK의 ChatGoogleGenerativeAI는 SSL 우회 옵션이 없음
    - google-generativeai 내부 HTTP 클라이언트는 verify=False 미지원
    - 자체 서명 인증서 환경에서 SSL 오류 발생
    - 해결: LangChain 인터페이스 + requests(verify=False) 조합
    """
    
    # Google Generative AI REST API 기본 URL
    BASE_URL = "https://generativelanguage.googleapis.com/v1beta"
    
    def __init__(self, api_key: Optional[str] = None, model_name: Optional[str] = None):
        self.api_key = api_key or os.getenv("GOOGLE_API_KEY")
        if not self.api_key:
            raise ValueError("GOOGLE_API_KEY 환경 변수가 설정되지 않았습니다")
        
        self.model_name = model_name or os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
        if self.model_name.endswith("-latest"):
            self.model_name = self.model_name[:-7]
        
        # 설정
        self.timeout = 180
        self.max_retries = 3
        self.retry_delay = 60
        self.max_quota_retries = 10
        self.max_continuation_attempts = 3
        
        logger.info(f"GeminiClient initialized: model={self.model_name}")
    
    # =========================================================================
    # REST API 직접 호출 (핵심 메서드)
    # =========================================================================
    
    def _build_url(self, endpoint: str) -> str:
        """API URL 생성"""
        return f"{self.BASE_URL}/models/{self.model_name}:{endpoint}?key={self.api_key}"
    
    def _call_api(
        self,
        contents: List[Dict[str, Any]],
        temperature: float = 0.2,
        max_output_tokens: int = 8192,
        top_p: float = 0.95,
        top_k: int = 40,
        timeout: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        REST API 직접 호출
        
        [요청 형식]
        POST https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent
        {
            "contents": [{"role": "user", "parts": [{"text": "..."}]}],
            "generationConfig": {...}
        }
        
        [SSL 우회]
        requests.post(..., verify=False)
        """
        url = self._build_url("generateContent")
        
        payload = {
            "contents": contents,
            "generationConfig": {
                "temperature": temperature,
                "maxOutputTokens": max_output_tokens,
                "topP": top_p,
                "topK": top_k
            }
        }
        
        try:
            response = requests.post(
                url,
                json=payload,
                timeout=timeout or self.timeout,
                verify=False  # SSL 인증서 검증 비활성화
            )
            
            if response.status_code == 429:
                raise GeminiClientError("quota_exceeded", "API 할당량 초과", 429)
            
            if response.status_code != 200:
                raise GeminiClientError(
                    "api_error",
                    f"API 오류: {response.status_code} - {response.text}",
                    response.status_code
                )
            
            data = response.json()
            
            # 응답 파싱
            candidates = data.get("candidates", [])
            if not candidates:
                raise GeminiClientError("empty_response", "빈 응답")
            
            candidate = candidates[0]
            content = candidate.get("content", {})
            parts = content.get("parts", [])
            
            text = ""
            for part in parts:
                if "text" in part:
                    text += part["text"]
            
            # finish_reason 확인
            finish_reason_str = candidate.get("finishReason", "STOP")
            finish_reason = 1  # STOP
            if finish_reason_str == "MAX_TOKENS":
                finish_reason = 2
            elif finish_reason_str == "SAFETY":
                finish_reason = 3
            
            return {
                "text": text,
                "finish_reason": finish_reason,
                "raw": data
            }
            
        except requests.exceptions.Timeout:
            raise GeminiClientError("timeout", "API 요청 시간 초과")
        except requests.exceptions.RequestException as e:
            raise GeminiClientError("network_error", f"네트워크 오류: {str(e)}")
    
    # =========================================================================
    # 기본 생성 메서드
    # =========================================================================
    
    def generate_content(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.2,
        max_output_tokens: int = 8192,
        top_p: float = 0.95,
        top_k: int = 40,
        timeout: Optional[int] = None
    ) -> str:
        """
        컨텐츠 생성 (동기)
        
        [LangChain 호환]
        - SystemMessage, HumanMessage 개념 지원
        
        [REST API 호출]
        - 내부적으로 _call_api() 사용
        """
        contents = []
        
        # 시스템 프롬프트가 있으면 첫 번째 user 메시지로 추가
        # (Google API는 별도 system role 미지원)
        if system_prompt:
            contents.append({
                "role": "user",
                "parts": [{"text": f"[System Instruction]\n{system_prompt}"}]
            })
            contents.append({
                "role": "model",
                "parts": [{"text": "지시사항을 이해했습니다. 요청에 따라 진행하겠습니다."}]
            })
        
        contents.append({
            "role": "user",
            "parts": [{"text": prompt}]
        })
        
        response = self._call_api(
            contents=contents,
            temperature=temperature,
            max_output_tokens=max_output_tokens,
            top_p=top_p,
            top_k=top_k,
            timeout=timeout
        )
        
        return response.get("text", "")
    
    async def generate_content_async(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.2,
        max_output_tokens: int = 8192,
        top_p: float = 0.95,
        top_k: int = 40,
        timeout: Optional[int] = None
    ) -> str:
        """
        컨텐츠 생성 (비동기)
        
        [비동기 처리]
        - asyncio.to_thread()로 동기 메서드 래핑
        """
        return await asyncio.to_thread(
            self.generate_content,
            prompt,
            system_prompt,
            temperature,
            max_output_tokens,
            top_p,
            top_k,
            timeout
        )
    
    # =========================================================================
    # ChatSession 관련
    # =========================================================================
    
    def start_chat(self, history: Optional[List[Dict[str, Any]]] = None) -> ChatSession:
        """새 ChatSession 시작"""
        return ChatSession(self)
    
    def start_chat_with_system_prompt(self, system_prompt: str) -> ChatSession:
        """시스템 프롬프트로 ChatSession 시작"""
        return ChatSession(self, system_prompt)
    
    # =========================================================================
    # 재시도 로직
    # =========================================================================
    
    async def send_chat_with_retry(
        self,
        chat_session: ChatSession,
        prompt: str,
        operation_name: str = "Chat",
        temperature: float = 0.2,
        max_output_tokens: int = 8192
    ) -> Dict[str, Any]:
        """
        ChatSession 메시지 전송 (할당량 재시도 포함)
        """
        for attempt in range(self.max_quota_retries):
            try:
                response = await chat_session.send_message_async(
                    prompt=prompt,
                    temperature=temperature,
                    max_output_tokens=max_output_tokens
                )
                return response
                
            except GeminiClientError as e:
                if e.error_type == "quota_exceeded":
                    if attempt < self.max_quota_retries - 1:
                        wait_time = self.retry_delay * (attempt + 1)
                        logger.warning(
                            f"⏳ {operation_name}: 할당량 초과, {wait_time}초 대기 "
                            f"(재시도 {attempt + 1}/{self.max_quota_retries})"
                        )
                        await asyncio.sleep(wait_time)
                        continue
                raise
            except Exception as e:
                if "429" in str(e) or "quota" in str(e).lower():
                    if attempt < self.max_quota_retries - 1:
                        wait_time = self.retry_delay * (attempt + 1)
                        logger.warning(f"⏳ {operation_name}: 재시도 대기 {wait_time}초")
                        await asyncio.sleep(wait_time)
                        continue
                raise
        
        raise GeminiClientError("quota_exceeded", f"{operation_name}: 최대 재시도 횟수 초과")
    
    # =========================================================================
    # 코드 연속 생성 (끊김 처리)
    # =========================================================================
    
    async def continue_truncated_code(
        self,
        chat_session: ChatSession,
        initial_response: Dict[str, Any],
        operation_name: str = "Code"
    ) -> str:
        """
        끊긴 코드 연속 생성
        
        응답이 MAX_TOKENS로 끊긴 경우 이어서 생성
        """
        result = initial_response.get("text", "")
        is_truncated = initial_response.get("is_truncated", False)
        
        for attempt in range(self.max_continuation_attempts):
            if not is_truncated:
                break
            
            logger.info(f"🔄 {operation_name}: 코드 연속 생성 {attempt + 1}/{self.max_continuation_attempts}")
            
            continuation_prompt = (
                "코드가 끊겼습니다. 이전 응답의 마지막 부분부터 이어서 "
                "남은 코드를 완성해주세요. 중복 없이 이어서 작성해주세요."
            )
            
            try:
                response = await self.send_chat_with_retry(
                    chat_session=chat_session,
                    prompt=continuation_prompt,
                    operation_name=f"{operation_name}-continuation",
                    max_output_tokens=8192
                )
                
                continuation_text = response.get("text", "")
                result += "\n" + continuation_text
                is_truncated = response.get("is_truncated", False)
                
            except Exception as e:
                logger.error(f"❌ 연속 생성 실패: {e}")
                break
        
        return result
    
    # =========================================================================
    # 프로토타입 생성 (4단계)
    # =========================================================================
    
    async def generate_prototype(
        self,
        full_prompt: str,
        system_prompt: str,
        progress_callback: Optional[Callable[[str, int, int], Awaitable[None]]] = None
    ) -> Dict[str, Any]:
        """
        프로토타입 생성 (4단계)
        
        1단계: 기본 구조 생성
        2단계: 기능 구현
        3단계: 스타일링
        4단계: 최적화 및 마무리
        """
        logger.info("🚀 프로토타입 생성 시작 (4단계)")
        
        # 콜백 핸들러 생성
        callback_handler = ProgressCallbackHandler(progress_callback)
        
        # ChatSession 시작
        chat_session = self.start_chat_with_system_prompt(system_prompt)
        
        generated_code = ""
        stage_prompts = self._create_stage_prompts(full_prompt)
        
        for stage, (stage_name, stage_prompt) in enumerate(stage_prompts, 1):
            logger.info(f"📋 Stage {stage}/4: {stage_name}")
            
            if progress_callback:
                await progress_callback(f"Stage {stage}/4: {stage_name}", stage, 4)
            
            try:
                response = await self.send_chat_with_retry(
                    chat_session=chat_session,
                    prompt=stage_prompt,
                    operation_name=f"Stage-{stage}",
                    temperature=0.2,
                    max_output_tokens=8192
                )
                
                # 끊김 처리
                if response.get("is_truncated"):
                    full_response = await self.continue_truncated_code(
                        chat_session=chat_session,
                        initial_response=response,
                        operation_name=f"Stage-{stage}"
                    )
                else:
                    full_response = response.get("text", "")
                
                # 코드 추출
                stage_code = self._extract_code_from_response(full_response)
                
                if stage_code:
                    generated_code = stage_code
                    logger.info(f"✅ Stage {stage} 완료: {len(stage_code)} chars")
                
            except Exception as e:
                logger.error(f"❌ Stage {stage} 실패: {e}")
                if stage == 1:
                    raise
                # Stage 1 이후 실패는 이전 결과 사용
                break
        
        if not generated_code:
            raise GeminiClientError("generation_failed", "프로토타입 생성 실패")
        
        # 최종 정리
        final_code = self._clean_generated_code(generated_code)
        
        return {
            "code": final_code,
            "language": "tsx",
            "stages_completed": min(len(stage_prompts), 4)
        }
    
    def _create_stage_prompts(self, full_prompt: str) -> List[Tuple[str, str]]:
        """4단계 프롬프트 생성"""
        return [
            ("기본 구조 생성", f"""
{full_prompt}

[Stage 1 - 기본 구조]
위 요구사항을 분석하고 기본 컴포넌트 구조를 생성해주세요.
- 메인 컴포넌트 구조
- 필요한 상태 정의
- 기본 레이아웃
"""),
            ("기능 구현", """
[Stage 2 - 기능 구현]
이전 단계의 구조를 기반으로 핵심 기능을 구현해주세요.
- 이벤트 핸들러
- 데이터 처리 로직
- 상태 관리 로직
완전한 코드를 제공해주세요.
"""),
            ("스타일링", """
[Stage 3 - 스타일링]
Tailwind CSS를 사용하여 스타일을 적용해주세요.
- 반응형 디자인
- 시각적 개선
- UX 최적화
완전한 코드를 제공해주세요.
"""),
            ("최적화 및 마무리", """
[Stage 4 - 최적화 및 마무리]
최종 코드를 완성해주세요.
- 코드 정리
- 주석 추가
- 에러 처리
- TypeScript 타입 완성

최종 완성된 전체 코드를 제공해주세요.
""")
        ]
    
    def _extract_code_from_response(self, response_text: str) -> str:
        """응답에서 코드 추출"""
        patterns = [
            r'```tsx\s*([\s\S]*?)```',
            r'```typescript\s*([\s\S]*?)```',
            r'```jsx\s*([\s\S]*?)```',
            r'```javascript\s*([\s\S]*?)```',
            r'```react\s*([\s\S]*?)```',
            r'```\s*([\s\S]*?)```',
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, response_text, re.IGNORECASE)
            if matches:
                # 가장 긴 코드 블록 선택
                return max(matches, key=len).strip()
        
        # 코드 블록이 없으면 전체 텍스트 반환
        return response_text.strip()
    
    def _clean_generated_code(self, code: str) -> str:
        """생성된 코드 정리"""
        # 마커 제거
        code = re.sub(r'\[Stage \d.*?\]', '', code)
        code = re.sub(r'// Stage \d.*?\n', '', code)
        
        # 중복 import 제거
        lines = code.split('\n')
        seen_imports = set()
        clean_lines = []
        
        for line in lines:
            if line.strip().startswith('import '):
                if line.strip() not in seen_imports:
                    seen_imports.add(line.strip())
                    clean_lines.append(line)
            else:
                clean_lines.append(line)
        
        return '\n'.join(clean_lines).strip()


# =============================================================================
# 싱글톤 인스턴스
# =============================================================================
_gemini_client: Optional[GeminiClient] = None


def get_gemini_client() -> GeminiClient:
    """GeminiClient 싱글톤 인스턴스 반환"""
    global _gemini_client
    if _gemini_client is None:
        _gemini_client = GeminiClient()
    return _gemini_client


def reset_gemini_client():
    """클라이언트 리셋 (테스트용)"""
    global _gemini_client
    _gemini_client = None
