import json
import os
import zipfile
from io import BytesIO
from docx import Document
from docx.shared import Inches, Pt
from openpyxl import load_workbook, Workbook
from openpyxl.styles import Alignment
import google.generativeai as genai

from utils.doc_prompts import get_dev_design_prompt, get_user_manual_prompt, get_test_plan_prompt
from services.ai_service import get_ai_service

class DocumentService:
    def __init__(self):
        # JSON 모드 지원 모델 사용
        # self.model = genai.GenerativeModel('gemini-1.5-flash')

        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_API_KEY 환경 변수가 설정되지 않았습니다")
        
        genai.configure(api_key=api_key)
        
        self.model_name = os.getenv("GEMINI_MODEL", "gemini-1.5-pro")
        if self.model_name.endswith("-latest"):
            self.model_name = self.model_name[:-7]
            
        self.model = genai.GenerativeModel(self.model_name)
        
        # 설정값
        self.max_continuation_attempts = 3
        self.max_quota_retries = 10
        self.retry_delay_seconds = 60
        
        logger.info(f"Document Service initialized: {self.model_name}")

    # --- 설계서 생성 ---
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
        # 1. LLM에게 설계 데이터 추출 요청
        # (기존 get_dev_design_prompt 재사용)
        dev_data = await self._extract_data(
            get_dev_design_prompt(react_code, wizard_data) 
        )
        
        # 2. Word 문서 생성 (이미지 포함)
        # (기존 _create_dev_design_docx 재사용)
        docx_buffer = self._create_design_Doc(dev_data, images)
        
        return docx_buffer

    # --- Word 생성 로직 (설계서) ---
    def _createDesignDoc(self, data: dict, images: list) -> BytesIO:
        template_path = "templates/design_spec_template.docx"
        doc = Document(template_path) if os.path.exists(template_path) else Document()
        
        info = data.get('basic_info', {})
        
        # 텍스트 치환
        self._replace_text(doc, "{{SCREEN_NAME}}", info.get('screen_name', ''))
        self._replace_text(doc, "{{DESCRIPTION}}", info.get('description', ''))
        
        # 스크린샷 삽입 ({{SCREENSHOT}} 태그 위치에)
        if images and len(images) > 0:
            for p in doc.paragraphs:
                if "{{SCREENSHOT}}" in p.text:
                    p.text = ""
                    run = p.add_run()
                    run.add_picture(BytesIO(images[0]['bytes']), width=Inches(6.0))
                    break
        
        # 표 데이터 채우기 (템플릿에 표가 있다고 가정)
        if len(doc.tables) >= 2:
            # State 표 채우기
            self._fill_table(doc.tables[0], data.get('state_specs', []), ["name", "type", "description"])
            # Event 표 채우기
            self._fill_table(doc.tables[1], data.get('event_handlers', []), ["name", "trigger", "logic"])
            
        buffer = BytesIO()
        doc.save(buffer)
        buffer.seek(0)
        return buffer

    # --- Helper Methods ---
    def _replace_text(self, doc, key, value):
        for p in doc.paragraphs:
            if key in p.text:
                p.text = p.text.replace(key, str(value))

    def _fill_table(self, table, data_list, keys):
        for item in data_list:
            row = table.add_row().cells
            for i, key in enumerate(keys):
                if i < len(row):
                    row[i].text = str(item.get(key, '-'))
    
