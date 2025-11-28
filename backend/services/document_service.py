# backend/services/document_service.py

import json
import os
import logging
import traceback
from io import BytesIO
from typing import List, Dict, Any, Optional
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
import google.generativeai as genai

from services.ai_service import get_ai_service
from utils.doc_prompts import get_design_spec_prompt

logger = logging.getLogger(__name__)

class DocumentService:
    def __init__(self):
        self.ai_service = get_ai_service()
        self.model = genai.GenerativeModel(self.ai_service.model_name)

    async def generate_design_doc(
        self, 
        screen_name: str, 
        react_code: str, 
        wizard_data: dict, 
        images: List[dict] = None
    ) -> BytesIO:
        """개발자용 화면 설계서 생성 (Word)"""
        logger.info(f"📄 Generating design spec for: {screen_name}")
        
        # 1. LLM 데이터 추출
        try:
            prompt = get_design_spec_prompt(react_code, wizard_data)
            response = await self.model.generate_content_async(
                prompt,
                generation_config={"response_mime_type": "application/json"}
            )
            # JSON 파싱
            text = response.text.strip()
            if text.startswith("```json"): text = text[7:]
            if text.endswith("```"): text = text[:-3]
            design_data = json.loads(text)
            logger.info("✅ LLM Data Extraction Success")
        except Exception as e:
            logger.error(f"❌ LLM Extraction Failed: {e}")
            design_data = {"basic_info": {"screen_name": screen_name, "description": "분석 실패"}}

        # 2. Word 생성
        return self._create_design_docx(design_data, images)

    def _create_design_docx(self, data: dict, images: List[dict] = None) -> BytesIO:
        base_dir = os.path.dirname(os.path.dirname(__file__))
        template_path = os.path.join(base_dir, 'templates', 'design_spec_template.docx')
        
        doc = Document(template_path) if os.path.exists(template_path) else Document()

        # (A) 텍스트 치환
        info = data.get('basic_info', {})
        replacements = {
            "{{SCREEN_NAME}}": str(info.get('screen_name', data.get('screen_name', ''))),
            "{{COMPONENT_NAME}}": str(info.get('component_name', '')),
            "{{DESCRIPTION}}": str(info.get('description', '')),
        }

        for paragraph in doc.paragraphs:
            for key, val in replacements.items():
                if key in paragraph.text:
                    paragraph.text = paragraph.text.replace(key, str(val))

        # (B) 이미지 삽입 ({{SCREENSHOT}})
        # 이미지가 있으면 넣고, 없으면 태그 제거
        for paragraph in doc.paragraphs:
            if "{{SCREENSHOT}}" in paragraph.text:
                paragraph.text = "" 
                if images:
                    for img in images:
                        try:
                            run = paragraph.add_run()
                            run.add_picture(BytesIO(img['bytes']), width=Inches(6.0))
                            run.add_text(f"\n[{img['label']}]\n")
                        except: pass
                else:
                    paragraph.text = "(스크린샷 없음)"
                break

        # (C) 동적 테이블 생성 (UI 구조 & Normal Flow)
        self._generate_layout_map_table(doc, data.get('layout_structure', []))
        self._generate_user_flow_table(doc, data.get('user_flow', []))

        # (D) 고정 테이블 채우기 (State & Event)
        # 템플릿의 표 순서: [0:개요, 1:State, 2:Event] 라고 가정
        if len(doc.tables) >= 2:
            self._fill_table(doc.tables[1], data.get('state_specs', []), ["name", "type", "initial_value", "description"])
        if len(doc.tables) >= 3:
            self._fill_table(doc.tables[2], data.get('event_handlers', []), ["ui_element", "trigger", "logic"]) # 키 이름 주의

        buffer = BytesIO()
        doc.save(buffer)
        buffer.seek(0)
        return buffer

    # --- Helper Methods ---

    def _generate_layout_map_table(self, doc, layout_data: list):
        """{{UI_STRUCTURE}} 위치에 UI 구조도 표 생성"""
        target_p = self._find_and_clear_tag(doc, "{{UI_STRUCTURE}}")
        if not target_p or not layout_data: return

        table = doc.add_table(rows=len(layout_data) * 2, cols=1)
        table.style = 'Table Grid'
        target_p._p.addnext(table._tbl)

        for idx, area in enumerate(layout_data):
            # 헤더
            cell_h = table.rows[idx * 2].cells[0]
            cell_h.text = f" {area.get('area_name', '')}"
            self._set_cell_bg(cell_h, "F2F2F2") # 연회색
            cell_h.paragraphs[0].runs[0].font.bold = True
            
            # 내용 (세로 리스트 + 들여쓰기)
            cell_c = table.rows[idx * 2 + 1].cells[0]
            cell_c.text = ""
            for comp in area.get('components', []):
                p = cell_c.add_paragraph(f"• {comp}")
                p.paragraph_format.left_indent = Inches(0.25)
                p.paragraph_format.space_after = Pt(2)
            
            if area.get('description'):
                cell_c.add_paragraph("") # 빈 줄
                p = cell_c.add_paragraph(f"└ 비고: {area['description']}")
                p.paragraph_format.left_indent = Inches(0.25)
                p.style.font.size = Pt(9)
                p.style.font.color.rgb = RGBColor(100, 100, 100)

    def _generate_user_flow_table(self, doc, flow_data: list):
        """{{USER_FLOW}} 위치에 동작 순서 표 생성"""
        target_p = self._find_and_clear_tag(doc, "{{USER_FLOW}}")
        if not target_p or not flow_data: return

        table = doc.add_table(rows=1, cols=4)
        table.style = 'Table Grid'
        target_p._p.addnext(table._tbl)

        # 헤더 설정
        headers = ["단계", "사용자 액션", "시스템 반응", "화면 예시"]
        for i, h in enumerate(headers):
            cell = table.rows[0].cells[i]
            cell.text = h
            self._set_cell_bg(cell, "E7E6E6")
            cell.paragraphs[0].runs[0].font.bold = True
            cell.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER

        # 데이터 행 추가
        for item in flow_data:
            row = table.add_row()
            row.cells[0].text = str(item.get('step', '-'))
            row.cells[0].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
            
            row.cells[1].text = item.get('action', '-')
            if item.get('description'):
                p = row.cells[1].add_paragraph(f"({item.get('description')})")
                p.style.font.size = Pt(8)
                p.style.font.color.rgb = RGBColor(100, 100, 100)
            
            row.cells[2].text = item.get('system_response', '-')
            
            # 화면 예시 칸 (추후 이미지 삽입용 공간)
            row.cells[3].text = "(Screenshot)"
            row.cells[3].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
            row.cells[3].paragraphs[0].runs[0].font.color.rgb = RGBColor(200, 200, 200)

    def _find_and_clear_tag(self, doc, tag):
        for p in doc.paragraphs:
            if tag in p.text:
                p.text = ""
                return p
        return None

    def _set_cell_bg(self, cell, color_hex):
        tcPr = cell._tc.get_or_add_tcPr()
        shd = OxmlElement('w:shd')
        shd.set(qn('w:fill'), color_hex)
        tcPr.append(shd)

    def _fill_table(self, table, data_list, keys):
        if not data_list: return
        for item in data_list:
            try:
                row = table.add_row().cells
                for i, key in enumerate(keys):
                    if i < len(row):
                        row[i].text = str(item.get(key, '-'))
            except: pass