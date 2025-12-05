/**
 * Lucide Icon Mapper
 * - DB에서 가져온 아이콘 이름(문자열)을 실제 Lucide 컴포넌트로 매핑
 */

import {
  MousePointer,
  Type,
  List,
  CheckSquare,
  Circle,
  Calendar,
  Clock,
  Hash,
  FileText,
  Upload,
  Search,
  Table,
  BarChart3,
  CreditCard,
  Tag,
  TrendingUp,
  Minus,
  Square,
  Maximize2,
  X,
  Bell,
  AlertCircle,
  Globe,
  RefreshCw,
  Save,
  FileSpreadsheet,
  ArrowRight,
  ArrowLeft,
  Zap,
  LucideIcon,
} from 'lucide-react';

// 아이콘 이름 → 컴포넌트 매핑
const ICON_MAP: Record<string, LucideIcon> = {
  // Form Controls
  MousePointer,
  Type,
  List,
  CheckSquare,
  Circle,
  Calendar,
  Clock,
  Hash,
  FileText,
  Upload,
  Search,
  
  // Data Display
  Table,
  BarChart3,
  CreditCard,
  Tag,
  TrendingUp,
  
  // Layout
  Minus,
  Square,
  
  // Actions
  Maximize2,
  X,
  Bell,
  AlertCircle,
  Globe,
  RefreshCw,
  Save,
  FileSpreadsheet,
  ArrowRight,
  ArrowLeft,
  Zap,
};

// 기본 아이콘 (찾지 못했을 때)
const DEFAULT_ICON = Square;

/**
 * 아이콘 이름을 Lucide 컴포넌트로 변환
 */
export function getIconComponent(iconName: string): LucideIcon {
  return ICON_MAP[iconName] || DEFAULT_ICON;
}

/**
 * 아이콘 이름이 유효한지 확인
 */
export function isValidIconName(iconName: string): boolean {
  return iconName in ICON_MAP;
}

/**
 * 사용 가능한 아이콘 이름 목록
 */
export function getAvailableIconNames(): string[] {
  return Object.keys(ICON_MAP);
}

export default getIconComponent;
