import { WizardData } from '@/types/wizard.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Zap } from 'lucide-react';
import { getTriggerEventLabel } from '@/data/componentTriggers';
import { getComponentDefinition } from '@/data/componentLibrary';
import { useResources } from '@/hooks/useResources';

interface Step5ReviewProps {
  data: WizardData;
}

export function Step5Review({ data }: Step5ReviewProps) {
  const { actions: dbActions } = useResources();
  
  // 액션 이름 가져오기 헬퍼
  const getActionName = (actionId: string): string => {
    const action = dbActions.find(a => a.id === actionId);
    return action?.name || actionId;
  };
  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">최종 검토</h2>
        <p className="mt-2 text-gray-600">입력한 내용을 확인하고 프로토타입을 생성하세요</p>
      </div>

      {/* Summary Cards */}
      <div className="space-y-4">
        {/* Step 1 Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              화면 개요
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm font-medium text-gray-500">화면명</p>
              <p className="text-base text-gray-900">{data.step1.screenName || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">설명</p>
              <p className="text-base text-gray-900">{data.step1.description || '-'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Step 2 Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              레이아웃
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <p className="text-sm font-medium text-gray-500">선택된 레이아웃</p>
              <p className="text-base text-gray-900">
                {data.step2.selectedLayout
                  ? data.step2.selectedLayout === 'search-grid'
                    ? '조회형 (Search + Grid)'
                    : data.step2.selectedLayout === 'master-detail'
                    ? '마스터-디테일'
                    : '대시보드'
                  : '-'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Step 3 Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              컴포넌트 ({data.step3.components.length}개)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.step3.components.length === 0 ? (
              <p className="text-gray-400 text-sm">추가된 컴포넌트 없음</p>
            ) : (
              <div className="space-y-2">
                {data.step3.components.map((comp) => (
                  <div key={comp.id} className="flex items-center gap-2 text-sm">
                    <span className="text-blue-600">•</span>
                    <span className="font-medium">{comp.label}</span>
                    <span className="text-gray-500">({comp.type})</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 4 Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              인터랙션 ({data.step4.interactions.length}개)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.step4.interactions.length === 0 ? (
              <p className="text-gray-400 text-sm">정의된 인터랙션 없음</p>
            ) : (
              <div className="space-y-3">
                {data.step4.interactions.map((interaction) => {
                  const triggerComponent = data.step3.components.find(c => c.id === interaction.triggerComponentId);
                  const targetArea = interaction.targetAreaId 
                    ? data.step2.layoutAreas.find(a => a.id === interaction.targetAreaId)
                    : null;
                  const compDef = triggerComponent ? getComponentDefinition(triggerComponent.type) : null;
                  const CompIcon = compDef?.icon;
                  
                  return (
                    <div key={interaction.id} className="bg-gray-50 p-3 rounded-lg text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                          WHEN
                        </span>
                        <div className="flex items-center gap-1">
                          {CompIcon && <CompIcon className="w-3 h-3" />}
                          <span>{triggerComponent?.label}</span>
                          <span className="text-gray-500">
                            {getTriggerEventLabel(interaction.triggerEvent)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded">
                          DO
                        </span>
                        <span>
                          {getActionName(interaction.actionType)}
                          {targetArea && ` → ${targetArea.name}`}
                        </span>
                      </div>
                      {interaction.modalConfig && (
                        <div className="mt-1 text-xs text-purple-700 bg-purple-100 px-2 py-1 rounded space-y-1">
                          <div className="flex items-center gap-2 font-medium">
                            <Zap className="w-3 h-3" />
                            <span>모달: {interaction.modalConfig.title}</span>
                          </div>
                          <div className="flex items-center gap-2 text-purple-600">
                            <span>
                              크기: {
                                interaction.modalConfig.size === 'sm' ? '작게 (400px)' :
                                interaction.modalConfig.size === 'md' ? '중간 (600px)' :
                                interaction.modalConfig.size === 'lg' ? '크게 (800px)' :
                                interaction.modalConfig.size === 'xl' ? '매우 크게 (1200px)' :
                                interaction.modalConfig.size === 'full' ? '전체 화면' : interaction.modalConfig.size
                              }
                            </span>
                            <span className="text-purple-500">|</span>
                            <span>
                              타입: {
                                interaction.modalConfig.type === 'form' ? '입력 폼' :
                                interaction.modalConfig.type === 'detail' ? '상세 정보' :
                                interaction.modalConfig.type === 'confirm' ? '확인 대화상자' :
                                interaction.modalConfig.type === 'custom' ? '커스텀' : interaction.modalConfig.type
                              }
                            </span>
                          </div>
                          {interaction.modalConfig.fields && interaction.modalConfig.fields.length > 0 && (
                            <div className="text-purple-600">
                              필드: {interaction.modalConfig.fields.map(f => f.label).join(', ')}
                            </div>
                          )}
                          {interaction.modalConfig.content && (
                            <div className="text-purple-600">
                              내용: {interaction.modalConfig.content}
                            </div>
                          )}
                        </div>
                      )}
                      {interaction.description && (
                        <div className="text-xs text-gray-500 mt-1 italic">
                          "{interaction.description}"
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Info Box */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-blue-900 mb-1">프로토타입 생성 준비 완료</p>
              <p className="text-sm text-blue-700">
                '프로토타입 생성' 버튼을 클릭하면 입력한 내용을 바탕으로 AI가 HTML 프로토타입을 생성합니다.
                예상 생성 시간은 약 10~30초입니다.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
