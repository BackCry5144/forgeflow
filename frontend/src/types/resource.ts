/**
 * Resource Types - Wizard 리소스 타입 정의
 */

// ============================================================
// Layout Types
// ============================================================

export interface LayoutArea {
  id: string;
  name: string;
  description?: string;
  suggestedComponents?: string[];
}

export interface Layout {
  id: string;
  name: string;
  description?: string;
  html_template: string;
  areas: LayoutArea[];
  thumbnail?: string;
  category: string;
  is_active: boolean;
  sort_order: string;
  created_at: string;
  updated_at: string;
}

export interface CreateLayoutRequest {
  id: string;
  name: string;
  description?: string;
  html_template: string;
  areas: LayoutArea[];
  thumbnail?: string;
  category?: string;
  is_active?: boolean;
  sort_order?: string;
}

export interface UpdateLayoutRequest {
  name?: string;
  description?: string;
  html_template?: string;
  areas?: LayoutArea[];
  thumbnail?: string;
  category?: string;
  is_active?: boolean;
  sort_order?: string;
}

// ============================================================
// Component Types
// ============================================================

export interface Component {
  id: string;
  name: string;
  description?: string;
  type: string;
  category: string;
  icon: string;
  default_props?: Record<string, any>;
  jsx_template?: string;
  available_events?: string[];
  is_active: boolean;
  sort_order: string;
  created_at: string;
  updated_at: string;
}

export interface CreateComponentRequest {
  id: string;
  name: string;
  description?: string;
  type: string;
  category?: string;
  icon?: string;
  default_props?: Record<string, any>;
  jsx_template?: string;
  available_events?: string[];
  is_active?: boolean;
  sort_order?: string;
}

export interface UpdateComponentRequest {
  name?: string;
  description?: string;
  type?: string;
  category?: string;
  icon?: string;
  default_props?: Record<string, any>;
  jsx_template?: string;
  available_events?: string[];
  is_active?: boolean;
  sort_order?: string;
}

// ============================================================
// Action Types
// ============================================================

export interface ActionParamSchema {
  type: string;
  required?: boolean;
  description?: string;
  default?: any;
}

export interface Action {
  id: string;
  name: string;
  description?: string;
  category: string;
  icon?: string;
  params_schema?: Record<string, ActionParamSchema>;
  code_template?: string;
  is_active: boolean;
  sort_order: string;
  created_at: string;
  updated_at: string;
}

export interface CreateActionRequest {
  id: string;
  name: string;
  description?: string;
  category?: string;
  icon?: string;
  params_schema?: Record<string, ActionParamSchema>;
  code_template?: string;
  is_active?: boolean;
  sort_order?: string;
}

export interface UpdateActionRequest {
  name?: string;
  description?: string;
  category?: string;
  icon?: string;
  params_schema?: Record<string, ActionParamSchema>;
  code_template?: string;
  is_active?: boolean;
  sort_order?: string;
}

// ============================================================
// Combined Types (for Wizard)
// ============================================================

export interface WizardResources {
  layouts: Layout[];
  components: Component[];
  actions: Action[];
}

// List Response Types
export interface LayoutListResponse {
  total: number;
  items: Layout[];
}

export interface ComponentListResponse {
  total: number;
  items: Component[];
}

export interface ActionListResponse {
  total: number;
  items: Action[];
}
