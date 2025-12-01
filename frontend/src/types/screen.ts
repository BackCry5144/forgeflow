export type ScreenStatus = 'draft' | 'in_review';

export interface Screen {
  id: number;
  menu_id: number;
  name: string;
  description: string | null;
  prompt: string | null;
  prototype_html: string | null;
  design_doc: string | null;
  test_plan: string | null;
  manual: string | null;
  wizard_data: Record<string, unknown> | null;
  status: ScreenStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateScreenRequest {
  menu_id: number;
  name: string;
  description?: string;
  prompt?: string;
}

export interface UpdateScreenRequest {
  name?: string;
  description?: string;
  prompt?: string;
  status?: ScreenStatus;
}
