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
        # AI Service의 모델 설정을 따라감
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

        # 2. Word 생성 (wizard_data 추가 전달)
        return self._create_design_docx(design_data, wizard_data, images)

    def _create_design_docx(self, data: dict, wizard_data: dict, images: List[dict] = None) -> BytesIO:
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
        for paragraph in doc.paragraphs:
            if "{{SCREENSHOT}}" in paragraph.text:
                paragraph.text = "" 
                if images:
                    for img in images:
                        try:
                            run = paragraph.add_run()
                            run.add_picture(BytesIO(img['bytes']), width=Inches(6.0))
                            # 이미지 라벨 추가
                            run.add_text(f"\n[{img['label']}]\n")
                        except: pass
                else:
                    paragraph.text = "(스크린샷 없음)"
                break

        # (C) UI 구조 도식화 (Tree Grid 스타일) 🔥
        # wizard_data에서 컴포넌트 상세 목록을 가져옴
        raw_components = wizard_data.get('step3', {}).get('components', [])
        self._generate_ui_structure_table(doc, data.get('layout_structure', []), raw_components)

        # (D) Normal Flow (동작 순서)
        self._generate_user_flow_table(doc, data.get('user_flow', []))

        # (E) 고정 테이블 채우기 (태그 기반 검색)
        state_table = self._find_table_by_tag(doc, "{{TABLE:STATE}}")
        if state_table:
            self._fill_table(state_table, data.get('state_specs', []), ["name", "type", "initial_value", "description"])

        event_table = self._find_table_by_tag(doc, "{{TABLE:EVENT}}")
        if event_table:
            self._fill_table(event_table, data.get('event_handlers', []), ["ui_element", "trigger", "logic"])

        buffer = BytesIO()
        doc.save(buffer)
        buffer.seek(0)
        return buffer

    # --- Helper Methods ---

    def _generate_ui_structure_table(self, doc, layout_data: list, raw_components: list):
        """
        {{UI_STRUCTURE}} 위치에 [화면구성 | 유형 | 필수 | 비고] 형태의 트리 테이블 생성
        """
        target_p = self._find_and_clear_tag(doc, "{{UI_STRUCTURE}}")
        if not target_p or not layout_data: return

        # 컴포넌트 상세 정보 매핑 (Label -> Detail)
        comp_map = {c['label']: c for c in raw_components}

        # 표 생성 (헤더 + 데이터)
        table = doc.add_table(rows=1, cols=4)
        table.style = 'Table Grid'
        target_p._p.addnext(table._tbl)

        # [헤더 설정]
        headers = ["화면 구성", "UI 유형", "필수", "비고"]
        # 열 너비 비율 (대략적): 4:2:1:3
        
        for i, text in enumerate(headers):
            cell = table.rows[0].cells[i]
            cell.text = text
            self._set_cell_bg(cell, "E7E6E6") # 헤더 회색 배경
            cell.paragraphs[0].runs[0].font.bold = True
            cell.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER

        # [데이터 채우기]
        for area in layout_data:
            # 1. 구역(Area) 행 추가 (Root Level)
            row = table.add_row()
            
            # Col 0: 구역명 (Bold)
            cell_area = row.cells[0]
            cell_area.text = area.get('area_name', 'Area')
            cell_area.paragraphs[0].runs[0].font.bold = True
            self._set_cell_bg(row.cells[0], "F9F9F9") # 구역 강조
            self._set_cell_bg(row.cells[1], "F9F9F9")
            self._set_cell_bg(row.cells[2], "F9F9F9")
            self._set_cell_bg(row.cells[3], "F9F9F9")

            # Col 1: Type (Area)
            row.cells[1].text = "Area"
            row.cells[1].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
            
            # Col 3: 비고 (설명)
            if area.get('description'):
                row.cells[3].text = area['description']
                row.cells[3].paragraphs[0].style.font.size = Pt(9)

            # 2. 컴포넌트(Component) 행 추가 (Child Level)
            for comp_label in area.get('components', []):
                comp_detail = comp_map.get(comp_label, {})
                
                c_row = table.add_row()
                
                # Col 0: 컴포넌트명 (트리 구조 들여쓰기 적용)
                c_cell = c_row.cells[0]
                p = c_cell.paragraphs[0]
                p.text = f"   └ {comp_label}" # 공백으로 들여쓰기 시각화
                # p.paragraph_format.left_indent = Inches(0.2) # 실제 들여쓰기 (선택)
                
                # Col 1: UI 유형 (한글 매핑)
                raw_type = comp_detail.get('type', '-')
                type_map = {
                    'textbox': '입력창', 'codeview': '팝업검색', 'combo': '콤보박스',
                    'date-picker': '날짜선택', 'button': '버튼', 'grid': '그리드',
                    'textarea': '텍스트영역', 'checkbox': '체크박스', 'radio': '라디오'
                }
                ui_type = type_map.get(raw_type, raw_type)
                c_row.cells[1].text = ui_type
                c_row.cells[1].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
                
                # Col 2: 필수 여부
                is_req = comp_detail.get('required', False)
                if is_req:
                    c_row.cells[2].text = "O"
                    c_row.cells[2].paragraphs[0].runs[0].font.bold = True
                    c_row.cells[2].paragraphs[0].runs[0].font.color.rgb = RGBColor(255, 0, 0) # 빨간색
                c_row.cells[2].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER

                # Col 3: 비고 (추가 정보가 있다면)
                # c_row.cells[3].text = ""

    def _generate_user_flow_table(self, doc, flow_data: list):
        target_p = self._find_and_clear_tag(doc, "{{USER_FLOW}}")
        if not target_p or not flow_data: return

        table = doc.add_table(rows=1, cols=4)
        table.style = 'Table Grid'
        target_p._p.addnext(table._tbl)

        headers = ["단계", "사용자 액션", "시스템 반응", "화면 예시"]
        for i, h in enumerate(headers):
            cell = table.rows[0].cells[i]
            cell.text = h
            self._set_cell_bg(cell, "E7E6E6")
            cell.paragraphs[0].runs[0].font.bold = True
            cell.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER

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
            row.cells[3].text = "" # 스크린샷 공간

    def _find_table_by_tag(self, doc, tag):
        for table in doc.tables:
            for row in table.rows:
                for cell in row.cells:
                    if tag in cell.text:
                        cell.text = cell.text.replace(tag, "")
                        return table
        return None

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