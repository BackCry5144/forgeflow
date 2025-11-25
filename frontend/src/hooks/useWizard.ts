import { useState, useCallback } from 'react';
import { WizardStep, WizardData } from '@/types/wizard.types';
import { toast } from '@/hooks/use-toast';

const initialSteps: WizardStep[] = [
  { id: 1, title: '화면 개요', description: '기본 정보 입력', status: 'current' },
  { id: 2, title: '레이아웃', description: '화면 구조 선택', status: 'pending' },
  { id: 3, title: '컴포넌트', description: '구성 요소 배치', status: 'pending' },
  { id: 4, title: '인터랙션', description: '동작 정의', status: 'pending' },
  { id: 5, title: '검토', description: '최종 확인', status: 'pending' },
];

const initialData: WizardData = {
  step1: { screenName: '', description: '' },
  step2: { selectedLayout: null, layoutAreas: [] },
  step3: { components: [], selectedAreaId: '' },
  step4: { interactions: [] },
};

interface UseWizardProps {
  screenId?: number;
}

export const useWizard = ({ screenId }: UseWizardProps = {}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [steps, setSteps] = useState<WizardStep[]>(initialSteps);
  const [wizardData, setWizardData] = useState<WizardData>(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const goToStep = (stepId: number) => {
    setCurrentStep(stepId);
    setSteps((prev) =>
      prev.map((step) => ({
        ...step,
        status: step.id < stepId ? 'completed' : step.id === stepId ? 'current' : 'pending',
      }))
    );
  };

  const nextStep = () => {
    if (currentStep < 5) {
      goToStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      goToStep(currentStep - 1);
    }
  };

  const updateStepData = <K extends keyof WizardData>(step: K, data: WizardData[K]) => {
    setWizardData((prev) => ({
      ...prev,
      [step]: data,
    }));
  };

  const resetWizard = () => {
    setCurrentStep(1);
    setSteps(initialSteps);
    setWizardData(initialData);
  };

  // 임시저장
  const saveDraft = useCallback(async () => {
    if (!screenId) {
      toast({
        title: "오류",
        description: "화면 ID가 없습니다",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`http://localhost:8000/api/ai/screens/${screenId}/wizard-draft`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wizard_data: wizardData }),
      });

      if (!response.ok) throw new Error('임시저장 실패');

      const result = await response.json();

      toast({
        title: "💾 임시저장 완료",
        description: `${result.data_size} 문자 저장됨`,
      });

      console.log('✅ Wizard 임시저장 완료:', result);
    } catch (error) {
      console.error('❌ 임시저장 실패:', error);
      toast({
        title: "임시저장 실패",
        description: error instanceof Error ? error.message : "알 수 없는 오류",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }, [screenId, wizardData]);

  // 불러오기
  const loadDraft = useCallback(async () => {
    if (!screenId) return;

    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/ai/screens/${screenId}/wizard-draft`);
      
      if (!response.ok) throw new Error('불러오기 실패');

      const result = await response.json();

      if (result.has_draft && result.wizard_data) {
        setWizardData(result.wizard_data);

        toast({
          title: "📂 임시저장 데이터 불러오기 완료",
          description: `저장 시간: ${result.saved_at ? new Date(result.saved_at).toLocaleString('ko-KR') : 'N/A'}`,
        });

        console.log('✅ Wizard 데이터 불러오기 완료:', result);
        return true;
      } else {
        console.log('ℹ️ 저장된 데이터 없음');
        return false;
      }
    } catch (error) {
      console.error('❌ 불러오기 실패:', error);
      toast({
        title: "불러오기 실패",
        description: error instanceof Error ? error.message : "알 수 없는 오류",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [screenId]);

  return {
    currentStep,
    steps,
    wizardData,
    goToStep,
    nextStep,
    prevStep,
    updateStepData,
    resetWizard,
    saveDraft,
    loadDraft,
    isSaving,
    isLoading,
  };
};
