import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { screenService, aiService, menuService } from '@/services';
import type { ScreenWithFeedback, Menu } from '@/types';
import type { WizardData } from '@/types/wizard.types';
import { CodePreview } from '@/components/workspace/CodePreview';
import { DocumentPanel } from '@/components/workspace/DocumentPanel';
import { PrototypeWizard } from '@/components/wizard/PrototypeWizard';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import GenerationProgressModal from '@/components/GenerationProgressModal';
import { useGenerationStatus } from '@/hooks/useGenerationStatus';

export function ScreenWorkspacePage() {
  const { screenId } = useParams<{ screenId: string }>();
  const navigate = useNavigate();
  
  
  const [screen, setScreen] = useState<ScreenWithFeedback | null>(null);
  const [menu, setMenu] = useState<Menu | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [currentView, setCurrentView] = useState<'prompt' | 'prototype' | 'document'>('prompt');
  
  // 진행 상황 모달 state
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [generatingScreenId, setGeneratingScreenId] = useState<number | null>(null);
  
  // 생성 상태 폴링
  const { status: generationStatus } = useGenerationStatus({
    screenId: generatingScreenId,
    enabled: showProgressModal && generatingScreenId !== null,
    onComplete: (status) => {
      console.log('✅ Generation completed!', status);
      // 화면 데이터 다시 로드
      if (screen) {
        loadScreen(screen.id);
      }
    },
    onError: (error) => {
      console.error('❌ Polling error:', error);
    },
  });

  useEffect(() => {
    if (screenId) {
      loadScreen(parseInt(screenId));
    }
  }, [screenId]);

  const loadScreen = async (id: number) => {
    try {
      const data = await screenService.getScreen(id);
      setScreen(data);
      // prompt는 이제 wizard에서 자동 생성되므로 state 관리 불필요
      
      // 메뉴 정보 로드
      if (data.menu_id) {
        const menuData = await menuService.getMenu(data.menu_id);
        setMenu(menuData);
      }
    } catch (error) {
      console.error('화면 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (wizardData: WizardData) => {
    if (!screen || !menu) return;
    
    // 이미 생성 중이면 무시 (중복 호출 방지)
    if (generating) {
      console.warn('⚠️ 이미 생성 중입니다. 중복 호출을 무시합니다.');
      return;
    }
    
    setGenerating(true);
    setGeneratingScreenId(screen.id);
    setShowProgressModal(true);
    
    try {
      // API 호출 - 백엔드에서 동기적으로 모든 작업 처리
      await aiService.generate({
        screen_id: screen.id,
        wizard_data: wizardData,
        menu_name: menu.name,
        screen_name: screen.name,
      });

      // API 완료 후 화면 데이터 다시 로드
      // (폴링의 onComplete에서도 처리되지만, 여기서도 보험으로 처리)
    } catch (error: any) {
      console.error('❌ 프로토타입 생성 실패:', error);
      console.error('❌ Error details:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
      });
      
      // 에러 메시지 구성
      let errorMessage = '프로토타입 생성에 실패했습니다.';
      
      if (error?.response?.status === 502) {
        const detail = error?.response?.data?.detail;
        
        // missing_wizard_data 에러 체크
        if (detail?.error_type === 'missing_wizard_data') {
          errorMessage = '⚠️ Wizard 데이터가 필요합니다\n\n' +
                        'Step by Step Wizard를 완료한 후\n' +
                        '프로토타입을 생성해주세요.';
        } else {
          errorMessage = '⚠️ Backend 서버 에러 (502 Bad Gateway)\n\n' +
                        '원인: Backend 처리 중 예외 발생\n' +
                        '해결: Backend 터미널 로그를 확인하세요!\n\n' +
                        '가능한 원인:\n' +
                        '- get_wizard_based_prompt() 함수 에러\n' +
                        '- Python 코드 실행 중 예외\n' +
                        '- 필요한 모듈 미설치';
        }
      } else if (error?.response?.status === 500) {
        errorMessage = '⚠️ Backend 내부 서버 에러 (500)\n\n' +
                      (error?.response?.data?.detail || '상세 내용은 Backend 로그 확인');
      } else if (error?.response?.data?.detail) {
        // 구조화된 에러 메시지 (AIServiceError)
        const detail = error.response.data.detail;
        if (typeof detail === 'object' && detail.message) {
          errorMessage = detail.message;
        } else {
          errorMessage = detail;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      alert(`❌ 생성 실패\n\n${errorMessage}\n\n자세한 내용은 콘솔을 확인하세요.`);
      
      // 모달 닫기 (에러 시)
      setShowProgressModal(false);
      setGeneratingScreenId(null);
    } finally {
      setGenerating(false);
    }
  };
  
  // 모달 완료 핸들러
  const handleProgressComplete = () => {
    setShowProgressModal(false);
    setGeneratingScreenId(null);
    setGenerating(false);
    setCurrentView('prototype');
    alert('프로토타입이 성공적으로 생성되었습니다!');
  };
  
  // 모달 닫기 핸들러
  const handleProgressClose = () => {
    setShowProgressModal(false);
    setGeneratingScreenId(null);
    setGenerating(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  if (!screen) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">화면을 찾을 수 없습니다</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* 헤더 */}
      <div className="border-b bg-background flex-shrink-0">
        <div className="h-14 px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-lg font-bold">{screen.name}</h1>
              <p className="text-xs text-muted-foreground">
                {menu?.name} / {screen.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              screen.status === 'approved' 
                ? 'bg-green-100 text-green-700'
                : screen.status === 'in_review'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700'
            }`}>
              {screen.status === 'approved' ? '승인됨' : 
               screen.status === 'in_review' ? '검토중' : '초안'}
            </div>
          </div>
        </div>

        {/* Navigator */}
        <div className="h-12 px-4 flex items-center border-t bg-muted/30">
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentView('prompt')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                currentView === 'prompt'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              프롬프트 입력
            </button>
            <button
              onClick={() => setCurrentView('prototype')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                currentView === 'prototype'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              프로토타입
            </button>
            <button
              onClick={() => setCurrentView('document')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                currentView === 'document'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              설계 문서
            </button>
          </div>
        </div>
      </div>

      {/* Content Area - 선택된 뷰에 따라 전환 */}
      <div className="flex-1 overflow-hidden">
        {currentView === 'prompt' && (
          <div className="h-full overflow-hidden">
            <PrototypeWizard
              screenId={parseInt(screenId || '0')}
              onGenerate={handleGenerate}
            />
          </div>
        )}

        {currentView === 'prototype' && (
          <div className="relative h-full w-full">
            <CodePreview
              code={screen.prototype_html || ''}
            />
          </div>
        )}

        {currentView === 'document' && (
          <div className="h-full overflow-hidden">
            <DocumentPanel
              designDoc={screen.design_doc}
              testPlan={screen.test_plan}
              manual={screen.manual}
              status={screen.status}
              screenId={screen.id}
              menuName={menu?.name ?? ''}
              screenName={screen.name}
            />
          </div>
        )}
      </div>
      
      {/* 프로토타입 생성 진행 상황 모달 */}
      <GenerationProgressModal
        visible={showProgressModal}
        screenId={generatingScreenId}
        screenName={screen.name}
        status={generationStatus}
        onClose={handleProgressClose}
        onComplete={handleProgressComplete}
      />
    </div>
  );
}
