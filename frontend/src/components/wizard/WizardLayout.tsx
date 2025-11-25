import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Save, Loader2 } from 'lucide-react';

interface WizardLayoutProps {
  children: ReactNode;
  currentStep: number;
  totalSteps: number;
  onNext?: () => void;
  onPrev?: () => void;
  onGenerate?: () => void;
  onSaveDraft?: () => void;
  canGoNext?: boolean;
  canGoPrev?: boolean;
  isLastStep?: boolean;
  isSaving?: boolean;
}

export function WizardLayout({
  children,
  currentStep,
  totalSteps,
  onNext,
  onPrev,
  onGenerate,
  onSaveDraft,
  canGoNext = true,
  canGoPrev = true,
  isLastStep = false,
  isSaving = false,
}: WizardLayoutProps) {
  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Content Area */}
      <div className="flex-1 overflow-auto p-8">
        {children}
      </div>

      {/* Footer Navigation */}
      <div className="border-t border-gray-200 bg-white px-8 py-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Step {currentStep} of {totalSteps}
        </div>

        <div className="flex gap-3">
          {/* 임시저장 버튼 */}
          {onSaveDraft && (
            <Button
              variant="outline"
              onClick={onSaveDraft}
              disabled={isSaving}
              className="border-blue-500 text-blue-600 hover:bg-blue-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  저장중...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-1" />
                  임시저장
                </>
              )}
            </Button>
          )}

          {currentStep > 1 && (
            <Button
              variant="outline"
              onClick={onPrev}
              disabled={!canGoPrev}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              이전
            </Button>
          )}

          {!isLastStep && (
            <Button
              onClick={onNext}
              disabled={!canGoNext}
            >
              다음
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}

          {isLastStep && (
            <Button
              onClick={onGenerate}
              disabled={!canGoNext}
              className="bg-blue-600 hover:bg-blue-700"
            >
              프로토타입 생성
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
