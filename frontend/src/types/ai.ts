import type { WizardData } from './wizard.types';

export interface GenerateRequest {
  screen_id: number;
  prompt?: string;  // Optional: Backend에서 wizard_data로부터 자동 생성
  wizard_data?: WizardData;  // 필수: Wizard Step 1-4 데이터
  menu_name: string;
  screen_name: string;
}

export interface GenerateResponse {
  prototype_html: string;
  design_doc: string;
}