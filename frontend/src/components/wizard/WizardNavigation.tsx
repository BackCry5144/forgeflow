import { Check } from 'lucide-react';
import { WizardStep } from '@/types/wizard.types';
import { cn } from '@/lib/utils';

interface WizardNavigationProps {
  steps: WizardStep[];
  onStepClick: (stepId: number) => void;
}

export function WizardNavigation({ steps, onStepClick }: WizardNavigationProps) {
  return (
    <nav className="w-64 bg-white border-r border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">프로토타입 생성</h2>
      
      <div className="space-y-2">
        {steps.map((step, index) => {
          const isCompleted = step.status === 'completed';
          const isCurrent = step.status === 'current';
          const isPending = step.status === 'pending';

          return (
            <div key={step.id}>
              <button
                onClick={() => onStepClick(step.id)}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors hover:bg-gray-50',
                  isCurrent && 'bg-blue-50 border border-blue-200'
                )}
              >
                {/* Step Number / Check Icon */}
                <div
                  className={cn(
                    'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm',
                    isCompleted && 'bg-blue-600 text-white',
                    isCurrent && 'bg-blue-600 text-white',
                    isPending && 'bg-gray-200 text-gray-600'
                  )}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : step.id}
                </div>

                {/* Step Info */}
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      'font-medium text-sm',
                      isCurrent && 'text-blue-900',
                      isCompleted && 'text-gray-700',
                      isPending && 'text-gray-500'
                    )}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{step.description}</p>
                </div>
              </button>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="ml-7 h-6 w-0.5 bg-gray-200" />
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
