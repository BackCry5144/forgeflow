/**
 * Layout Preview - 레이아웃 미리보기 공통 컴포넌트
 * 레이아웃 관리 페이지와 Wizard에서 동일하게 사용
 */

import { LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LayoutPreviewProps {
  layoutId: string;
  className?: string;
  /** 미리보기 컨테이너 높이 (기본: h-24) */
  height?: string;
}

/**
 * 레이아웃 ID에 따른 미리보기를 렌더링합니다.
 * 하드코딩된 미리보기이며, 새 레이아웃 추가 시 여기에 추가 필요
 */
export function LayoutPreview({ layoutId, className, height = 'h-24' }: LayoutPreviewProps) {
  const renderPreview = () => {
    switch (layoutId) {
      case 'search-grid':
        return (
          <div className="w-full h-full flex flex-col gap-1 p-2">
            <div className="h-8 bg-blue-200 rounded text-xs flex items-center justify-center text-blue-700 font-medium">
              검색 영역
            </div>
            <div className="h-4 bg-gray-200 rounded flex items-center px-2">
              <div className="flex gap-1">
                <div className="w-6 h-2 bg-gray-400 rounded"></div>
                <div className="w-6 h-2 bg-gray-400 rounded"></div>
              </div>
            </div>
            <div className="flex-1 bg-blue-100 rounded text-xs flex items-center justify-center text-blue-600">
              데이터 그리드
            </div>
          </div>
        );

      case 'master-detail':
        return (
          <div className="w-full h-full flex gap-1 p-2">
            <div className="w-2/5 bg-blue-200 rounded flex flex-col gap-1 p-1">
              <div className="h-4 bg-blue-400 rounded text-[10px] flex items-center justify-center text-white">
                마스터
              </div>
              <div className="flex-1 bg-blue-100 rounded space-y-0.5 p-0.5">
                <div className="h-2 bg-blue-300 rounded"></div>
                <div className="h-2 bg-blue-300 rounded"></div>
                <div className="h-2 bg-blue-300 rounded"></div>
              </div>
            </div>
            <div className="flex-1 bg-gray-100 rounded flex flex-col gap-1 p-1">
              <div className="h-4 bg-gray-400 rounded text-[10px] flex items-center justify-center text-white">
                상세
              </div>
              <div className="flex-1 bg-gray-50 rounded space-y-0.5 p-0.5">
                <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                <div className="h-2 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        );

      case 'dashboard':
        return (
          <div className="w-full h-full flex flex-col gap-1 p-2">
            <div className="flex gap-1 h-6">
              <div className="flex-1 bg-green-200 rounded text-[9px] flex items-center justify-center text-green-700">
                KPI
              </div>
              <div className="flex-1 bg-blue-200 rounded text-[9px] flex items-center justify-center text-blue-700">
                KPI
              </div>
              <div className="flex-1 bg-purple-200 rounded text-[9px] flex items-center justify-center text-purple-700">
                KPI
              </div>
            </div>
            <div className="flex gap-1 flex-1">
              <div className="flex-1 bg-blue-100 rounded flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-300 rounded-full border-t-blue-500"></div>
              </div>
              <div className="flex-1 bg-green-100 rounded flex flex-col justify-end p-1 gap-0.5">
                <div className="flex gap-0.5 items-end h-full">
                  <div className="flex-1 bg-green-300 rounded-t h-1/2"></div>
                  <div className="flex-1 bg-green-400 rounded-t h-3/4"></div>
                  <div className="flex-1 bg-green-300 rounded-t h-1/3"></div>
                  <div className="flex-1 bg-green-500 rounded-t h-full"></div>
                </div>
              </div>
            </div>
            <div className="h-6 bg-gray-100 rounded text-[9px] flex items-center justify-center text-gray-500">
              테이블
            </div>
          </div>
        );

      case 'kanban':
        return (
          <div className="w-full h-full flex flex-col gap-1 p-2">
            <div className="h-4 bg-gray-200 rounded text-[9px] flex items-center justify-center text-gray-600">
              헤더
            </div>
            <div className="flex-1 flex gap-1">
              <div className="flex-1 bg-yellow-100 rounded p-1">
                <div className="h-3 bg-yellow-300 rounded mb-1 text-[8px] flex items-center justify-center">
                  대기
                </div>
                <div className="space-y-0.5">
                  <div className="h-2 bg-yellow-200 rounded"></div>
                  <div className="h-2 bg-yellow-200 rounded"></div>
                </div>
              </div>
              <div className="flex-1 bg-blue-100 rounded p-1">
                <div className="h-3 bg-blue-300 rounded mb-1 text-[8px] flex items-center justify-center">
                  진행
                </div>
                <div className="space-y-0.5">
                  <div className="h-2 bg-blue-200 rounded"></div>
                </div>
              </div>
              <div className="flex-1 bg-green-100 rounded p-1">
                <div className="h-3 bg-green-300 rounded mb-1 text-[8px] flex items-center justify-center">
                  완료
                </div>
                <div className="space-y-0.5">
                  <div className="h-2 bg-green-200 rounded"></div>
                  <div className="h-2 bg-green-200 rounded"></div>
                  <div className="h-2 bg-green-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'form':
        return (
          <div className="w-full h-full flex flex-col gap-1 p-2">
            <div className="h-5 bg-gray-300 rounded text-[10px] flex items-center px-2 text-gray-700 font-medium">
              폼 제목
            </div>
            <div className="flex-1 bg-gray-50 rounded p-2 space-y-1">
              <div className="flex gap-2 items-center">
                <div className="w-10 h-2 bg-gray-400 rounded"></div>
                <div className="flex-1 h-3 bg-gray-200 rounded"></div>
              </div>
              <div className="flex gap-2 items-center">
                <div className="w-10 h-2 bg-gray-400 rounded"></div>
                <div className="flex-1 h-3 bg-gray-200 rounded"></div>
              </div>
              <div className="flex gap-2 items-center">
                <div className="w-10 h-2 bg-gray-400 rounded"></div>
                <div className="flex-1 h-3 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div className="h-5 flex gap-1 justify-end">
              <div className="w-12 bg-blue-500 rounded text-[9px] flex items-center justify-center text-white">
                저장
              </div>
              <div className="w-12 bg-gray-300 rounded text-[9px] flex items-center justify-center text-gray-700">
                취소
              </div>
            </div>
          </div>
        );

      default:
        // 알 수 없는 레이아웃 - 기본 미리보기
        return (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 rounded text-gray-400">
            <LayoutGrid className="w-8 h-8 mb-1" />
            <span className="text-xs">{layoutId}</span>
          </div>
        );
    }
  };

  return (
    <div className={cn("w-full bg-white border rounded-lg overflow-hidden", height, className)}>
      {renderPreview()}
    </div>
  );
}

export default LayoutPreview;
