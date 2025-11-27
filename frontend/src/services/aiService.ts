import { apiClient } from './api';
import type {
  GenerateRequest,
  GenerateResponse,
} from '@/types/ai';

export const aiService = {
  /**
   * 프로토타입 & 설계서 생성
   */
  async generate(data: GenerateRequest): Promise<GenerateResponse> {
    const response = await apiClient.post<GenerateResponse>('/api/ai/generate', data);
    return response.data;
  },

  /** 설계서 생성 (FormData로 전송) */
  async generateDesignDoc(data: GenerateRequest & {
    screenshots?: File[];
    screenshot_labels?: string[];
  }): Promise<GenerateResponse> {
    const formData = new FormData();
    // 필수 값
    formData.append('screen_id', String(data.screen_id));
    // 이미지 파일
    if (data.screenshots) {
      data.screenshots.forEach((file) => {
        formData.append('screenshots', file);
      });
    }
    // 라벨
    if (data.screenshot_labels) {
      data.screenshot_labels.forEach((label) => {
        formData.append('screenshot_labels', label);
      });
    }
    // 필요시 다른 값도 추가 가능
    // formData.append('menu_name', data.menu_name);
    // formData.append('screen_name', data.screen_name);
    // formData.append('wizard_data', JSON.stringify(data.wizard_data));

    const response = await apiClient.post<GenerateResponse>(`/api/ai/documents/designDoc`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async generateTestPlan(data: GenerateRequest): Promise<GenerateResponse> {
    const response = await apiClient.post<GenerateResponse>('/api/ai/generate_test_plan', data);
    return response.data;
  },

  async generateManual(data: GenerateRequest): Promise<GenerateResponse> {
    const response = await apiClient.post<GenerateResponse>('/api/ai/generate_manual', data);
    return response.data;
  },

  /**
   * AI 서비스 상태 체크
   */
  async healthCheck(): Promise<{ status: string; model: string }> {
    const response = await apiClient.get<{ status: string; model: string }>('/api/ai/health');
    return response.data;
  },
};
