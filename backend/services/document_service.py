# backend/services/document_service.py

import json
import os
import logging
import traceback
from io import BytesIO
from typing import List, Dict, Any, Optional
from docx import Document
from docx.shared import Inches
import google.generativeai as genai
from utils.doc_prompts import get_design_spec_prompt # 함수명 확인 필요 (get_dev_design_prompt 인지 get_design_spec_prompt 인지)
from services.ai_service import get_ai_service

# 로거 설정
logger = logging.getLogger(__name__)

class DocumentService:
    def __init__(self):
        self.ai_service = get_ai_service()
        # AI Service의 모델 설정을 따라감
        self.model = genai.GenerativeModel(self.ai_service.model_name)
        logger.info(f"Document Service initialized with model: {self.ai_service.model_name}")

    async def generate_design_doc(
        self, 
        screen_name: str, 
        react_code: str, 
        wizard_data: dict, 
        images: List[dict] = None
    ) -> BytesIO:
        """
        개발자용 화면 설계서 단독 생성 (Word)
        """
        logger.info(f"📄 Generating design spec for: {screen_name}")
        
        # 1. LLM에게 설계 데이터 추출 요청
        try:
            # utils/doc_prompts.py 에 정의된 함수명으로 호출
            # (get_dev_design_prompt 또는 get_design_spec_prompt 중 실제 정의된 것 사용)
            from utils.doc_prompts import get_design_spec_prompt 
            prompt = get_design_spec_prompt(react_code, wizard_data)
            
            design_data = await self._extract_data(prompt)
            logger.info("✅ LLM Data Extraction Success")
        except Exception as e:
            logger.error(f"❌ LLM Extraction Failed: {e}")
            logger.error(traceback.format_exc())
            # 실패 시 기본 데이터로 진행
            design_data = {
                "basic_info": {
                    "screen_name": screen_name, 
                    "description": "AI 분석 실패 (로그 확인 필요)"
                }
            }

        # 2. Word 문서 생성 (이미지 포함)
        logger.info("📝 Creating Word document...")
        try:
            return self._create_design_docx(design_data, images)
        except Exception as e:
            logger.error(f"❌ Word Creation Failed: {e}")
            logger.error(traceback.format_exc())
            raise e

    async def _extract_data(self, prompt: str) -> dict:
        """LLM 호출 및 JSON 파싱 헬퍼"""
        try:
            response = await self.model.generate_content_async(
                prompt,
                generation_config={"response_mime_type": "application/json"}
            )
            text = response.text.strip()
            # 마크다운 제거
            if text.startswith("```json"): text = text[7:]
            if text.endswith("```"): text = text[:-3]
            return json.loads(text)
        except Exception as e:
            logger.error(f"JSON Extraction Error: {e}")
            raise e

    def _create_design_docx(self, data: dict, images: List[dict] = None) -> BytesIO:
        """Word 템플릿에 데이터 매핑 및 조립"""
        
        # 템플릿 절대 경로 계산
        base_dir = os.path.dirname(os.path.dirname(__file__)) # backend/
        template_path = os.path.join(base_dir, 'templates', 'design_spec_template.docx')
        
        if os.path.exists(template_path):
            doc = Document(template_path)
        else:
            logger.warning(f"⚠️ Template not found at {template_path}. Creating new.")
            doc = Document()

        # (A) 텍스트 치환
        info = data.get('basic_info', {})
        replacements = {
            "{{SCREEN_NAME}}": str(info.get('screen_name', data.get('screen_name', ''))),
            "{{COMPONENT_NAME}}": str(info.get('component_name', '')),
            "{{DESCRIPTION}}": str(info.get('description', '')),
            "{{UI_STRUCTURE}}": "\n".join(data.get('ui_structure', [])) if isinstance(data.get('ui_structure'), list) else str(data.get('ui_structure', ''))
        }

        for paragraph in doc.paragraphs:
            for key, val in replacements.items():
                if key in paragraph.text:
                    try:
                        paragraph.text = paragraph.text.replace(key, str(val))
                    except: pass

        # (B) 이미지 삽입 (Pillow 필요)
        if images:
            for paragraph in doc.paragraphs:
                if "{{SCREENSHOT}}" in paragraph.text:
                    paragraph.text = "" # 태그 제거
                    for img in images:
                        try:
                            run = paragraph.add_run()
                            # BytesIO로 감싸서 전달
                            run.add_picture(BytesIO(img['bytes']), width=Inches(6.0))
                            run.add_text(f"\n[{img['label']}]\n")
                        except Exception as e:
                            logger.error(f"Image insertion failed: {e}")
                            paragraph.add_run(f"[이미지 삽입 실패: {img.get('label')}]")
                    break
        else:
            # 이미지가 없으면 태그만 제거
            for paragraph in doc.paragraphs:
                if "{{SCREENSHOT}}" in paragraph.text:
                    paragraph.text = "(스크린샷 없음)"

        # (C) 표 채우기
        tables = doc.tables
        # 템플릿 구조에 따라 인덱스 조정 (개요 표가 0번이라고 가정 시)
        if len(tables) >= 2:
            self._fill_table(tables[1], data.get('state_specs', []), ["name", "type", "initial_value", "description"])
        if len(tables) >= 3:
            self._fill_table(tables[2], data.get('event_handlers', []), ["name", "trigger", "logic"])

        buffer = BytesIO()
        doc.save(buffer)
        buffer.seek(0)
        return buffer

    def _fill_table(self, table, data_list, keys):
        if not data_list: return
        for item in data_list:
            try:
                row = table.add_row().cells
                for i, key in enumerate(keys):
                    if i < len(row):
                        row[i].text = str(item.get(key, '-'))
            except: pass