import { useEffect, useState } from 'react';
import { useWizard } from '@/hooks/useWizard';
import { WizardNavigation } from './WizardNavigation';
import { WizardLayout } from './WizardLayout';
import { Step1Overview } from './steps/Step1Overview';
import { Step2Layout } from './steps/Step2Layout';
import { Step3Components } from './steps/Step3Components';
import Step4Interactions from './steps/Step4Interactions';
import { Step5Review } from './steps/Step5Review';
import { Step4Data } from '@/types/wizard.types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { FolderOpen, FileX } from 'lucide-react';

interface PrototypeWizardProps {
  screenId: number;
  onGenerate: (wizardData: any) => void;
}

export function PrototypeWizard({ screenId, onGenerate }: PrototypeWizardProps) {
    // 메뉴(screenId) 변경 시 wizard 상태 초기화
    useEffect(() => {
      resetWizard();
    }, [screenId]);
  const { 
    currentStep, 
    steps, 
    wizardData, 
    goToStep, 
    nextStep, 
    prevStep, 
    updateStepData,
    saveDraft,
    loadDraft,
    resetWizard,
    isSaving,
  } = useWizard({ screenId });

  const [showRestoreDialog, setShowRestoreDialog] = useState(false);

  // 최초 로드 시 임시저장 데이터 확인
  useEffect(() => {
    const checkDraft = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/ai/screens/${screenId}/wizard-draft`);
        if (!response.ok) return;

        const result = await response.json();
        if (result.has_draft && result.wizard_data) {
          setShowRestoreDialog(true);
        }
      } catch (error) {
        console.error('❌ Draft 확인 실패:', error);
      }
    };

    checkDraft();
  }, [screenId]);

  const handleRestoreDraft = async () => {
    setShowRestoreDialog(false);
    const loaded = await loadDraft();
    if (!loaded) {
      resetWizard();
    }
  };

  const handleStartNew = () => {
    setShowRestoreDialog(false);
    resetWizard();
  };

  const handleGenerate = () => {
    onGenerate(wizardData);
  };

  return (
    <div className="flex h-full bg-white">
      {/* Left Sidebar Navigation */}
      <WizardNavigation steps={steps} onStepClick={goToStep} />

      {/* Main Content Area */}
      <WizardLayout
        currentStep={currentStep}
        totalSteps={5}
        onNext={nextStep}
        onPrev={prevStep}
        onGenerate={handleGenerate}
        onSaveDraft={saveDraft}
        isSaving={isSaving}
        canGoNext={true}
        isLastStep={currentStep === 5}
      >
        {/* Step Content */}
        {currentStep === 1 && (
          <Step1Overview
            data={wizardData.step1}
            onChange={(data) => updateStepData('step1', data)}
          />
        )}
        {currentStep === 2 && (
          <Step2Layout
            data={wizardData.step2}
            onChange={(data) => updateStepData('step2', data)}
          />
        )}
        {currentStep === 3 && (
          <Step3Components
            data={wizardData.step3}
            onChange={(data) => updateStepData('step3', data)}
            layoutAreas={wizardData.step2.layoutAreas}
          />
        )}
        {currentStep === 4 && (
          <Step4Interactions
            data={wizardData.step4}
            onChange={(data: Step4Data) => updateStepData('step4', data)}
            components={wizardData.step3.components}
            layoutAreas={wizardData.step2.layoutAreas}
          />
        )}
        {currentStep === 5 && <Step5Review data={wizardData} />}
      </WizardLayout>

      {/* 임시저장 데이터 복원 다이얼로그 */}
      <AlertDialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-blue-600" />
              임시저장된 데이터 발견
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <span className="block">이 화면에 이전에 작업하던 임시저장 데이터가 있습니다.</span>
                <span className="block font-medium text-foreground">
                  임시저장 데이터를 불러와서 이어서 작업하시겠습니까?
                </span>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleStartNew} className="flex items-center gap-2">
              <FileX className="w-4 h-4" />
              새로 시작
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRestoreDraft}
              className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
            >
              <FolderOpen className="w-4 h-4" />
              불러오기
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
