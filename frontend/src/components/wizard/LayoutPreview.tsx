import { LayoutType } from '@/types/wizard.types';

interface LayoutPreviewProps {
  type: LayoutType;
  className?: string;
}

export function LayoutPreview({ type, className = '' }: LayoutPreviewProps) {
  const previews = {
    'search-grid': (
      <svg viewBox="0 0 200 150" className={className} fill="none">
        {/* Search Bar */}
        <rect x="10" y="10" width="180" height="15" rx="2" fill="#E5E7EB" />
        {/* Grid Header */}
        <rect x="10" y="35" width="180" height="10" rx="1" fill="#D1D5DB" />
        {/* Grid Rows */}
        <rect x="10" y="50" width="180" height="8" rx="1" fill="#E5E7EB" />
        <rect x="10" y="62" width="180" height="8" rx="1" fill="#E5E7EB" />
        <rect x="10" y="74" width="180" height="8" rx="1" fill="#E5E7EB" />
        <rect x="10" y="86" width="180" height="8" rx="1" fill="#E5E7EB" />
        <rect x="10" y="98" width="180" height="8" rx="1" fill="#E5E7EB" />
      </svg>
    ),
    'master-detail': (
      <svg viewBox="0 0 200 150" className={className} fill="none">
        {/* Master List (Left) */}
        <rect x="10" y="10" width="85" height="130" rx="2" fill="#E5E7EB" />
        <rect x="15" y="15" width="75" height="12" rx="1" fill="#D1D5DB" />
        <rect x="15" y="32" width="75" height="12" rx="1" fill="#F3F4F6" />
        <rect x="15" y="49" width="75" height="12" rx="1" fill="#F3F4F6" />
        <rect x="15" y="66" width="75" height="12" rx="1" fill="#F3F4F6" />
        
        {/* Detail Panel (Right) */}
        <rect x="105" y="10" width="85" height="130" rx="2" fill="#F3F4F6" />
        <rect x="110" y="15" width="75" height="15" rx="1" fill="#D1D5DB" />
        <rect x="110" y="35" width="75" height="8" rx="1" fill="#E5E7EB" />
        <rect x="110" y="48" width="75" height="8" rx="1" fill="#E5E7EB" />
        <rect x="110" y="61" width="75" height="8" rx="1" fill="#E5E7EB" />
      </svg>
    ),
    'dashboard': (
      <svg viewBox="0 0 200 150" className={className} fill="none">
        {/* KPI Cards (Top Row) */}
        <rect x="10" y="10" width="55" height="35" rx="2" fill="#E5E7EB" />
        <rect x="72" y="10" width="55" height="35" rx="2" fill="#E5E7EB" />
        <rect x="135" y="10" width="55" height="35" rx="2" fill="#E5E7EB" />
        
        {/* Charts (Bottom Row) */}
        <rect x="10" y="55" width="85" height="85" rx="2" fill="#F3F4F6" />
        <rect x="105" y="55" width="85" height="85" rx="2" fill="#F3F4F6" />
        
        {/* Chart Indicators */}
        <circle cx="50" cy="97" r="25" stroke="#D1D5DB" strokeWidth="2" />
        <rect x="115" y="65" width="65" height="60" fill="#E5E7EB" opacity="0.5" />
      </svg>
    ),
    'kanban': (
      <svg viewBox="0 0 200 150" className={className} fill="none">
        {/* Column 1 */}
        <rect x="10" y="10" width="55" height="130" rx="2" fill="#F3F4F6" />
        <rect x="15" y="15" width="45" height="12" rx="1" fill="#D1D5DB" />
        <rect x="15" y="32" width="45" height="20" rx="2" fill="#E5E7EB" />
        <rect x="15" y="57" width="45" height="20" rx="2" fill="#E5E7EB" />
        
        {/* Column 2 */}
        <rect x="72" y="10" width="55" height="130" rx="2" fill="#F3F4F6" />
        <rect x="77" y="15" width="45" height="12" rx="1" fill="#D1D5DB" />
        <rect x="77" y="32" width="45" height="20" rx="2" fill="#E5E7EB" />
        
        {/* Column 3 */}
        <rect x="135" y="10" width="55" height="130" rx="2" fill="#F3F4F6" />
        <rect x="140" y="15" width="45" height="12" rx="1" fill="#D1D5DB" />
        <rect x="140" y="32" width="45" height="20" rx="2" fill="#E5E7EB" />
        <rect x="140" y="57" width="45" height="20" rx="2" fill="#E5E7EB" />
        <rect x="140" y="82" width="45" height="20" rx="2" fill="#E5E7EB" />
      </svg>
    ),
    'form': (
      <svg viewBox="0 0 200 150" className={className} fill="none">
        {/* Form Title */}
        <rect x="10" y="10" width="180" height="18" rx="2" fill="#D1D5DB" />
        
        {/* Form Fields */}
        <rect x="10" y="38" width="60" height="8" rx="1" fill="#9CA3AF" />
        <rect x="10" y="50" width="180" height="12" rx="2" fill="#E5E7EB" />
        
        <rect x="10" y="72" width="60" height="8" rx="1" fill="#9CA3AF" />
        <rect x="10" y="84" width="180" height="12" rx="2" fill="#E5E7EB" />
        
        <rect x="10" y="106" width="60" height="8" rx="1" fill="#9CA3AF" />
        <rect x="10" y="118" width="180" height="12" rx="2" fill="#E5E7EB" />
      </svg>
    ),
  };

  return previews[type] || null;
}
