import { apiClient } from './api';
import type {
  Screen,
  ScreenWithFeedback,
  CreateScreenRequest,
  UpdateScreenRequest,
  CreateFeedbackRequest,
  Feedback,
} from '@/types';

export const screenService = {
  /**
   * 화면 목록 조회 (메뉴별)
  /**
   * 화면 상세 조회 (피드백 포함)
   */
  async getScreen(id: number): Promise<ScreenWithFeedback> {
    const response = await apiClient.get<ScreenWithFeedback>(`/api/screens/${id}`);
    return response.data;
  },

  /**
   * 화면 생성
   */
  async createScreen(data: CreateScreenRequest): Promise<Screen> {
    const response = await apiClient.post<Screen>('/api/screens', data);
    return response.data;
  },

  /**
   * 화면 수정
   */
  async updateScreen(id: number, data: UpdateScreenRequest): Promise<Screen> {
    const response = await apiClient.put<Screen>(`/api/screens/${id}`, data);
    return response.data;
  },

  /**
   * 화면 삭제
   */
  async deleteScreen(id: number): Promise<void> {
    await apiClient.delete(`/api/screens/${id}`);
  },

  /**
   * 화면 승인
   */
  async approveScreen(id: number): Promise<Screen> {
    const response = await apiClient.post<Screen>(`/api/screens/${id}/approve`);
    return response.data;
  },

  /**
   * 피드백 추가
   */
  async addFeedback(screenId: number, data: CreateFeedbackRequest): Promise<Feedback> {
    const response = await apiClient.post<Feedback>(
      `/api/screens/${screenId}/feedback`,
      data
    );
    return response.data;
  },
};
