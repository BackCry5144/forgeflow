import { Step3Data, Component, ComponentType, LayoutArea } from '@/types/wizard.types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, X, Layout, Search, ChevronDown, ChevronRight, CheckCircle2, Loader2 } from 'lucide-react';
import { useState, useMemo } from 'react';
import { 
  COMPONENT_LIBRARY, 
  COMPONENT_CATEGORIES, 
  ComponentCategory,
  getComponentDefinition 
} from '@/data/componentLibrary';
import { useResourcesFetch } from '@/hooks/useResources';
import { getIconComponent } from '@/utils/iconMapper';

interface Step3ComponentsProps {
  data: Step3Data;
  onChange: (data: Step3Data) => void;
  layoutAreas: LayoutArea[];
}

export function Step3Components({ data, onChange, layoutAreas }: Step3ComponentsProps) {
  // 동적 데이터 로드 (API에서)
  const { components: dbComponents, loading } = useResourcesFetch();
  
  // DB 데이터가 있으면 사용, 없으면 하드코딩 fallback
  const useDbData = dbComponents.length > 0;
  
  // 컴포넌트 라이브러리 결정
  const componentLibrary = useMemo(() => {
    if (useDbData) {
      return dbComponents.map(c => ({
        type: c.id as ComponentType,
        name: c.name,
        description: c.description || '',
        icon: getIconComponent(c.icon),
        category: c.category as ComponentCategory,
      }));
    }
    return COMPONENT_LIBRARY;
  }, [dbComponents, useDbData]);

  // 카테고리 목록 생성
  const categories = useMemo(() => {
    if (useDbData) {
      const uniqueCategories = [...new Set(dbComponents.map(c => c.category))];
      return uniqueCategories.map(cat => ({
        id: cat as ComponentCategory,
        name: cat === 'form' ? 'Form Controls' : cat === 'data-display' ? 'Data Display' : 'Layout',
        description: ''
      }));
    }
    return COMPONENT_CATEGORIES;
  }, [dbComponents, useDbData]);

  const [selectedType, setSelectedType] = useState<ComponentType>('button');
  const [label, setLabel] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<ComponentCategory[]>(['form']);
  const [selectedCategory, setSelectedCategory] = useState<ComponentCategory | null>(null);

  const selectedArea = layoutAreas.find(area => area.id === data.selectedAreaId);

  // 컴포넌트 정의 조회 (DB 또는 하드코딩)
  const getCompDef = (type: ComponentType) => {
    if (useDbData) {
      const dbComp = componentLibrary.find(c => c.type === type);
      return dbComp;
    }
    return getComponentDefinition(type);
  };

  const handleSelectArea = (areaId: string) => {
    onChange({ ...data, selectedAreaId: areaId });
  };

  const handleAddComponent = () => {
    if (!label.trim() || !data.selectedAreaId) return;

    const newComponent: Component = {
      id: `${selectedType}-${Date.now()}`,
      type: selectedType,
      label: label.trim(),
      areaId: data.selectedAreaId,
    };

    onChange({ 
      ...data, 
      components: [...data.components, newComponent] 
    });
    setLabel('');
  };

  const handleRemoveComponent = (id: string) => {
    onChange({ 
      ...data, 
      components: data.components.filter((c) => c.id !== id) 
    });
  };

  const componentsByArea = layoutAreas.reduce((acc, area) => {
    acc[area.id] = data.components.filter(c => c.areaId === area.id);
    return acc;
  }, {} as Record<string, Component[]>);

  // 컴포넌트 필터링 로직 (동적 데이터 사용)
  const filteredComponents = componentLibrary.filter(comp => {
    const matchesSearch = searchQuery === '' || 
      comp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (comp.description && comp.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = !selectedCategory || comp.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // 카테고리 토글
  const toggleCategory = (category: ComponentCategory) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // 로딩 상태
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">컴포넌트 로딩 중...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">컴포넌트를 배치하세요</h2>
        <p className="mt-2 text-gray-600">
          영역을 선택하고 필요한 컴포넌트를 추가합니다
          {useDbData && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded">
              DB 데이터 사용 중
            </span>
          )}
        </p>
      </div>

      {/* 상단: 레이아웃 영역 (전체 너비) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layout className="w-5 h-5" />
            레이아웃 영역
          </CardTitle>
          <CardDescription>컴포넌트를 배치할 영역을 선택하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {layoutAreas.map((area) => {
              const isSelected = data.selectedAreaId === area.id;
              const componentCount = componentsByArea[area.id]?.length || 0;
              
              return (
                <button
                  key={area.id}
                  onClick={() => handleSelectArea(area.id)}
                  className={`p-3 rounded-lg border-2 transition-all text-left relative ${
                    isSelected
                      ? "border-blue-500 bg-blue-50 shadow-md"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {/* 선택 체크 아이콘 */}
                  {isSelected && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle2 className="w-5 h-5 text-blue-600" />
                    </div>
                  )}
                  
                  {/* 영역 이름 */}
                  <div className="flex items-start justify-between mb-1 pr-6">
                    <p className="font-semibold text-sm">{area.name}</p>
                    {componentCount > 0 && (
                      <span className="px-2 py-0.5 text-xs bg-blue-600 text-white rounded-full font-medium">
                        {componentCount}
                      </span>
                    )}
                  </div>
                  
                  {/* 영역 설명 */}
                  <p className="text-xs text-gray-500 mb-2 line-clamp-2">{area.description}</p>
                  
                  {/* 추천 컴포넌트 아이콘 */}
                  {area.suggestedComponents && area.suggestedComponents.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {area.suggestedComponents.slice(0, 6).map(type => {
                        const compDef = getCompDef(type as ComponentType);
                        if (!compDef) return null;
                        const Icon = compDef.icon;
                        return (
                          <Icon key={type} className="w-3 h-3 text-gray-400" title={compDef.name} />
                        );
                      })}
                      {area.suggestedComponents.length > 6 && (
                        <span className="text-xs text-gray-400">+{area.suggestedComponents.length - 6}</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 하단: 컴포넌트 라이브러리 + 배치된 컴포넌트 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>컴포넌트 라이브러리</CardTitle>
            <CardDescription>
              {selectedArea ? (
                <span className="text-blue-600 font-medium">{selectedArea.name}</span>
              ) : (
                "영역을 먼저 선택하세요"
              )}
            </CardDescription>
            
            {/* 검색 바 */}
            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="컴포넌트 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* 카테고리 필터 */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  selectedCategory === null
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                전체 ({componentLibrary.length})
              </button>
              {categories.map(cat => {
                const count = componentLibrary.filter(c => c.category === cat.id).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      selectedCategory === cat.id
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {cat.name} ({count})
                  </button>
                );
              })}
            </div>

            {/* 카테고리별 아코디언 */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {categories.map(category => {
                const categoryComponents = filteredComponents.filter(c => c.category === category.id);
                if (categoryComponents.length === 0) return null;
                
                const isExpanded = expandedCategories.includes(category.id);

                return (
                  <div key={category.id} className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => toggleCategory(category.id)}
                      className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-500" />
                        )}
                        <span className="text-sm font-semibold text-gray-900">
                          {category.name}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        {categoryComponents.length}
                      </span>
                    </button>
                    
                    {isExpanded && (
                      <div className="p-2 bg-gray-50 border-t border-gray-200">
                        <div className="grid grid-cols-4 gap-2">
                          {categoryComponents.map(comp => {
                            const isSuggested = selectedArea?.suggestedComponents?.includes(comp.type);
                            const Icon = comp.icon;
                            
                            return (
                              <button
                                key={comp.type}
                                onClick={() => setSelectedType(comp.type)}
                                disabled={!data.selectedAreaId}
                                title={comp.description}
                                className={`p-3 rounded-lg border-2 transition-all relative flex flex-col items-center gap-1 ${
                                  selectedType === comp.type
                                    ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                                    : "border-gray-200 hover:border-gray-300 hover:bg-white"
                                } ${!data.selectedAreaId ? "opacity-50 cursor-not-allowed" : ""} ${
                                  isSuggested ? "ring-2 ring-green-300" : ""
                                }`}
                              >
                                <Icon className="w-5 h-5" />
                                <span className="text-xs font-medium text-center leading-tight">
                                  {comp.name}
                                </span>
                                {isSuggested && (
                                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border border-white" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              
              {filteredComponents.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">검색 결과가 없습니다</p>
                </div>
              )}
            </div>

            {/* 선택된 컴포넌트 정보 */}
            {selectedType && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {(() => {
                    const comp = getComponentDefinition(selectedType);
                    if (!comp) return null;
                    const Icon = comp.icon;
                    return (
                      <>
                        <Icon className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-semibold text-blue-900">{comp.name}</span>
                      </>
                    );
                  })()}
                </div>
                <p className="text-xs text-blue-700">
                  {getComponentDefinition(selectedType)?.description}
                </p>
              </div>
            )}

            {/* 레이블 입력 */}
            <div className="pt-4 border-t space-y-3">
              <div>
                <label htmlFor="label" className="text-sm font-medium text-gray-700 mb-2 block">
                  레이블
                </label>
                <input
                  id="label"
                  type="text"
                  placeholder="예: 조회 버튼"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddComponent()}
                  disabled={!data.selectedAreaId}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              <Button 
                onClick={handleAddComponent} 
                className="w-full"
                disabled={!data.selectedAreaId || !label.trim()}
              >
                <Plus className="w-4 h-4 mr-2" />
                {selectedArea ? `${selectedArea.name}에 추가` : "영역 선택 필요"}
              </Button>
              
              {selectedArea?.suggestedComponents && selectedArea.suggestedComponents.length > 0 && (
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                  = 이 영역에 추천되는 컴포넌트
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>배치된 컴포넌트 ({data.components.length})</CardTitle>
            <CardDescription>영역별 컴포넌트 목록</CardDescription>
          </CardHeader>
          <CardContent>
            {data.components.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-sm">아직 추가된 컴포넌트가 없습니다</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto">
                {layoutAreas.map((area) => {
                  const areaComponents = componentsByArea[area.id] || [];
                  if (areaComponents.length === 0) return null;

                  return (
                    <div key={area.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-gray-700">{area.name}</h4>
                        <span className="text-xs text-gray-500">{areaComponents.length}개</span>
                      </div>
                      <div className="space-y-1.5">
                        {areaComponents.map((component) => (
                          <div
                            key={component.id}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200"
                          >
                            <div className="flex items-center gap-2">
                              {(() => {
                                const compDef = getComponentDefinition(component.type);
                                if (!compDef) return null;
                                const Icon = compDef.icon;
                                return (
                                  <>
                                    <Icon className="w-4 h-4 text-gray-600" />
                                    <div>
                                      <p className="font-medium text-xs">{component.label}</p>
                                      <p className="text-xs text-gray-500">{compDef.name}</p>
                                    </div>
                                  </>
                                );
                              })()}
                            </div>
                            <button
                              onClick={() => handleRemoveComponent(component.id)}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {data.components.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <Layout className="w-4 h-4" />
              <span className="font-medium">총 {data.components.length}개 컴포넌트</span>
              <span className="text-blue-600">
                 {layoutAreas.filter(area => componentsByArea[area.id]?.length > 0).length}/{layoutAreas.length} 영역 사용 중
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}