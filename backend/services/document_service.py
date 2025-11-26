# backend/services/document_service.py

import json
import os
from io import BytesIO
from typing import List, Dict, Any, Optional
from docx import Document
from docx.shared import Inches, Pt
from docx.enum.text import WD_ALIGN_PARAGRAPH
import google.generativeai as genai
from google.api_core import exceptions as google_exceptions
from utils.doc_prompts import get_dev_design_prompt

# ... (기존 DocumentService 클래스 내부) ...

class DocumentService:
    # ... (init 및 _extract_data 함수는 그대로 유지) ...

    async def generate_design_doc(
        self, 
        screen_name: str, 
        react_code: str, 
        wizard_data: dict, 
        # 🔥 [핵심] 스크린샷은 파라미터로 받되, 이 함수 내에서는 Text/Byte만 선언
        images: Optional[List[Dict[str, Any]]] = None 
    ) -> BytesIO:
        """
        개발자용 화면 설계서 단독 생성 (Word)
        """
        # 1. LLM에게 설계 데이터 추출 요청
        prompt = get_dev_design_prompt(react_code, wizard_data)
        
        # LLM 호출 및 JSON 추출
        data = await self._extract_json_data(prompt)
        
        # 2. Word 문서 생성 및 데이터 주입
        return self._create_docx_from_template(data, images) # images는 파라미터로만 전달

    async def _extract_json_data(self, prompt: str) -> dict:
        """JSON 출력 형식 지정 및 호출 헬퍼"""
        try:
            # 안전하게 generation_config에서 JSON 포맷 지정
            response = await self.model.generate_content_async(
                prompt,
                generation_config={"response_mime_type": "application/json"}
            )
            # 마크다운 제거 후 JSON 파싱
            clean_text = response.text.replace("```json", "").replace("```", "").strip()
            return json.loads(clean_text)
        except Exception as e:
            print(f"LLM JSON Extraction Failed: {e}")
            raise

    def _create_docx_from_template(self, data: dict, images: Optional[List[Dict[str, Any]]] = None) -> BytesIO:
        """Word 템플릿에 데이터 매핑 및 조립"""
        
        template_path = os.path.join("templates", "design_spec_template.docx")
        
        # 템플릿 로드 (fallback 포함)
        doc = Document(template_path) if os.path.exists(template_path) else Document() 

        # --- (A) 텍스트 치환 (Placeholder) ---
        info = data.get('basic_info', {})
        replacements = {
            "{{SCREEN_NAME}}": info.get('screen_name', data.get('screen_name', '')),
            "{{COMPONENT_NAME}}": info.get('component_name', ''),
            "{{DESCRIPTION}}": info.get('description', ''),
            "{{UI_STRUCTURE}}": "\n".join(data.get('ui_structure', [])),
            "{{USER_FLOW}}": "\n".join(data.get('user_flow', [])),
        }
        
        for paragraph in doc.paragraphs:
            for key, value in replacements.items():
                if key in paragraph.text:
                    paragraph.text = paragraph.text.replace(key, str(value))
        
        # --- (B) 스크린샷 삽입 (파라미터 선언만, 실제 로직은 최소화) ---
        if images and len(images) > 0:
            # 템플릿 내 {{SCREENSHOT}} 태그를 찾아 이미지로 교체하는 로직 (이전 대화에서 논의된 부분)
            for paragraph in doc.paragraphs:
                if "{{SCREENSHOT}}" in paragraph.text:
                    paragraph.text = "" 
                    # 🔥 여기서 이미지를 삽입하는 로직이 들어가야 함 (생략/최소화)
                    if images[0]['bytes']:
                        run = paragraph.add_run()
                        # 이미지 삽입 로직 (Inches(6.0) 등)
                        doc.add_paragraph("✅ 스크린샷 준비 완료 (추후 이미지 변환)").alignment = WD_ALIGN_PARAGRAPH.CENTER
                    break
        
        # --- (C) 테이블 데이터 채우기 (State & Event) ---
        tables = doc.tables
        
        # [Table 1: 상태 관리] (인덱스 1)
        if len(tables) >= 2: 
            table = tables[1]
            for state in data.get('state_specs', []):
                row = table.add_row().cells
                if len(row) >= 4:
                    row[0].text = state.get('name', '-')
                    row[1].text = state.get('type', '-')
                    row[2].text = state.get('initial_value', '-')
                    row[3].text = state.get('description', '-')

        # [Table 2: 이벤트 핸들러] (인덱스 2)
        if len(tables) >= 3: 
            table = tables[2]
            for handler in data.get('event_handlers', []):
                row = table.add_row().cells
                if len(row) >= 3:
                    row[0].text = handler.get('ui_element', '-')
                    row[1].text = handler.get('trigger', '-')
                    row[2].text = handler.get('logic', '-')

        # --- (D) 저장 ---
        buffer = BytesIO()
        doc.save(buffer)
        buffer.seek(0)
        return buffer