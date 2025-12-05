/**
 * Resource Service - Wizard 리소스 API 서비스
 */

import { apiClient } from './api';
import type {
  Layout,
  Component,
  Action,
  WizardResources,
  LayoutListResponse,
  ComponentListResponse,
  ActionListResponse,
  CreateLayoutRequest,
  UpdateLayoutRequest,
  CreateComponentRequest,
  UpdateComponentRequest,
  CreateActionRequest,
  UpdateActionRequest,
} from '@/types/resource';

export const resourceService = {
  // ============================================================
  // Wizard Resources (통합 조회)
  // ============================================================

  /**
   * Wizard에서 사용하는 모든 리소스를 한 번에 조회
   */
  async getWizardResources(): Promise<WizardResources> {
    const response = await apiClient.get<WizardResources>('/api/resources/wizard');
    return response.data;
  },

  // ============================================================
  // Layouts
  // ============================================================

  /**
   * 레이아웃 목록 조회
   */
  async getLayouts(includeInactive = false): Promise<Layout[]> {
    const response = await apiClient.get<LayoutListResponse>('/api/resources/layouts', {
      params: { include_inactive: includeInactive }
    });
    return response.data.items;
  },

  /**
   * 레이아웃 상세 조회
   */
  async getLayout(id: string): Promise<Layout> {
    const response = await apiClient.get<Layout>(`/api/resources/layouts/${id}`);
    return response.data;
  },

  /**
   * 레이아웃 생성
   */
  async createLayout(data: CreateLayoutRequest): Promise<Layout> {
    const response = await apiClient.post<Layout>('/api/resources/layouts', data);
    return response.data;
  },

  /**
   * 레이아웃 수정
   */
  async updateLayout(id: string, data: UpdateLayoutRequest): Promise<Layout> {
    const response = await apiClient.put<Layout>(`/api/resources/layouts/${id}`, data);
    return response.data;
  },

  /**
   * 레이아웃 삭제
   */
  async deleteLayout(id: string): Promise<void> {
    await apiClient.delete(`/api/resources/layouts/${id}`);
  },

  // ============================================================
  // Components
  // ============================================================

  /**
   * 컴포넌트 목록 조회
   */
  async getComponents(category?: string, includeInactive = false): Promise<Component[]> {
    const response = await apiClient.get<ComponentListResponse>('/api/resources/components', {
      params: { category, include_inactive: includeInactive }
    });
    return response.data.items;
  },

  /**
   * 컴포넌트 상세 조회
   */
  async getComponent(id: string): Promise<Component> {
    const response = await apiClient.get<Component>(`/api/resources/components/${id}`);
    return response.data;
  },

  /**
   * 컴포넌트 생성
   */
  async createComponent(data: CreateComponentRequest): Promise<Component> {
    const response = await apiClient.post<Component>('/api/resources/components', data);
    return response.data;
  },

  /**
   * 컴포넌트 수정
   */
  async updateComponent(id: string, data: UpdateComponentRequest): Promise<Component> {
    const response = await apiClient.put<Component>(`/api/resources/components/${id}`, data);
    return response.data;
  },

  /**
   * 컴포넌트 삭제
   */
  async deleteComponent(id: string): Promise<void> {
    await apiClient.delete(`/api/resources/components/${id}`);
  },

  // ============================================================
  // Actions
  // ============================================================

  /**
   * 액션 목록 조회
   */
  async getActions(category?: string, includeInactive = false): Promise<Action[]> {
    const response = await apiClient.get<ActionListResponse>('/api/resources/actions', {
      params: { category, include_inactive: includeInactive }
    });
    return response.data.items;
  },

  /**
   * 액션 상세 조회
   */
  async getAction(id: string): Promise<Action> {
    const response = await apiClient.get<Action>(`/api/resources/actions/${id}`);
    return response.data;
  },

  /**
   * 액션 생성
   */
  async createAction(data: CreateActionRequest): Promise<Action> {
    const response = await apiClient.post<Action>('/api/resources/actions', data);
    return response.data;
  },

  /**
   * 액션 수정
   */
  async updateAction(id: string, data: UpdateActionRequest): Promise<Action> {
    const response = await apiClient.put<Action>(`/api/resources/actions/${id}`, data);
    return response.data;
  },

  /**
   * 액션 삭제
   */
  async deleteAction(id: string): Promise<void> {
    await apiClient.delete(`/api/resources/actions/${id}`);
  },
};
