# -*- coding: utf-8 -*-
"""
AI 생성 API 라우터
"""
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import Dict, Any
from sqlalchemy.exc import SQLAlchemyError
from fastapi import File, UploadFile, Form
from typing import List
import logging

from schemas.ai import (
    GenerateRequest,
    GenerateAckResponse,
    GenerateDocumentsRequest,
    GenerateDocumentsResponse,
    WizardPromptTestRequest,
    WizardPromptTestResponse,
    GenerationStatusResponse,
)
from services.ai_service import get_ai_service, AIService
from services.ai_service import AIServiceError
from services.document_service import DocumentService
from models.database import get_db, SessionLocal
from models.screen import Screen, GenerationStatus

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 라우터 생성
router = APIRouter(prefix="/api/ai", tags=["AI"])


async def _background_generate(screen_id: int, menu_name: str, screen_name: str, wizard_data: Dict[str, Any], ai_service: AIService):
    """Separate session for background generation to avoid session conflicts."""
    bg_db: Session = SessionLocal()
    try:
        screen = bg_db.query(Screen).filter(Screen.id == screen_id).first()
        if not screen:
            logger.error(f"[BG] Screen {screen_id} not found.")
            return

        # 시작 상태 업데이트
        screen.generation_status = GenerationStatus.GENERATING
        screen.generation_progress = 30
        screen.generation_message = "AI 생성 환경 초기화 중..."
        screen.generation_step = 2
        bg_db.commit()

        async def update_progress_callback(percent: int, message: str):
            try:
                s = bg_db.query(Screen).filter(Screen.id == screen_id).first()
                if s:
                    s.generation_progress = percent
                    s.generation_message = message
                    bg_db.commit()
            except SQLAlchemyError as e:
                logger.error(f"[BG] Progress update failed: {e}")
                bg_db.rollback()

        # 실제 생성 호출
        result = await ai_service.generate_prototype(
            menu_name=menu_name,
            screen_name=screen_name,
            wizard_data=wizard_data,
            progress_callback=update_progress_callback
        )

        screen = bg_db.query(Screen).filter(Screen.id == screen_id).first()
        if not screen:
            logger.error(f"[BG] Screen {screen_id} vanished post-generation.")
            return

        screen.generation_status = GenerationStatus.VALIDATING
        screen.generation_progress = 95
        screen.generation_message = "생성된 코드 저장 중..."
        screen.generation_step = 4
        bg_db.commit()

        screen.prototype_html = result.get("prototype_html", "")
        screen.prompt = result.get("full_prompt", "")
        screen.status = "in_review"

        screen.generation_status = GenerationStatus.COMPLETED
        screen.generation_progress = 100
        screen.generation_message = "프로토타입 생성 완료!"
        bg_db.commit()
        logger.info(f"[BG] Generation completed for screen {screen_id}")

    except AIServiceError as aie:
        logger.error(f"[BG] AIServiceError: {aie.message}")
        try:
            s = bg_db.query(Screen).filter(Screen.id == screen_id).first()
            if s:
                s.generation_status = GenerationStatus.FAILED
                s.generation_message = f"생성 실패: {aie.message[:160]}"
                bg_db.commit()
        except Exception:
            bg_db.rollback()
    except Exception as e:
        logger.error(f"[BG] Unexpected error: {e}")
        try:
            s = bg_db.query(Screen).filter(Screen.id == screen_id).first()
            if s:
                s.generation_status = GenerationStatus.FAILED
                s.generation_message = f"알 수 없는 오류: {str(e)[:160]}"
                bg_db.commit()
        except Exception:
            bg_db.rollback()
    finally:
        bg_db.close()


@router.post("/generate", response_model=GenerateAckResponse)
async def generate_prototype(
    request: GenerateRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    ai_service: AIService = Depends(get_ai_service)
):
    """프로토타입 생성 (비동기). Returns immediate ack; polling tracks progress."""
    try:
        screen = db.query(Screen).filter(Screen.id == request.screen_id).first()
        if not screen:
            raise HTTPException(status_code=404, detail="화면을 찾을 수 없습니다")

        # 상태/결과 초기화
        screen.generation_status = GenerationStatus.IDLE
        screen.generation_progress = 0
        screen.generation_message = "생성 요청 초기화 중..."
        screen.generation_step = 0
        screen.retry_count = 0
        screen.prototype_html = None
        screen.prompt = None
        screen.status = "draft"
        db.commit()

        # Wizard 저장 단계
        screen.generation_status = GenerationStatus.SAVING_WIZARD
        screen.generation_progress = 5
        screen.generation_message = "Wizard 데이터 저장 중..."
        screen.generation_step = 1
        db.commit()

        screen.wizard_data = request.wizard_data
        screen.generation_progress = 25
        screen.generation_message = "Wizard 데이터 저장 완료"
        db.commit()

        # 백그라운드 작업 등록
        background_tasks.add_task(
            _background_generate,
            screen_id=screen.id,
            menu_name=request.menu_name,
            screen_name=request.screen_name,
            wizard_data=request.wizard_data,
            ai_service=ai_service
        )

        return GenerateAckResponse(
            screen_id=screen.id,
            message="프로토타입 생성이 시작되었습니다. 상태는 폴링으로 확인하세요.",
            started=True,
            previous_prototype_cleared=True
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Generate endpoint error: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


# 설계서 생성
@router.post("/documents/designDoc")
async def generate_design_doc(
    screen_id: int = Form(...),
    screenshots: List[UploadFile] = File(default=[]),
    screenshot_labels: List[str] = Form(default=[]),
    db: Session = Depends(get_db)
):
    """
    [Step 2, 3 완료] 설계서(Word) 생성 및 다운로드
    """
    logger.info(f"📥 Design Doc Generation Start: Screen {screen_id}")
    
    # 1. DB 조회
    screen = db.query(Screen).filter(Screen.id == screen_id).first()
    if not screen:
        raise HTTPException(status_code=404, detail="Screen not found")
    
    # 필수 데이터 확인 (코드가 있어야 분석 가능)
    if not screen.prototype_html:
        raise HTTPException(status_code=400, detail="No generated code found. Please generate prototype first.")

    # 2. 이미지 처리
    processed_images = []
    for idx, file in enumerate(screenshots):
        content = await file.read()
        if content:
            label = screenshot_labels[idx] if idx < len(screenshot_labels) else f"Image {idx+1}"
            processed_images.append({"label": label, "bytes": content})
    
    logger.info(f"   📸 Images received: {len(processed_images)}")

    # 3. 문서 생성 서비스 호출
    doc_service = DocumentService()
    
    try:
        # 🔥 여기가 핵심: LLM 분석 + Word 생성
        docx_buffer = await doc_service.generate_design_doc(
            screen_name=screen.name,
            react_code=screen.prototype_html,
            wizard_data=screen.wizard_data,
            images=processed_images
        )

        # 🔥 2. [추가] 생성된 파일을 DB에 저장
        file_content = docx_buffer.getvalue() # 바이너리 데이터 추출
        screen.design_doc = file_content
        db.commit() # DB 저장 확정
        logger.info(f"💾 Design doc saved to DB ({len(file_content)} bytes)")

        # 3. 버퍼 포인터 초기화 (중요! 읽어버려서 끝에 가 있으므로 다시 처음으로)
        docx_buffer.seek(0)
        
        # 4. 파일명 인코딩 (한글 파일명 깨짐 방지)

        from urllib.parse import quote
        safe_filename = f"{screen.name}_화면설계서.docx"
        quoted_filename = quote(safe_filename)

        logger.info("✅ Document generated successfully. Sending response...")

        return StreamingResponse(
            docx_buffer,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={
                "Content-Disposition": f"attachment; filename*=UTF-8''{quoted_filename}"
            }
        )
        
    except Exception as e:
        logger.error(f"❌ Document generation failed: {e}")
        # 상세 에러 로깅
        import traceback
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"문서 생성 실패: {str(e)}")


@router.get("/health")
async def health_check(ai_service: AIService = Depends(get_ai_service)):
    """
    AI 서비스 헬스 체크
    
    **응답**:
    ```json
    {
      "status": "ok",
      "model": "gpt-4-turbo-preview"
    }
    ```
    """
    return {
        "status": "ok",
        "model": ai_service.model,
        "service": "AI Service"
    }


@router.get("/status/{screen_id}", response_model=GenerationStatusResponse)
async def get_generation_status(
    screen_id: int,
    db: Session = Depends(get_db)
):
    """
    AI 생성 진행 상황 조회 (폴링용)
    
    프론트엔드에서 2초마다 이 엔드포인트를 호출하여 진행 상황을 확인합니다.
    
    **상태 값**:
    - `idle`: 생성 전 또는 완료 후
    - `saving_wizard`: Wizard 데이터 저장 중
    - `requesting_ai`: AI API 요청 중
    - `waiting_quota`: 할당량 대기 중 (재시도)
    - `generating`: 코드 생성 중
    - `validating`: 검증 중
    - `completed`: 완료
    - `failed`: 실패
    
    **진행률**:
    - 0: 시작 전
    - 25: Wizard 저장 완료
    - 50: AI 요청 중
    - 75: 생성 중
    - 100: 완료
    """
    try:
        # 화면 조회
        screen = db.query(Screen).filter(Screen.id == screen_id).first()
        if not screen:
            raise HTTPException(status_code=404, detail=f"Screen {screen_id} not found")
        
        # 응답 생성
        return GenerationStatusResponse(
            screen_id=screen.id,
            generation_status=screen.generation_status.value if hasattr(screen.generation_status, 'value') else screen.generation_status,
            generation_progress=screen.generation_progress or 0,
            generation_message=screen.generation_message,
            generation_step=screen.generation_step or 0,
            retry_count=screen.retry_count or 0,
            has_prototype=bool(screen.prototype_html)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting generation status for screen {screen_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))



@router.put("/screens/{screen_id}/wizard-draft")
async def save_wizard_draft(
    screen_id: int,
    request: Dict,
    db: Session = Depends(get_db)
):
    """
    Wizard 작업 중 임시저장
    
    **기능**:
    - 프로토타입 생성 전에 Wizard 데이터를 임시저장
    - 나중에 다시 불러와서 이어서 작업 가능
    - wizard_data 컬럼에 JSON 형태로 저장
    
    **요청 예시**:
    ```json
    {
      "wizard_data": {
        "step1": { "screenName": "이상발생 접수", ... },
        "step2": { "selectedLayout": "search-grid", ... },
        "step3": { "components": [...] },
        "step4": { "interactions": [...] }
      }
    }
    ```
    """
    try:
        logger.info(f"💾 [Wizard Draft] Saving draft for screen_id: {screen_id}")
        
        # 1. Screen 존재 확인
        screen = db.query(Screen).filter(Screen.id == screen_id).first()
        if not screen:
            raise HTTPException(status_code=404, detail=f"Screen not found: {screen_id}")
        
        # 2. wizard_data 저장
        wizard_data = request.get("wizard_data")
        if not wizard_data:
            raise HTTPException(status_code=400, detail="wizard_data is required")
        
        screen.wizard_data = wizard_data
        db.commit()
        db.refresh(screen)
        
        logger.info(f"✅ [Wizard Draft] Saved successfully")
        logger.info(f"📊 Data size: {len(str(wizard_data))} chars")
        
        # Step 정보 로깅
        if "step1" in wizard_data:
            logger.info(f"📝 Step 1: {wizard_data['step1'].get('screenName', 'N/A')}")
        if "step2" in wizard_data:
            logger.info(f"🎨 Step 2: {wizard_data['step2'].get('selectedLayout', 'N/A')}")
        if "step3" in wizard_data:
            component_count = len(wizard_data['step3'].get('components', []))
            logger.info(f"🧩 Step 3: {component_count} components")
        if "step4" in wizard_data:
            interaction_count = len(wizard_data['step4'].get('interactions', []))
            logger.info(f"⚡ Step 4: {interaction_count} interactions")
        
        return {
            "success": True,
            "message": "Wizard 데이터가 임시저장되었습니다",
            "screen_id": screen_id,
            "saved_at": screen.updated_at.isoformat() if screen.updated_at else None,
            "data_size": len(str(wizard_data))
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error saving wizard draft: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/screens/{screen_id}/wizard-draft")
async def load_wizard_draft(
    screen_id: int,
    db: Session = Depends(get_db)
):
    """
    임시저장된 Wizard 데이터 불러오기
    
    **기능**:
    - 저장된 wizard_data를 불러와서 Wizard에서 이어서 작업
    - wizard_data가 없으면 null 반환
    
    **응답 예시**:
    ```json
    {
      "success": true,
      "has_draft": true,
      "wizard_data": {
        "step1": { ... },
        "step2": { ... },
        "step3": { ... },
        "step4": { ... }
      },
      "saved_at": "2025-11-17T10:30:00",
      "screen_name": "이상발생 접수"
    }
    ```
    """
    try:
        logger.info(f"📂 [Wizard Draft] Loading draft for screen_id: {screen_id}")
        
        # 1. Screen 조회
        screen = db.query(Screen).filter(Screen.id == screen_id).first()
        if not screen:
            raise HTTPException(status_code=404, detail=f"Screen not found: {screen_id}")
        
        # 2. wizard_data 확인
        has_draft = screen.wizard_data is not None and len(screen.wizard_data) > 0
        
        if has_draft:
            logger.info(f"✅ [Wizard Draft] Found draft data")
            logger.info(f"📊 Data size: {len(str(screen.wizard_data))} chars")
            
            # Step 정보 로깅
            wizard_data = screen.wizard_data
            if isinstance(wizard_data, dict):
                if "step1" in wizard_data:
                    logger.info(f"📝 Step 1: {wizard_data['step1'].get('screenName', 'N/A')}")
                if "step3" in wizard_data:
                    component_count = len(wizard_data['step3'].get('components', []))
                    logger.info(f"🧩 Step 3: {component_count} components")
                if "step4" in wizard_data:
                    interaction_count = len(wizard_data['step4'].get('interactions', []))
                    logger.info(f"⚡ Step 4: {interaction_count} interactions")
        else:
            logger.info(f"ℹ️  [Wizard Draft] No draft data found")
        
        return {
            "success": True,
            "has_draft": has_draft,
            "wizard_data": screen.wizard_data if has_draft else None,
            "saved_at": screen.updated_at.isoformat() if screen.updated_at else None,
            "screen_name": screen.name,
            "menu_name": screen.menu.name if screen.menu else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error loading wizard draft: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/screens/{screen_id}/documents/design/download")
async def download_stored_design_doc(
    screen_id: int,
    db: Session = Depends(get_db)
):
    """
    저장된 설계서 다운로드
    """
    screen = db.query(Screen).filter(Screen.id == screen_id).first()
    if not screen:
        raise HTTPException(status_code=404, detail="Screen not found")
        
    if not screen.design_doc:
        raise HTTPException(status_code=404, detail="생성된 설계서가 없습니다. 먼저 생성해주세요.")

    # DB의 바이너리 데이터를 스트림으로 변환
    from io import BytesIO
    file_stream = BytesIO(screen.design_doc)
    
    filename = f"{screen.name}_화면설계서.docx".encode('utf-8').decode('latin-1')
    quoted_filename = quote(filename)
    
    return StreamingResponse(
        file_stream,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f"attachment; filename*=UTF-8''{quoted_filename}"}
    )