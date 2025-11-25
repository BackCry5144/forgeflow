import { ComponentType, TriggerEventType } from '@/types/wizard.types';

export interface ComponentTriggerEvent {
  type: ComponentType;
  availableEvents: TriggerEventType[];
  icon: string;
  description: string;
}

export const COMPONENT_TRIGGER_EVENTS: ComponentTriggerEvent[] = [
  // Form Controls
  { 
    type: 'button', 
    availableEvents: ['click', 'double-click'], 
    icon: '🔘', 
    description: '버튼 클릭 또는 더블클릭' 
  },
  { 
    type: 'textbox', 
    availableEvents: ['change', 'submit'], 
    icon: '📝', 
    description: '텍스트 입력 변경 또는 엔터키' 
  },
  { 
    type: 'codeview', 
    availableEvents: ['click', 'change', 'submit'], 
    icon: '🔍', 
    description: '코드 조회 아이콘 클릭 또는 텍스트 입력' 
  },
  { 
    type: 'combo', 
    availableEvents: ['change', 'select'], 
    icon: '📋', 
    description: '콤보박스 선택 변경' 
  },
  { 
    type: 'checkbox', 
    availableEvents: ['change'], 
    icon: '☑️', 
    description: '체크박스 상태 변경' 
  },
  { 
    type: 'radio', 
    availableEvents: ['change'], 
    icon: '🔘', 
    description: '라디오 버튼 선택' 
  },
  { 
    type: 'date-picker', 
    availableEvents: ['change', 'select'], 
    icon: '📅', 
    description: '날짜 선택' 
  },
  { 
    type: 'time-picker', 
    availableEvents: ['change', 'select'], 
    icon: '⏰', 
    description: '시간 선택' 
  },
  { 
    type: 'number-input', 
    availableEvents: ['change', 'submit'], 
    icon: '🔢', 
    description: '숫자 입력' 
  },
  { 
    type: 'textarea', 
    availableEvents: ['change'], 
    icon: '📄', 
    description: '텍스트 영역 입력' 
  },
  { 
    type: 'file-upload', 
    availableEvents: ['change'], 
    icon: '📎', 
    description: '파일 선택' 
  },
  
  // Data Display
  { 
    type: 'grid', 
    availableEvents: ['row-click', 'cell-click', 'double-click'], 
    icon: '📊', 
    description: '그리드 행/셀 클릭' 
  },
  { 
    type: 'chart', 
    availableEvents: ['click', 'hover'], 
    icon: '📈', 
    description: '차트 데이터 포인트 클릭/호버' 
  },
  { 
    type: 'card', 
    availableEvents: ['click', 'hover'], 
    icon: '🎴', 
    description: '카드 클릭/호버' 
  },
  { 
    type: 'badge', 
    availableEvents: ['click'], 
    icon: '🏷️', 
    description: '배지 클릭' 
  },
  { 
    type: 'progress-bar', 
    availableEvents: ['click'], 
    icon: '📊', 
    description: '프로그레스바 클릭' 
  },
  
  // Layout & Others
  { 
    type: 'divider', 
    availableEvents: [], 
    icon: '➖', 
    description: '인터랙션 불가' 
  },
  { 
    type: 'label', 
    availableEvents: ['click'], 
    icon: '🏷️', 
    description: '레이블 클릭' 
  },
];

// Helper functions
export function getComponentTriggerEvents(componentType: ComponentType): TriggerEventType[] {
  const config = COMPONENT_TRIGGER_EVENTS.find(c => c.type === componentType);
  return config?.availableEvents || [];
}

export function getComponentTriggerInfo(componentType: ComponentType): ComponentTriggerEvent | undefined {
  return COMPONENT_TRIGGER_EVENTS.find(c => c.type === componentType);
}

export function getTriggerEventLabel(event: TriggerEventType): string {
  const labels: Record<TriggerEventType, string> = {
    'click': '클릭',
    'double-click': '더블 클릭',
    'row-click': '행 클릭',
    'cell-click': '셀 클릭',
    'change': '값 변경',
    'submit': '제출 (엔터)',
    'hover': '마우스 오버',
    'select': '선택',
  };
  return labels[event] || event;
}

export function getTriggerEventDescription(componentType: ComponentType, event: TriggerEventType): string {
  const descriptions: Record<string, string> = {
    // Button
    'button-click': '버튼을 클릭했을 때',
    'button-double-click': '버튼을 빠르게 두 번 클릭했을 때',
    
    // Grid
    'grid-row-click': '그리드의 특정 행을 클릭했을 때',
    'grid-cell-click': '그리드의 특정 셀을 클릭했을 때',
    'grid-double-click': '그리드의 행을 더블클릭했을 때',
    
    // Chart
    'chart-click': '차트의 데이터 포인트를 클릭했을 때',
    'chart-hover': '차트의 데이터 포인트에 마우스를 올렸을 때',
    
    // Form Controls
    'textbox-change': '텍스트박스의 값이 변경되었을 때',
    'textbox-submit': '텍스트박스에서 엔터키를 눌렀을 때',
    'codeview-click': '코드뷰 검색 아이콘을 클릭했을 때',
    'codeview-change': '코드뷰 텍스트의 값이 변경되었을 때',
    'codeview-submit': '코드뷰 텍스트에서 엔터키를 눌렀을 때',
    'combo-change': '콤보박스의 선택 값이 변경되었을 때',
    'combo-select': '콤보박스에서 항목을 선택했을 때',
    'checkbox-change': '체크박스의 체크 상태가 변경되었을 때',
    'radio-change': '라디오 버튼이 선택되었을 때',
    'date-picker-change': '날짜가 변경되었을 때',
    'date-picker-select': '날짜를 선택했을 때',
    
    // Card
    'card-click': '카드를 클릭했을 때',
    'card-hover': '카드에 마우스를 올렸을 때',
  };
  
  const key = `${componentType}-${event}`;
  return descriptions[key] || `${getTriggerEventLabel(event)} 이벤트가 발생했을 때`;
}

// 인터랙션 가능한 컴포넌트인지 확인
export function isInteractable(componentType: ComponentType): boolean {
  const events = getComponentTriggerEvents(componentType);
  return events.length > 0;
}

