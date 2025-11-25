import { Step2Data, LayoutType } from '@/types/wizard.types';
import { Card } from '@/components/ui/card';
import { LayoutPreview } from '../LayoutPreview';
import { LAYOUT_TEMPLATES, LAYOUT_AREAS } from '@/data/layoutTemplates';
import { cn } from '@/lib/utils';

interface Step2LayoutProps {
  data: Step2Data;
  onChange: (data: Step2Data) => void;
}

export function Step2Layout({ data, onChange }: Step2LayoutProps) {
  const layouts = Object.values(LAYOUT_TEMPLATES);

  const handleLayoutSelect = (layoutId: LayoutType) => {
    onChange({ 
      selectedLayout: layoutId,
      layoutAreas: LAYOUT_AREAS[layoutId]
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">레이아웃 선택</h2>
        <p className="text-gray-600">MES 생산관리 시스템에 적합한 레이아웃을 선택하세요</p>
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
              <div className="mb-4 bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-center h-[180px]">
                <LayoutPreview type={layout.id} className="w-full h-full" />
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

      {data.selectedLayout && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-medium text-blue-900">
                {LAYOUT_TEMPLATES[data.selectedLayout].name} 레이아웃 선택됨
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