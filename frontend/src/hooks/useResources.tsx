/**
 * useResources Hook
 * - Wizard 리소스(레이아웃, 컴포넌트, 액션)를 로드하고 캐싱
 * - 앱 전역에서 사용 가능한 리소스 상태 관리
 */

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { resourceService } from '@/services/resourceService';
import type { Layout, Component, Action } from '@/types/resource';

// ============================================================
// Types
// ============================================================

interface ResourcesState {
  layouts: Layout[];
  components: Component[];
  actions: Action[];
  loading: boolean;
  error: string | null;
  lastFetched: Date | null;
}

interface ResourcesContextType extends ResourcesState {
  refresh: () => Promise<void>;
  getLayoutById: (id: string) => Layout | undefined;
  getComponentById: (id: string) => Component | undefined;
  getActionById: (id: string) => Action | undefined;
  getComponentsByCategory: (category: string) => Component[];
  getActionsByCategory: (category: string) => Action[];
}

// ============================================================
// Context
// ============================================================

const ResourcesContext = createContext<ResourcesContextType | null>(null);

// ============================================================
// Provider Component
// ============================================================

interface ResourcesProviderProps {
  children: ReactNode;
}

export function ResourcesProvider({ children }: ResourcesProviderProps) {
  const [state, setState] = useState<ResourcesState>({
    layouts: [],
    components: [],
    actions: [],
    loading: true,
    error: null,
    lastFetched: null,
  });

  // 리소스 로드 함수
  const loadResources = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const data = await resourceService.getWizardResources();
      
      setState({
        layouts: data.layouts,
        components: data.components,
        actions: data.actions,
        loading: false,
        error: null,
        lastFetched: new Date(),
      });
      
      console.log('✅ Resources loaded:', {
        layouts: data.layouts.length,
        components: data.components.length,
        actions: data.actions.length,
      });
    } catch (err) {
      console.error('❌ Failed to load resources:', err);
      setState(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load resources',
      }));
    }
  }, []);

  // 초기 로드
  useEffect(() => {
    loadResources();
  }, [loadResources]);

  // Helper 함수들
  const getLayoutById = useCallback((id: string) => {
    return state.layouts.find(layout => layout.id === id);
  }, [state.layouts]);

  const getComponentById = useCallback((id: string) => {
    return state.components.find(component => component.id === id);
  }, [state.components]);

  const getActionById = useCallback((id: string) => {
    return state.actions.find(action => action.id === id);
  }, [state.actions]);

  const getComponentsByCategory = useCallback((category: string) => {
    return state.components.filter(component => component.category === category);
  }, [state.components]);

  const getActionsByCategory = useCallback((category: string) => {
    return state.actions.filter(action => action.category === category);
  }, [state.actions]);

  const contextValue: ResourcesContextType = {
    ...state,
    refresh: loadResources,
    getLayoutById,
    getComponentById,
    getActionById,
    getComponentsByCategory,
    getActionsByCategory,
  };

  return (
    <ResourcesContext.Provider value={contextValue}>
      {children}
    </ResourcesContext.Provider>
  );
}

// ============================================================
// Hook
// ============================================================

export function useResources(): ResourcesContextType {
  const context = useContext(ResourcesContext);
  
  if (!context) {
    throw new Error('useResources must be used within a ResourcesProvider');
  }
  
  return context;
}

// ============================================================
// Standalone Hook (Provider 없이 사용)
// ============================================================

export function useResourcesFetch(): ResourcesState & { refresh: () => Promise<void> } {
  const [state, setState] = useState<ResourcesState>({
    layouts: [],
    components: [],
    actions: [],
    loading: true,
    error: null,
    lastFetched: null,
  });

  const refresh = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const data = await resourceService.getWizardResources();
      
      setState({
        layouts: data.layouts,
        components: data.components,
        actions: data.actions,
        loading: false,
        error: null,
        lastFetched: new Date(),
      });
    } catch (err) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load resources',
      }));
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { ...state, refresh };
}

export default useResources;
