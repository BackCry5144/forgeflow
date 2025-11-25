/**
 * GenerationProgressModal - AI 프로토타입 생성 진행 상황 모달
 * 
 * 폴링 방식으로 3초마다 서버에서 생성 상태를 확인하고 UI에 표시합니다.
 */

import React from 'react';
import { CheckCircle, Loader2, XCircle, Clock } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from '@/components/ui/alert-dialog';

export interface GenerationStatus {
  screen_id: number;
  generation_status: string;
  generation_progress: number;
  generation_message: string | null;
  generation_step: number;
  retry_count: number;
  has_prototype: boolean;
}

interface GenerationProgressModalProps {
  visible: boolean;
  screenId: number | null;
  screenName: string;
  status: GenerationStatus | null;
  onClose: () => void;
  onComplete: () => void;
}

const GenerationProgressModal: React.FC<GenerationProgressModalProps> = ({
  visible,
  screenName,
  status,
  onClose,
  onComplete,
}) => {
  // 상태별 아이콘
  const getStatusIcon = (genStatus: string) => {
    switch (genStatus) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'failed':
        return <XCircle className="w-6 h-6 text-red-500" />;
      case 'waiting_quota':
        return <Clock className="w-6 h-6 text-yellow-500" />;
      default:
        return <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />;
    }
  };

  // 진행률 바 색상
  const getProgressColor = (genStatus: string) => {
    if (genStatus === 'completed') return 'bg-green-500';
    if (genStatus === 'failed') return 'bg-red-500';
    if (genStatus === 'waiting_quota') return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  // 단계별 체크리스트
  const steps = [
    { id: 1, name: 'Wizard 데이터 저장', minProgress: 0 },
    { id: 2, name: 'AI API 요청', minProgress: 25 },
    { id: 3, name: 'AI 코드 생성', minProgress: 50 },
    { id: 4, name: '검증 및 완료', minProgress: 85 },
  ];

  const getStepStatus = (stepId: number) => {
    if (!status) return 'pending';
    if (status.generation_step > stepId) return 'completed';
    if (status.generation_step === stepId) return 'in_progress';
    return 'pending';
  };

  const getStepIcon = (stepId: number) => {
    const stepStatus = getStepStatus(stepId);
    if (stepStatus === 'completed') {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    } else if (stepStatus === 'in_progress') {
      return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
    } else {
      return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  // 완료 시 자동 처리 (completed 상태로 변경되는 순간만 감지)
  const onCompleteRef = React.useRef(onComplete);
  const prevStatusRef = React.useRef<string | null>(null);
  
  React.useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);
  
  // 모달이 열릴 때 이전 상태 초기화
  React.useEffect(() => {
    if (visible) {
      console.log('[GenerationProgressModal] 모달 열림 - 상태 초기화');
      prevStatusRef.current = null;
    }
  }, [visible]);
  
  React.useEffect(() => {
    const currentStatus = status?.generation_status;
    const prevStatus = prevStatusRef.current;
    
    // completed로 변경되는 순간만 감지 (중복 실행 방지)
    if (currentStatus === 'completed' && prevStatus !== 'completed') {
      console.log('[GenerationProgressModal] 생성 완료 감지 - 1.5초 후 완료 처리');
      const timer = setTimeout(() => {
        onCompleteRef.current();
      }, 1500);
      
      // 상태 업데이트
      prevStatusRef.current = currentStatus;
      
      return () => {
        console.log('[GenerationProgressModal] 타이머 클리어');
        clearTimeout(timer);
      };
    }
    
    // 이전 상태 업데이트
    prevStatusRef.current = currentStatus || null;
  }, [status?.generation_status]);

  return (
    <AlertDialog open={visible} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {status && getStatusIcon(status.generation_status)}
            <span>프로토타입 생성 중</span>
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4 pt-4">
              {/* 화면 이름 */}
              <div>
                <p className="font-semibold text-foreground">{screenName}</p>
              </div>

              {/* 진행률 바 */}
              {status && (
                <div className="space-y-2">
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full ${getProgressColor(status.generation_status)} transition-all duration-500 ease-in-out`}
                      style={{ width: `${status.generation_progress}%` }}
                    />
                  </div>
                  <p className="text-sm text-center text-muted-foreground">
                    {status.generation_progress}%
                  </p>
                </div>
              )}

              {/* 현재 메시지 */}
              {status?.generation_message && (
                <div className={`p-3 rounded-lg ${
                  status.generation_status === 'failed' ? 'bg-red-50 border border-red-200' :
                  status.generation_status === 'completed' ? 'bg-green-50 border border-green-200' :
                  status.generation_status === 'waiting_quota' ? 'bg-yellow-50 border border-yellow-200' :
                  'bg-blue-50 border border-blue-200'
                }`}>
                  <p className={`text-sm ${
                    status.generation_status === 'failed' ? 'text-red-800' :
                    status.generation_status === 'completed' ? 'text-green-800' :
                    status.generation_status === 'waiting_quota' ? 'text-yellow-800' :
                    'text-blue-800'
                  }`}>
                    {status.generation_message}
                  </p>
                </div>
              )}

              {/* 할당량 대기 시 특별 알림 */}
              {status?.generation_status === 'waiting_quota' && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg space-y-2">
                  <p className="font-semibold text-yellow-900">⚠️ API 할당량 초과</p>
                  <p className="text-sm text-yellow-800">
                    Google AI API 무료 티어 제한(분당 1,000K 토큰)에 도달했습니다.
                  </p>
                  <p className="text-sm font-semibold text-yellow-900">
                    재시도 횟수: {status.retry_count} / 10
                  </p>
                  <p className="text-sm text-yellow-800">
                    자동으로 60초마다 재시도하고 있습니다. 잠시만 기다려주세요...
                  </p>
                </div>
              )}

              {/* 단계별 체크리스트 */}
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <p className="font-semibold text-sm">진행 단계</p>
                <div className="space-y-2">
                  {steps.map((step) => (
                    <div key={step.id} className="flex items-center gap-2">
                      {getStepIcon(step.id)}
                      <span className={`text-sm ${
                        getStepStatus(step.id) === 'completed' ? 'text-green-600 font-medium' :
                        getStepStatus(step.id) === 'in_progress' ? 'text-blue-600 font-medium' :
                        'text-gray-500'
                      }`}>
                        {step.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 예상 소요 시간 안내 */}
              {status && status.generation_status !== 'completed' && status.generation_status !== 'failed' && (
                <div className="p-3 bg-blue-50 rounded text-center">
                  <p className="text-xs text-blue-700">
                    💡 복잡한 화면일수록 시간이 더 걸릴 수 있습니다 (평균 1~3분, 최대 10분)
                  </p>
                </div>
              )}

              {/* 실패 시 안내 */}
              {status?.generation_status === 'failed' && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="font-semibold text-red-900 mb-2">❌ 생성 실패</p>
                  <p className="text-sm text-red-800">
                    Wizard 데이터는 저장되었습니다. 생성 버튼을 다시 눌러 재시도해주세요.
                  </p>
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default GenerationProgressModal;
