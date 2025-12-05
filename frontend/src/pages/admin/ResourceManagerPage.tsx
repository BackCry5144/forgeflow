/**
 * Resource Manager Page - Wizard 리소스 관리 페이지
 */

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutList } from './LayoutManager';
import { ComponentList } from './ComponentManager';
import { ActionList } from './ActionManager';
import { Layout, Layers, Zap, RefreshCw, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useResourcesFetch } from '@/hooks/useResources';

export function ResourceManagerPage() {
  const { refresh, loading, lastFetched } = useResourcesFetch();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') || 'layouts';
  const [activeTab, setActiveTab] = useState(tabFromUrl);

  // URL 쿼리 파라미터 변경 시 탭 업데이트
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['layouts', 'components', 'actions'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // 탭 변경 시 URL 업데이트
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({ tab: value });
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Settings className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Resource Manager</h1>
              <p className="text-sm text-gray-500">
                Wizard 레이아웃, 컴포넌트, 액션 관리
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {lastFetched && (
              <span className="text-xs text-gray-500">
                마지막 갱신: {lastFetched.toLocaleTimeString()}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              새로고침
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="h-full flex flex-col">
          <div className="bg-white border-b border-gray-200 px-6">
            <TabsList className="h-12">
              <TabsTrigger value="layouts" className="flex items-center gap-2">
                <Layout className="w-4 h-4" />
                레이아웃
              </TabsTrigger>
              <TabsTrigger value="components" className="flex items-center gap-2">
                <Layers className="w-4 h-4" />
                컴포넌트
              </TabsTrigger>
              <TabsTrigger value="actions" className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                액션
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-auto p-6">
            <TabsContent value="layouts" className="mt-0 h-full">
              <LayoutList />
            </TabsContent>
            <TabsContent value="components" className="mt-0 h-full">
              <ComponentList />
            </TabsContent>
            <TabsContent value="actions" className="mt-0 h-full">
              <ActionList />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

export default ResourceManagerPage;
