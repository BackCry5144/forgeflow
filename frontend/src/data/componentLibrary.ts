import { ComponentType } from '@/types/wizard.types';
import { 
  MousePointer, Type, List, CheckSquare, Circle,
  Calendar, Clock, Hash, FileText, Upload, Search,
  Table, BarChart3, CreditCard, Tag, TrendingUp,
  Minus, Tag as LabelIcon
} from 'lucide-react';

export interface ComponentDefinition {
  type: ComponentType;
  name: string;
  description: string;
  icon: any; // lucide-react icon component
  category: ComponentCategory;
}

export type ComponentCategory = 'form' | 'data-display' | 'layout';

export const COMPONENT_CATEGORIES = [
  { id: 'form' as ComponentCategory, name: 'Form Controls', description: '입력 폼 컴포넌트' },
  { id: 'data-display' as ComponentCategory, name: 'Data Display', description: '데이터 표시 컴포넌트' },
  { id: 'layout' as ComponentCategory, name: 'Layout', description: '레이아웃 컴포넌트' }
];

export const COMPONENT_LIBRARY: ComponentDefinition[] = [
  // Form Controls
  { type: 'button', name: '버튼', description: '클릭 가능한 버튼', icon: MousePointer, category: 'form' },
  { type: 'textbox', name: '텍스트박스', description: '단일 줄 텍스트 입력', icon: Type, category: 'form' },
  { type: 'codeview', name: '코드뷰', description: 'Code 조회 (텍스트박스 + 검색 아이콘)', icon: Search, category: 'form' },
  { type: 'combo', name: '콤보박스', description: '드롭다운 선택', icon: List, category: 'form' },
  { type: 'checkbox', name: '체크박스', description: '다중 선택', icon: CheckSquare, category: 'form' },
  { type: 'radio', name: '라디오', description: '단일 선택', icon: Circle, category: 'form' },
  { type: 'date-picker', name: '날짜선택', description: '날짜 입력', icon: Calendar, category: 'form' },
  { type: 'time-picker', name: '시간선택', description: '시간 입력', icon: Clock, category: 'form' },
  { type: 'number-input', name: '숫자입력', description: '숫자만 입력', icon: Hash, category: 'form' },
  { type: 'textarea', name: '텍스트영역', description: '여러 줄 텍스트', icon: FileText, category: 'form' },
  { type: 'file-upload', name: '파일업로드', description: '파일 첨부', icon: Upload, category: 'form' },
  
  // Data Display
  { type: 'grid', name: '그리드', description: '데이터 테이블', icon: Table, category: 'data-display' },
  { type: 'chart', name: '차트', description: '데이터 시각화', icon: BarChart3, category: 'data-display' },
  { type: 'card', name: '카드', description: '정보 카드', icon: CreditCard, category: 'data-display' },
  { type: 'badge', name: '뱃지', description: '상태 표시', icon: Tag, category: 'data-display' },
  { type: 'progress-bar', name: '진행바', description: '진행 상태', icon: TrendingUp, category: 'data-display' },
  
  // Layout
  { type: 'divider', name: '구분선', description: '섹션 구분', icon: Minus, category: 'layout' },
  { type: 'label', name: '레이블', description: '텍스트 표시', icon: LabelIcon, category: 'layout' }
];

// 컴포넌트 타입으로 정의 찾기 헬퍼 함수
export function getComponentDefinition(type: ComponentType): ComponentDefinition | undefined {
  return COMPONENT_LIBRARY.find(comp => comp.type === type);
}

// 카테고리별 컴포넌트 그룹핑 헬퍼 함수
export function getComponentsByCategory(category: ComponentCategory): ComponentDefinition[] {
  return COMPONENT_LIBRARY.filter(comp => comp.category === category);
}

