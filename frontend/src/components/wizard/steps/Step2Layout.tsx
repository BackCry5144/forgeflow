import { Step2Data, LayoutType, ComponentType } from '@/types/wizard.types';
import { Card } from '@/components/ui/card';
import { LayoutPreview } from '@/components/ui/layout-preview';
import { LAYOUT_TEMPLATES, LAYOUT_AREAS } from '@/data/layoutTemplates';
import { cn } from '@/lib/utils';
import { useResourcesFetch } from '@/hooks/useResources';
import { Loader2 } from 'lucide-react';

interface Step2LayoutProps {
  data: Step2Data;
  onChange: (data: Step2Data) => void;
}

export function Step2Layout({ data, onChange }: Step2LayoutProps) {
  // 동적 데이터 로드 (API에서)
  const { layouts: dbLayouts, loading, error } = useResourcesFetch();
  
  // 디버그 로그
  console.log('🔍 Step2Layout Debug:', {
    dbLayoutsCount: dbLayouts.length,
    dbLayouts: dbLayouts.map(l => l.id),
    loading,
    error,
  });
  
  // DB 데이터가 있으면 사용, 없으면 하드코딩 fallback
  const useDbData = dbLayouts.length > 0;
  
  // 레이아웃 목록 결정
  const layouts = useDbData 
    ? dbLayouts.map(l => ({
        id: l.id as LayoutType,
        name: l.name,
        description: l.description || '',
        htmlTemplate: l.html_template,
        areas: l.areas,
      }))
    : Object.values(LAYOUT_TEMPLATES);

  const handleLayoutSelect = (layoutId: LayoutType) => {
    // DB 데이터 사용 시 해당 layout의 areas 사용
    const selectedDbLayout = dbLayouts.find(l => l.id === layoutId);
    const areas = selectedDbLayout?.areas || LAYOUT_AREAS[layoutId] || [];
    
    onChange({ 
      selectedLayout: layoutId,
      layoutAreas: areas.map(a => ({
        id: a.id,
        name: a.name,
        description: a.description || '',
        suggestedComponents: (a.suggestedComponents || []) as ComponentType[],
      }))
    });
  };

  // 로딩 상태
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">레이아웃 로딩 중...</span>
      </div>
    );
  }

  // 에러 상태 (fallback 사용)
  if (error && !useDbData) {
    console.warn('Using fallback layout data:', error);
  }

  // 선택된 레이아웃 정보 가져오기
  const selectedLayoutName = useDbData
    ? dbLayouts.find(l => l.id === data.selectedLayout)?.name
    : data.selectedLayout ? LAYOUT_TEMPLATES[data.selectedLayout]?.name : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">레이아웃 선택</h2>
        <p className="text-gray-600">MES 생산관리 시스템에 적합한 레이아웃을 선택하세요</p>
        {useDbData && (
          <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded">
            DB 데이터 사용 중
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-3 gap-6">
        {layouts.map((layout) => (
          <Card
            key={layout.id}
            className={cn(
              'relative cursor-pointer transition-all hover:shadow-lg border-2',
              data.selectedLayout === layout.id
                ? 'border-blue-600 shadow-lg bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            )}
            onClick={() => handleLayoutSelect(layout.id)}
          >
            <div className="absolute top-4 right-4 z-10">
              <div
                className={cn(
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                  data.selectedLayout === layout.id
                    ? 'border-blue-600 bg-blue-600'
                    : 'border-gray-300 bg-white'
                )}
              >
                {data.selectedLayout === layout.id && (
                  <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                )}
              </div>
            </div>

            <div className="p-6">
              <div className="mb-4 bg-white rounded-lg border border-gray-200 overflow-hidden h-[180px]">
                <LayoutPreview layoutId={layout.id} height="h-full" />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {layout.name}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {layout.description}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {data.selectedLayout && selectedLayoutName && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-medium text-blue-900">
                {selectedLayoutName} 레이아웃 선택됨
              </p>
              <p className="text-sm text-blue-700 mt-1">
                미리 정의된 HTML 템플릿이 적용됩니다.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}