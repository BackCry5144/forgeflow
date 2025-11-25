// Wizard 관련 타입 정의

export interface WizardStep {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'current' | 'completed';
}

export interface WizardData {
  step1: Step1Data;
  step2: Step2Data;
  step3: Step3Data;
  step4: Step4Data;
}

// Step 1: 화면 개요
export interface Step1Data {
  screenName: string;
  description: string;
}

// Step 2: 레이아웃 선택
export type LayoutType = 'search-grid' | 'master-detail' | 'dashboard' | 'kanban' | 'form';

export interface LayoutTemplate {
  id: LayoutType;
  name: string;
  description: string;
  htmlTemplate: string; // 미리 정의된 HTML 템플릿
}

export interface LayoutArea {
  id: string;
  name: string;
  description: string;
  suggestedComponents?: ComponentType[];
}

export interface Step2Data {
  selectedLayout: LayoutType | null;
  layoutAreas: LayoutArea[];
}

// Step 3: 컴포넌트 배치
export type ComponentType = 
  // Form Controls
  | 'button' | 'textbox' | 'combo' | 'checkbox' | 'radio' 
  | 'date-picker' | 'time-picker' | 'number-input' | 'textarea' | 'file-upload'
  | 'codeview'  // Code 조회용 특수 컴포넌트 (텍스트박스 + 검색 버튼)
  // Data Display
  | 'grid' | 'chart' | 'card' | 'badge' | 'progress-bar'
  // Others
  | 'divider' | 'label';

export interface Component {
  id: string;
  type: ComponentType;
  label: string;
  areaId: string; // 어느 영역에 배치되는지
}

export interface Step3Data {
  components: Component[];
  selectedAreaId: string; // 현재 선택된 영역
}

// Step 4: 인터랙션 정의
export type TriggerEventType = 
  | 'click'           // 클릭
  | 'double-click'    // 더블클릭
  | 'row-click'       // 그리드 행 클릭
  | 'cell-click'      // 그리드 셀 클릭
  | 'change'          // 값 변경
  | 'submit'          // 제출 (엔터키)
  | 'hover'           // 마우스 오버
  | 'select';         // 선택

export type ActionType = 
  | 'fetch-data'    // 데이터 조회
  | 'submit'        // 데이터 저장
  | 'clear'         // 초기화
  | 'open-modal'    // 팝업 열기
  | 'validate'      // 유효성 검사
  | 'navigate';     // 화면 이동

export interface ModalConfig {
  id: string;
  title: string;
  size: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  type: 'form' | 'detail' | 'confirm' | 'custom';
  fields?: ModalField[];
  content?: string;
}

export interface ModalField {
  id: string;
  label: string;
  type: 'textbox' | 'codeview' | 'combo' | 'textarea' | 'date-picker' | 'number-input' | 'checkbox' | 'radio';
  required: boolean;
  placeholder?: string;
  options?: string[];  // combo, radio용
}

export interface Interaction {
  id: string;
  triggerComponentId: string;  // 트리거 컴포넌트 ID (Step3에서 생성)
  triggerEvent: TriggerEventType;  // 트리거 이벤트 타입
  actionType: ActionType;
  targetComponentId?: string;   // 타겟 컴포넌트 ID (옵셔널)
  targetAreaId?: string;        // 타겟 영역 ID (옵셔널)
  modalConfig?: ModalConfig;    // 모달 설정 (open-modal일 때)
  description?: string;         // 추가 설명 (옵셔널)
}

export interface Step4Data {
  interactions: Interaction[];
}

// Step 5: 검토
export interface Step5Data {
  confirmed: boolean;
}
