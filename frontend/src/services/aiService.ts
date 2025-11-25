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

  /** 설계서 생성 */
  async generateDesignDoc(data: GenerateRequest): Promise<GenerateResponse> {
    const response = await apiClient.post<GenerateResponse>(`/api/ai/documents/designDoc`, data);
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
