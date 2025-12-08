/**
 * Icon Select - 아이콘 미리보기가 있는 셀렉트 컴포넌트
 */

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { getIconComponent, getAvailableIconNames } from '@/utils/iconMapper';
import { cn } from '@/lib/utils';

interface IconSelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function IconSelect({ value, onChange, className }: IconSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [dropdownPosition, setDropdownPosition] = useState<'left' | 'right'>('right');
  const containerRef = useRef<HTMLDivElement>(null);
  const availableIcons = getAvailableIconNames();

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 드롭다운 위치 계산 - 스크롤 가능한 부모 컨테이너 기준
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const dropdownWidth = 288; // w-72 = 18rem = 288px
      
      // 가장 가까운 스크롤 컨테이너 또는 다이얼로그 찾기
      const scrollParent = containerRef.current.closest('[role="dialog"], .overflow-y-auto, .overflow-auto') as HTMLElement;
      
      if (scrollParent) {
        const parentRect = scrollParent.getBoundingClientRect();
        // 우측 공간 계산 (부모 컨테이너 기준)
        const rightSpace = parentRect.right - rect.left;
        // 좌측 공간 계산
        const leftSpace = rect.right - parentRect.left;
        
        if (rightSpace < dropdownWidth && leftSpace >= dropdownWidth) {
          setDropdownPosition('right');
        } else if (rightSpace >= dropdownWidth) {
          setDropdownPosition('left');
        } else {
          // 둘 다 부족하면 우측 정렬 (좌측으로 펼침)
          setDropdownPosition('right');
        }
      } else {
        // 스크롤 부모가 없으면 viewport 기준
        const viewportWidth = window.innerWidth;
        if (rect.left + dropdownWidth > viewportWidth - 20) {
          setDropdownPosition('right');
        } else {
          setDropdownPosition('left');
        }
      }
    }
  }, [isOpen]);

  // 필터링된 아이콘
  const filteredIcons = availableIcons.filter(icon =>
    icon.toLowerCase().includes(search.toLowerCase())
  );

  // 현재 선택된 아이콘
  const SelectedIcon = getIconComponent(value);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-10 px-3 flex items-center justify-between gap-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <div className="flex items-center gap-2">
          <SelectedIcon className="w-4 h-4 text-gray-600" />
          <span className="text-sm">{value}</span>
        </div>
        <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform", isOpen && "rotate-180")} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div 
          className={cn(
            "absolute z-[100] mt-1 w-72 max-h-96 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden",
            dropdownPosition === 'right' ? 'right-0' : 'left-0'
          )}
        >
          {/* Search */}
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="아이콘 검색..."
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                autoFocus
              />
            </div>
          </div>

          {/* Icon Grid */}
          <div className="max-h-72 overflow-y-auto p-2">
            <div className="grid grid-cols-3 gap-2">
              {filteredIcons.map(iconName => {
                const Icon = getIconComponent(iconName);
                const isSelected = iconName === value;
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => {
                      onChange(iconName);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={cn(
                      "flex flex-col items-center gap-1.5 p-3 rounded hover:bg-gray-100 transition-colors",
                      isSelected && "bg-blue-100 hover:bg-blue-100"
                    )}
                    title={iconName}
                  >
                    <Icon className={cn("w-6 h-6", isSelected ? "text-blue-600" : "text-gray-600")} />
                    <span className={cn(
                      "text-xs text-center leading-tight",
                      isSelected ? "text-blue-600 font-medium" : "text-gray-500"
                    )}>
                      {iconName}
                    </span>
                  </button>
                );
              })}
            </div>

            {filteredIcons.length === 0 && (
              <div className="text-center py-4 text-gray-500 text-sm">
                검색 결과가 없습니다
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default IconSelect;
