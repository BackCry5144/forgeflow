import { apiClient } from './api';
import type { Menu, MenuWithScreens, CreateMenuRequest, UpdateMenuRequest } from '@/types';

export const menuService = {
  /**
   * 메뉴 목록 조회
   */
  async getMenus(): Promise<Menu[]> {
    const response = await apiClient.get<{ total: number; items: Menu[] }>('/api/menus');
    return response.data.items;
  },

  /**
   * 메뉴 상세 조회 (화면 목록 포함)
   */
  async getMenu(id: number): Promise<MenuWithScreens> {
    const response = await apiClient.get<MenuWithScreens>(`/api/menus/${id}`);
    return response.data;
  },

  /**
   * 메뉴 생성
   */
  async createMenu(data: CreateMenuRequest): Promise<Menu> {
    const response = await apiClient.post<Menu>('/api/menus', data);
    return response.data;
  },

  /**
   * 메뉴 수정
   */
  async updateMenu(id: number, data: UpdateMenuRequest): Promise<Menu> {
    const response = await apiClient.put<Menu>(`/api/menus/${id}`, data);
    return response.data;
  },

  /**
   * 메뉴 삭제
   */
  async deleteMenu(id: number): Promise<void> {
    await apiClient.delete(`/api/menus/${id}`);
  },

  /**
   * CSV 임포트
   */
  async importCSV(file: File): Promise<{ created_count: number; menus: Menu[] }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<{ created_count: number; menus: Menu[] }>(
      '/api/menus/import',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },
};
