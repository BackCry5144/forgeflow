/**
 * useGenerationStatus - AI 생성 상태 폴링 훅
 * 
 * 3초마다 서버에 생성 상태를 요청하여 실시간 진행 상황을 추적합니다.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

export interface GenerationStatus {
  screen_id: number;
  generation_status: string;
  generation_progress: number;
  generation_message: string | null;
  generation_step: number;
  retry_count: number;
  has_prototype: boolean;
}

interface UseGenerationStatusOptions {
  screenId: number | null;
  enabled: boolean;
  pollInterval?: number; // 밀리초 (기본: 3000ms)
  onComplete?: (status: GenerationStatus) => void;
  onError?: (error: Error) => void;
}

interface UseGenerationStatusReturn {
  status: GenerationStatus | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const useGenerationStatus = ({
  screenId,
  enabled,
  pollInterval = 3000,
  onComplete,
  onError,
}: UseGenerationStatusOptions): UseGenerationStatusReturn => {
  const [status, setStatus] = useState<GenerationStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  
  const intervalRef = useRef<number | null>(null);
  const previousStatusRef = useRef<string | null>(null);

  // 콜백을 ref로 저장하여 dependency 문제 해결
  const onCompleteRef = useRef(onComplete);
  const onErrorRef = useRef(onError);
  
  useEffect(() => {
    onCompleteRef.current = onComplete;
    onErrorRef.current = onError;
  }, [onComplete, onError]);

  // 상태 조회 함수
  const fetchStatus = useCallback(async () => {
    if (!screenId || !enabled) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await axios.get<GenerationStatus>(
        `${API_BASE_URL}/api/ai/status/${screenId}`
      );

      const newStatus = response.data;
      setStatus(newStatus);

      // 상태 변경 감지 및 콜백 호출
      if (previousStatusRef.current !== newStatus.generation_status) {
        console.log(`[useGenerationStatus] Status changed: ${previousStatusRef.current} → ${newStatus.generation_status}`);
        previousStatusRef.current = newStatus.generation_status;

        // 완료 시 콜백 호출
        if (newStatus.generation_status === 'completed' && onCompleteRef.current) {
          onCompleteRef.current(newStatus);
        }
      }

      // 완료 또는 실패 시 폴링 중지
      if (newStatus.generation_status === 'completed' || newStatus.generation_status === 'failed') {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }

      setIsLoading(false);
    } catch (err) {
      const error = err as Error;
      console.error('[useGenerationStatus] Error fetching status:', error);
      setError(error);
      setIsLoading(false);

      if (onErrorRef.current) {
        onErrorRef.current(error);
      }
    }
  }, [screenId, enabled]);

  // 폴링 시작/중지
  useEffect(() => {
    if (!enabled || !screenId) {
      // 폴링 중지
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      // 상태 초기화
      previousStatusRef.current = null;
      setStatus(null);
      return;
    }

    // 폴링 시작 시 이전 상태 초기화 (중요!)
    previousStatusRef.current = null;
    setStatus(null);
    console.log('[useGenerationStatus] 폴링 시작 - 이전 상태 초기화');

    // 즉시 첫 조회
    fetchStatus();

    // 폴링 시작
    intervalRef.current = setInterval(() => {
      fetchStatus();
    }, pollInterval);

    // 클린업
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, screenId, pollInterval, fetchStatus]);

  return {
    status,
    isLoading,
    error,
    refetch: fetchStatus,
  };
};

