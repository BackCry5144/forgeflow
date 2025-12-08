import React, { useState, useMemo } from 'react';
import { Plus, X, ArrowRight, Zap, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Step4Data, ActionType, Interaction, Component, LayoutArea, TriggerEventType, ModalConfig, ModalField } from '@/types/wizard.types';
import { getComponentDefinition } from '@/data/componentLibrary';
import { 
  getComponentTriggerEvents, 
  getTriggerEventLabel, 
  getTriggerEventDescription,
  isInteractable 
} from '@/data/componentTriggers';
import { useResources } from '@/hooks/useResources';
import { getIconComponent } from '@/utils/iconMapper';

// 액션에 대상 영역이 필요한지 판단하는 함수
const needsTargetArea = (actionId: string): boolean => {
  return ['fetch-data', 'clear', 'validate'].includes(actionId);
};

// 액션에 모달 설정이 필요한지 판단하는 함수
const needsModalConfiguration = (actionId: string): boolean => {
  return ['open-modal'].includes(actionId);
};

interface Step4InteractionsProps {
  data: Step4Data;
  onChange: (data: Step4Data) => void;
  components: Component[];
  layoutAreas: LayoutArea[];
}

const Step4Interactions: React.FC<Step4InteractionsProps> = ({ data, onChange, components, layoutAreas }) => {
  // DB에서 액션 목록 가져오기
  const { actions: dbActions } = useResources();
  
  const [triggerComponentId, setTriggerComponentId] = useState<string>('');
  const [triggerEvent, setTriggerEvent] = useState<TriggerEventType>('click');
  const [actionType, setActionType] = useState<ActionType>('fetch-data');
  const [targetAreaId, setTargetAreaId] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  
  // 모달 설정 상태
  const [modalTitle, setModalTitle] = useState<string>('');
  const [modalSize, setModalSize] = useState<'sm' | 'md' | 'lg' | 'xl' | 'full'>('md');
  const [modalType, setModalType] = useState<'form' | 'detail' | 'confirm' | 'custom'>('form');
  const [modalContent, setModalContent] = useState<string>('');
  const [modalFields, setModalFields] = useState<ModalField[]>([]);

  // 활성화된 액션만 필터링하고 정렬
  const activeActions = useMemo(() => {
    return dbActions
      .filter(a => a.is_active)
      .sort((a, b) => parseInt(a.sort_order || '0') - parseInt(b.sort_order || '0'));
  }, [dbActions]);

  // 인터랙션 가능한 컴포넌트만 필터링
  const interactableComponents = components.filter(c => isInteractable(c.type));
  const selectedComponent = components.find(c => c.id === triggerComponentId);
  const availableEvents = selectedComponent ? getComponentTriggerEvents(selectedComponent.type) : [];
  const selectedAction = activeActions.find(a => a.id === actionType);

  const handleAddInteraction = () => {
    if (!triggerComponentId || !actionType) return;
    const needsTarget = needsTargetArea(actionType);
    const needsModal = needsModalConfiguration(actionType);
    
    if (needsTarget && !targetAreaId) return;
    if (needsModal && !modalTitle.trim()) return;

    let modalConfig: ModalConfig | undefined;
    if (needsModal) {
      modalConfig = {
        id: `modal-${Date.now()}`,
        title: modalTitle,
        size: modalSize,
        type: modalType,
        fields: modalType === 'form' ? modalFields : undefined,
        content: modalContent.trim() || undefined,
      };
    }

    const newInteraction: Interaction = {
      id: Date.now().toString(),
      triggerComponentId,
      triggerEvent,
      actionType,
      targetAreaId: needsTarget ? targetAreaId : undefined,
      modalConfig,
      description: description.trim() || undefined,
    };

    onChange({ interactions: [...data.interactions, newInteraction] });
    
    // Reset form
    setTriggerComponentId('');
    setTriggerEvent('click');
    setActionType('fetch-data');
    setTargetAreaId('');
    setDescription('');
    setModalTitle('');
    setModalSize('md');
    setModalType('form');
    setModalContent('');
    setModalFields([]);
  };
  
  const handleComponentChange = (componentId: string) => {
    setTriggerComponentId(componentId);
    const comp = components.find(c => c.id === componentId);
    if (comp) {
      const events = getComponentTriggerEvents(comp.type);
      setTriggerEvent(events[0] || 'click');
    }
  };
  
  const handleAddModalField = () => {
    const newField: ModalField = {
      id: `field-${Date.now()}`,
      label: '',
      type: 'textbox',
      required: false,
    };
    setModalFields([...modalFields, newField]);
  };
  
  const handleUpdateModalField = (id: string, updates: Partial<ModalField>) => {
    setModalFields(modalFields.map(f => f.id === id ? { ...f, ...updates } : f));
  };
  
  const handleRemoveModalField = (id: string) => {
    setModalFields(modalFields.filter(f => f.id !== id));
  };

  const handleRemoveInteraction = (id: string) => {
    onChange({ interactions: data.interactions.filter(i => i.id !== id) });
  };

  const getComponentInfo = (componentId: string) => {
    const component = components.find(c => c.id === componentId);
    const area = component ? layoutAreas.find(a => a.id === component.areaId) : null;
    return { component, area };
  };

  const getAreaInfo = (areaId: string | undefined) => {
    return areaId ? layoutAreas.find(a => a.id === areaId) : null;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              인터랙션 추가
            </CardTitle>
            <CardDescription>
              컴포넌트에 이벤트와 액션을 정의합니다
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 1. 트리거 컴포넌트 선택 */}
            <div className="space-y-2">
              <Label>트리거 컴포넌트</Label>
              <Select value={triggerComponentId} onValueChange={handleComponentChange}>
                <SelectTrigger>
                  <SelectValue placeholder="컴포넌트 선택">
                    {triggerComponentId && selectedComponent && (() => {
                      const area = layoutAreas.find(a => a.id === selectedComponent.areaId);
                      const compDef = getComponentDefinition(selectedComponent.type);
                      const Icon = compDef?.icon;
                      return (
                        <div className="flex items-center gap-2">
                          {Icon && <Icon className="w-4 h-4" />}
                          <span>{selectedComponent.label}</span>
                          <span className="text-xs text-gray-500">({area?.name})</span>
                        </div>
                      );
                    })()}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {interactableComponents.length === 0 ? (
                    <div className="px-2 py-3 text-sm text-gray-500 text-center">
                      <AlertCircle className="w-4 h-4 mx-auto mb-1" />
                      인터랙션 가능한 컴포넌트가 없습니다
                    </div>
                  ) : (
                    <>
                      <div className="px-2 py-1 text-xs font-semibold text-gray-500">Form Controls</div>
                      {interactableComponents
                        .filter(c => ['button', 'textbox', 'codeview', 'combo', 'checkbox', 'radio', 'date-picker', 'time-picker', 'number-input', 'textarea', 'file-upload'].includes(c.type))
                        .map(comp => {
                          const area = layoutAreas.find(a => a.id === comp.areaId);
                          const compDef = getComponentDefinition(comp.type);
                          const Icon = compDef?.icon;
                          return (
                            <SelectItem key={comp.id} value={comp.id}>
                              <div className="flex items-center gap-2">
                                {Icon && <Icon className="w-4 h-4" />}
                                <span>{comp.label}</span>
                                <span className="text-xs text-gray-500">({area?.name})</span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      
                      {interactableComponents.some(c => ['grid', 'chart', 'card', 'badge', 'progress-bar'].includes(c.type)) && (
                        <>
                          <div className="px-2 py-1 text-xs font-semibold text-gray-500 mt-2">Data Display</div>
                          {interactableComponents
                            .filter(c => ['grid', 'chart', 'card', 'badge', 'progress-bar'].includes(c.type))
                            .map(comp => {
                              const area = layoutAreas.find(a => a.id === comp.areaId);
                              const compDef = getComponentDefinition(comp.type);
                              const Icon = compDef?.icon;
                              return (
                                <SelectItem key={comp.id} value={comp.id}>
                                  <div className="flex items-center gap-2">
                                    {Icon && <Icon className="w-4 h-4" />}
                                    <span>{comp.label}</span>
                                    <span className="text-xs text-gray-500">({area?.name})</span>
                                  </div>
                                </SelectItem>
                              );
                            })}
                        </>
                      )}
                      
                      {interactableComponents.some(c => ['label'].includes(c.type)) && (
                        <>
                          <div className="px-2 py-1 text-xs font-semibold text-gray-500 mt-2">Others</div>
                          {interactableComponents
                            .filter(c => ['label'].includes(c.type))
                            .map(comp => {
                              const area = layoutAreas.find(a => a.id === comp.areaId);
                              const compDef = getComponentDefinition(comp.type);
                              const Icon = compDef?.icon;
                              return (
                                <SelectItem key={comp.id} value={comp.id}>
                                  <div className="flex items-center gap-2">
                                    {Icon && <Icon className="w-4 h-4" />}
                                    <span>{comp.label}</span>
                                    <span className="text-xs text-gray-500">({area?.name})</span>
                                  </div>
                                </SelectItem>
                              );
                            })}
                        </>
                      )}
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* 2. 트리거 이벤트 선택 */}
            {triggerComponentId && availableEvents.length > 0 && (
              <div className="space-y-2">
                <Label>트리거 이벤트</Label>
                <RadioGroup value={triggerEvent} onValueChange={(v) => setTriggerEvent(v as TriggerEventType)}>
                  <div className="space-y-2">
                    {availableEvents.map(event => (
                      <div key={event} className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-gray-50">
                        <RadioGroupItem value={event} id={`event-${event}`} />
                        <Label htmlFor={`event-${event}`} className="cursor-pointer flex-1">
                          {getTriggerEventLabel(event)}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
                
                <div className="p-2 bg-blue-50 rounded text-xs text-blue-700 flex items-start gap-2">
                  <span>💡</span>
                  <span>{getTriggerEventDescription(selectedComponent?.type || 'button', triggerEvent)}</span>
                </div>
              </div>
            )}

            {/* 3. 액션 타입 선택 */}
            <div className="space-y-2">
              <Label>액션 타입</Label>
              <RadioGroup value={actionType} onValueChange={(v) => setActionType(v as ActionType)}>
                <div className="space-y-2">
                  {activeActions.map(action => {
                    const Icon = getIconComponent(action.icon || 'Zap');
                    const categoryColor = action.category === 'data' ? 'text-blue-500' : 
                                          action.category === 'ui' ? 'text-purple-500' : 'text-green-500';
                    return (
                      <div key={action.id} className="flex items-start space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                        <RadioGroupItem value={action.id} id={action.id} />
                        <div className="flex-1">
                          <Label htmlFor={action.id} className="flex items-center gap-2 cursor-pointer font-medium">
                            <Icon className={`w-4 h-4 ${categoryColor}`} />
                            {action.name}
                          </Label>
                          <p className="text-xs text-gray-500 mt-1">{action.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </RadioGroup>
            </div>

            {/* 4. 대상 영역 (조건부) */}
            {needsTargetArea(actionType) && (
              <div className="space-y-2">
                <Label>대상 영역</Label>
                <Select value={targetAreaId} onValueChange={setTargetAreaId}>
                  <SelectTrigger>
                    <SelectValue placeholder="영역 선택">
                      {targetAreaId && (() => {
                        const area = layoutAreas.find(a => a.id === targetAreaId);
                        return area ? (
                          <div className="flex items-center gap-2">
                            <span>🎯</span>
                            <span>{area.name}</span>
                          </div>
                        ) : null;
                      })()}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {layoutAreas.map(area => (
                      <SelectItem key={area.id} value={area.id}>
                        🎯 {area.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* 5. 모달 설정 (open-modal 선택 시) */}
            {needsModalConfiguration(actionType) && (
              <div className="space-y-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 text-sm font-semibold text-purple-900">
                  <Zap className="w-4 h-4" />
                  모달 설정
                </div>
                
                {/* 모달 제목 */}
                <div className="space-y-2">
                  <Label>모달 제목 *</Label>
                  <Input
                    type="text"
                    placeholder="예: 상세 정보"
                    value={modalTitle}
                    onChange={(e) => setModalTitle(e.target.value)}
                  />
                </div>
                
                {/* 모달 크기 */}
                <div className="space-y-2">
                  <Label>모달 크기</Label>
                  <Select value={modalSize} onValueChange={(v) => setModalSize(v as any)}>
                    <SelectTrigger>
                      <SelectValue>
                        {modalSize === 'sm' && '작게 (400px)'}
                        {modalSize === 'md' && '중간 (600px)'}
                        {modalSize === 'lg' && '크게 (800px)'}
                        {modalSize === 'xl' && '매우 크게 (1200px)'}
                        {modalSize === 'full' && '전체 화면'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sm">작게 (400px)</SelectItem>
                      <SelectItem value="md">중간 (600px)</SelectItem>
                      <SelectItem value="lg">크게 (800px)</SelectItem>
                      <SelectItem value="xl">매우 크게 (1200px)</SelectItem>
                      <SelectItem value="full">전체 화면</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* 모달 타입 */}
                <div className="space-y-2">
                  <Label>모달 타입</Label>
                  <RadioGroup value={modalType} onValueChange={(v) => setModalType(v as any)}>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 p-2 border rounded bg-white">
                        <RadioGroupItem value="form" id="modal-form" />
                        <Label htmlFor="modal-form" className="cursor-pointer flex-1">
                          📝 입력 폼 (데이터 입력/수정)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-2 border rounded bg-white">
                        <RadioGroupItem value="detail" id="modal-detail" />
                        <Label htmlFor="modal-detail" className="cursor-pointer flex-1">
                          📋 상세 정보 (읽기 전용)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-2 border rounded bg-white">
                        <RadioGroupItem value="confirm" id="modal-confirm" />
                        <Label htmlFor="modal-confirm" className="cursor-pointer flex-1">
                          ⚠️ 확인 대화상자 (예/아니오)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-2 border rounded bg-white">
                        <RadioGroupItem value="custom" id="modal-custom" />
                        <Label htmlFor="modal-custom" className="cursor-pointer flex-1">
                          🎨 커스텀 (자유 구성)
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
                
                {/* 모달 내용 (confirm/custom 타입) */}
                {(modalType === 'confirm' || modalType === 'custom' || modalType === 'detail') && (
                  <div className="space-y-2">
                    <Label>모달 내용</Label>
                    <Textarea
                      placeholder="모달에 표시할 메시지나 설명을 입력하세요"
                      value={modalContent}
                      onChange={(e) => setModalContent(e.target.value)}
                      rows={3}
                    />
                  </div>
                )}
                
                {/* 폼 필드 (form 타입) */}
                {modalType === 'form' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>폼 필드</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddModalField}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        필드 추가
                      </Button>
                    </div>
                    
                    {modalFields.length === 0 ? (
                      <div className="text-xs text-gray-500 text-center py-3 bg-white rounded border border-dashed">
                        폼 필드를 추가하세요
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {modalFields.map((field, index) => (
                          <div key={field.id} className="p-3 bg-white rounded border space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-gray-600">필드 {index + 1}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveModalField(field.id)}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                            
                            <Input
                              type="text"
                              placeholder="필드 라벨"
                              value={field.label}
                              onChange={(e) => handleUpdateModalField(field.id, { label: e.target.value })}
                              className="text-sm"
                            />
                            
                            <div className="grid grid-cols-2 gap-2">
                              <Select
                                value={field.type}
                                onValueChange={(v) => handleUpdateModalField(field.id, { type: v as any })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="textbox">텍스트박스</SelectItem>
                                  <SelectItem value="codeview">코드뷰 (검색)</SelectItem>
                                  <SelectItem value="textarea">텍스트영역</SelectItem>
                                  <SelectItem value="number-input">숫자입력</SelectItem>
                                  <SelectItem value="date-picker">날짜선택</SelectItem>
                                  <SelectItem value="combo">콤보박스</SelectItem>
                                  <SelectItem value="checkbox">체크박스</SelectItem>
                                  <SelectItem value="radio">라디오</SelectItem>
                                </SelectContent>
                              </Select>
                              
                              <label className="flex items-center gap-2 text-sm">
                                <input
                                  type="checkbox"
                                  checked={field.required}
                                  onChange={(e) => handleUpdateModalField(field.id, { required: e.target.checked })}
                                  className="rounded"
                                />
                                필수
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label>설명 (선택)</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="인터랙션 설명을 입력하세요"
                rows={2}
              />
            </div>

            {/* 6. 추가 버튼 */}
            <Button
              onClick={handleAddInteraction}
              disabled={
                !triggerComponentId || 
                !actionType || 
                (needsTargetArea(actionType) && !targetAreaId) ||
                (needsModalConfiguration(actionType) && !modalTitle.trim())
              }
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              인터랙션 추가
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>정의된 인터랙션 ({data.interactions.length})</CardTitle>
            <CardDescription>
              현재까지 정의된 모든 인터랙션 목록
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.interactions.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Zap className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>정의된 인터랙션이 없습니다</p>
                <p className="text-xs mt-2">왼쪽에서 인터랙션을 추가해주세요</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {data.interactions.map(interaction => {
                  const { component: triggerComp, area: triggerArea } = getComponentInfo(interaction.triggerComponentId);
                  const targetArea = getAreaInfo(interaction.targetAreaId);
                  const actionInfo = activeActions.find(a => a.id === interaction.actionType);
                  const ActionIcon = getIconComponent(actionInfo?.icon || 'Zap');
                  const categoryColor = actionInfo?.category === 'data' ? 'text-blue-500' : 
                                        actionInfo?.category === 'ui' ? 'text-purple-500' : 'text-green-500';
                  const triggerCompDef = triggerComp ? getComponentDefinition(triggerComp.type) : null;
                  const TriggerIcon = triggerCompDef?.icon;

                  return (
                    <div key={interaction.id} className="p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          {/* 트리거 */}
                          <div className="flex items-center gap-2 text-sm font-medium mb-2 flex-wrap">
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded flex items-center gap-1">
                              {TriggerIcon && <TriggerIcon className="w-3 h-3" />}
                              {triggerComp?.label}
                            </span>
                            <span className="text-xs text-gray-500 px-2 py-0.5 bg-gray-200 rounded">
                              {getTriggerEventLabel(interaction.triggerEvent)}
                            </span>
                            <ArrowRight className="w-4 h-4 text-gray-400" />
                            <span className={`px-2 py-1 rounded flex items-center gap-1 ${
                              categoryColor === 'text-blue-500' ? 'bg-blue-100' :
                              categoryColor === 'text-purple-500' ? 'bg-purple-100' : 'bg-green-100'
                            } ${categoryColor}`}>
                              <ActionIcon className="w-3 h-3" />
                              {actionInfo?.name || interaction.actionType}
                            </span>
                            {targetArea && (
                              <>
                                <ArrowRight className="w-4 h-4 text-gray-400" />
                                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                                  🎯 {targetArea.name}
                                </span>
                              </>
                            )}
                          </div>
                          
                          {/* 모달 정보 */}
                          {interaction.modalConfig && (
                            <div className="ml-1 mb-2 p-2 bg-purple-100 rounded text-xs space-y-1">
                              <div className="font-medium text-purple-900 flex items-center gap-1">
                                <Zap className="w-3 h-3" />
                                모달: {interaction.modalConfig.title}
                              </div>
                              <div className="text-purple-700">
                                크기: {
                                  interaction.modalConfig.size === 'sm' ? '작게 (400px)' :
                                  interaction.modalConfig.size === 'md' ? '중간 (600px)' :
                                  interaction.modalConfig.size === 'lg' ? '크게 (800px)' :
                                  interaction.modalConfig.size === 'xl' ? '매우 크게 (1200px)' :
                                  interaction.modalConfig.size === 'full' ? '전체 화면' : interaction.modalConfig.size
                                } | 타입: {
                                  interaction.modalConfig.type === 'form' ? '입력 폼' :
                                  interaction.modalConfig.type === 'detail' ? '상세 정보' :
                                  interaction.modalConfig.type === 'confirm' ? '확인 대화상자' : '커스텀'
                                }
                              </div>
                              {interaction.modalConfig.fields && interaction.modalConfig.fields.length > 0 && (
                                <div className="text-purple-700">
                                  필드: {interaction.modalConfig.fields.map(f => f.label).join(', ')}
                                </div>
                              )}
                              {interaction.modalConfig.content && (
                                <div className="text-purple-700">
                                  내용: {interaction.modalConfig.content}
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* 설명 */}
                          {interaction.description && (
                            <p className="text-xs text-gray-600 ml-1 mb-1">{interaction.description}</p>
                          )}
                          
                          <p className="text-xs text-gray-400 ml-1">
                            {triggerArea?.name} 영역
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveInteraction(interaction.id)}
                          className="ml-2"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Step4Interactions;
