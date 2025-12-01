import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { screenService, aiService, menuService } from '@/services';
import type { Screen, Menu } from '@/types';
import type { WizardData } from '@/types/wizard.types';
import { CodePreview } from '@/components/workspace/CodePreview';
import { DocumentPanel } from '@/components/workspace/DocumentPanel';
import { PrototypeWizard } from '@/components/wizard/PrototypeWizard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Camera, Trash2, Image, Zap, Loader2 } from 'lucide-react';
import GenerationProgressModal from '@/components/GenerationProgressModal';
import { useGenerationStatus } from '@/hooks/useGenerationStatus';
import { useScreenshot } from '@/hooks/useScreenshot';

// 📸 수동 캡처 스크린샷 타입
export interface CapturedScreenshot {
  id: string;
  label: string;
  blob: Blob;
  dataUrl: string;
  timestamp: number;
}

// 📸 모달 정보 타입 (자동 캡처용)
interface ModalInfo {
  id: string;
  title: string;
}

export function ScreenWorkspacePage() {
  const { screenId } = useParams<{ screenId: string }>();
  const navigate = useNavigate();
  
  
  const [screen, setScreen] = useState<Screen | null>(null);
  const [menu, setMenu] = useState<Menu | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [currentView, setCurrentView] = useState<'prompt' | 'prototype' | 'document'>('prompt');
  
  // 📸 프로토타입 iframe ref (스크린샷 캡처용)
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // 📸 수동 캡처 스크린샷 상태
  const [manualScreenshots, setManualScreenshots] = useState<CapturedScreenshot[]>([]);
  const { captureIframe, isCapturing } = useScreenshot();
  
  // 📸 자동 캡처 상태
  const [isAutoCapturing, setIsAutoCapturing] = useState(false);
  const [autoCaptureProgress, setAutoCaptureProgress] = useState({ current: 0, total: 0 });
  
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
  const handleProgressComplete = async () => {
    setShowProgressModal(false);
    setGeneratingScreenId(null);
    setGenerating(false);
    
    // 📌 화면 데이터 다시 로드 (DB에서 최신 prototype_html 가져오기)
    if (screen) {
      await loadScreen(screen.id);
    }
    
    setCurrentView('prototype');
    alert('프로토타입이 성공적으로 생성되었습니다!');
  };
  
  // 모달 닫기 핸들러
  const handleProgressClose = () => {
    setShowProgressModal(false);
    setGeneratingScreenId(null);
    setGenerating(false);
  };

  // 📸 수동 스크린샷 캡처 핸들러
  const handleManualCapture = async () => {
    if (!iframeRef.current) {
      alert('프로토타입이 로드되지 않았습니다.');
      return;
    }

    // 기본 라벨 생성 (시간 기반)
    const defaultLabel = `화면 ${manualScreenshots.length + 1}`;
    const label = prompt('스크린샷 라벨을 입력하세요:', defaultLabel);
    
    if (!label) return; // 취소

    try {
      const result = await captureIframe(iframeRef, label);
      if (result) {
        // Blob을 DataURL로 변환 (썸네일 표시용)
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(result.blob);
        });

        const newScreenshot: CapturedScreenshot = {
          id: `manual-${Date.now()}`,
          label: result.label,
          blob: result.blob,
          dataUrl,
          timestamp: Date.now(),
        };

        setManualScreenshots(prev => [...prev, newScreenshot]);
        console.log(`✅ 수동 캡처 성공: ${result.label}`);
      }
    } catch (error) {
      console.error('❌ 수동 캡처 실패:', error);
      alert('스크린샷 캡처에 실패했습니다.');
    }
  };

  // 📸 수동 스크린샷 삭제
  const handleDeleteScreenshot = (id: string) => {
    setManualScreenshots(prev => prev.filter(s => s.id !== id));
  };

  // 📸 전체 스크린샷 삭제
  const handleClearAllScreenshots = () => {
    if (manualScreenshots.length === 0) return;
    if (confirm(`${manualScreenshots.length}개의 스크린샷을 모두 삭제하시겠습니까?`)) {
      setManualScreenshots([]);
    }
  };

  // 📸 wizard_data에서 모달 목록 추출
  const extractModalsFromWizardData = useCallback((): ModalInfo[] => {
    if (!screen?.wizard_data) return [];
    
    try {
      const wizardData = typeof screen.wizard_data === 'string' 
        ? JSON.parse(screen.wizard_data) 
        : screen.wizard_data;
      
      const modals: ModalInfo[] = [];
      const step4 = wizardData?.step4;
      
      if (step4?.interactions && Array.isArray(step4.interactions)) {
        let modalIndex = 0;
        step4.interactions.forEach((interaction: any) => {
          if (interaction.actionType === 'open-modal' && interaction.modalConfig) {
            const title = interaction.modalConfig.title || `모달 ${modalIndex + 1}`;
            
            // 모달 ID: 고유 인덱스 기반으로 생성
            const modalId = `modal-${modalIndex}`;
            modalIndex++;
            
            modals.push({
              id: modalId,
              title: title
            });
          }
        });
      }
      
      // 제목 기준 중복 제거 (같은 제목의 모달만 제거)
      const uniqueModals = modals.filter((modal, index, self) =>
        index === self.findIndex(m => m.title === modal.title)
      );
      
      return uniqueModals;
    } catch (error) {
      console.error('모달 목록 추출 실패:', error);
      return [];
    }
  }, [screen?.wizard_data]);

  // 📸 단일 모달 캡처 (postMessage 통신)
  const captureModal = useCallback(async (modalInfo: ModalInfo): Promise<CapturedScreenshot | null> => {
    if (!iframeRef.current?.contentWindow) {
      console.error('iframe contentWindow not available');
      return null;
    }

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        console.warn(`⚠️ 모달 열기 타임아웃: ${modalInfo.title}`);
        window.removeEventListener('message', handleMessage);
        resolve(null);
      }, 5000);

      const handleMessage = async (event: MessageEvent) => {
        if (event.data?.type === 'MODAL_OPENED' && event.data?.modalId === modalInfo.id) {
          clearTimeout(timeout);
          window.removeEventListener('message', handleMessage);
          
          // 모달이 열린 후 스크린샷 캡처
          await new Promise(r => setTimeout(r, 500)); // 렌더링 대기
          
          try {
            const result = await captureIframe(iframeRef, modalInfo.title);
            
            if (result) {
              const dataUrl = await new Promise<string>((resolveDataUrl) => {
                const reader = new FileReader();
                reader.onloadend = () => resolveDataUrl(reader.result as string);
                reader.readAsDataURL(result.blob);
              });

              const screenshot: CapturedScreenshot = {
                id: `auto-${modalInfo.id}-${Date.now()}`,
                label: modalInfo.title,
                blob: result.blob,
                dataUrl,
                timestamp: Date.now(),
              };
              
              // 모달 닫기
              iframeRef.current?.contentWindow?.postMessage({ type: 'CLOSE_MODAL' }, '*');
              await new Promise(r => setTimeout(r, 300)); // 닫히기 대기
              
              resolve(screenshot);
            } else {
              iframeRef.current?.contentWindow?.postMessage({ type: 'CLOSE_MODAL' }, '*');
              resolve(null);
            }
          } catch (error) {
            console.error(`모달 캡처 실패: ${modalInfo.title}`, error);
            iframeRef.current?.contentWindow?.postMessage({ type: 'CLOSE_MODAL' }, '*');
            resolve(null);
          }
        }
      };

      window.addEventListener('message', handleMessage);
      
      // 모달 열기 요청
      iframeRef.current?.contentWindow?.postMessage({
        type: 'OPEN_MODAL',
        modalId: modalInfo.id
      }, '*');
    });
  }, [captureIframe]);

  // 📸 자동 모달 캡처 (모든 모달 순차 캡처)
  const handleAutoCapture = useCallback(async () => {
    const modals = extractModalsFromWizardData();
    
    if (modals.length === 0) {
      alert('캡처할 모달이 없습니다.\n\nWizard Step 4에서 모달을 정의해주세요.');
      return;
    }

    if (!iframeRef.current) {
      alert('프로토타입이 로드되지 않았습니다.');
      return;
    }

    const confirmMsg = `${modals.length}개의 모달을 자동 캡처합니다.\n\n` +
      modals.map((m, i) => `${i + 1}. ${m.title}`).join('\n') +
      '\n\n계속하시겠습니까?';
    
    if (!confirm(confirmMsg)) return;

    setIsAutoCapturing(true);
    setAutoCaptureProgress({ current: 0, total: modals.length });

    const capturedScreenshots: CapturedScreenshot[] = [];

    for (let i = 0; i < modals.length; i++) {
      setAutoCaptureProgress({ current: i + 1, total: modals.length });
      
      const screenshot = await captureModal(modals[i]);
      if (screenshot) {
        capturedScreenshots.push(screenshot);
      }
      
      // 다음 모달 캡처 전 대기
      await new Promise(r => setTimeout(r, 500));
    }

    // 캡처된 스크린샷 추가
    if (capturedScreenshots.length > 0) {
      setManualScreenshots(prev => [...prev, ...capturedScreenshots]);
      console.log(`✅ 자동 캡처 완료: ${capturedScreenshots.length}/${modals.length}개`);
    }

    setIsAutoCapturing(false);
    setAutoCaptureProgress({ current: 0, total: 0 });
    
    if (capturedScreenshots.length < modals.length) {
      alert(`${capturedScreenshots.length}/${modals.length}개 모달 캡처 성공\n\n일부 모달은 캡처되지 않았습니다.`);
    }
  }, [extractModalsFromWizardData, captureModal]);

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
              screen.status === 'in_review'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700'
            }`}>
              {screen.status === 'in_review' ? '검토중' : '초안'}
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
      <div className="flex-1 overflow-hidden relative">
        {/* 📸 숨겨진 프로토타입 iframe (스크린샷 캡처용 - 항상 렌더링) */}
        {screen.prototype_html && (
          <div 
            className="absolute inset-0 w-full h-full"
            style={{ 
              visibility: currentView === 'prototype' ? 'visible' : 'hidden',
              zIndex: currentView === 'prototype' ? 1 : -1,
              pointerEvents: currentView === 'prototype' ? 'auto' : 'none'
            }}
          >
            {/* 캡처 컨트롤 바 */}
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-background/90 backdrop-blur-sm rounded-lg p-2 shadow-lg border">
              {/* 수동 캡처 버튼 */}
              <Button
                size="sm"
                variant="outline"
                onClick={handleManualCapture}
                disabled={isCapturing || isAutoCapturing}
                className="flex items-center gap-2"
              >
                <Camera className="h-4 w-4" />
                {isCapturing ? '캡처 중...' : '화면 캡처'}
              </Button>
              
              {/* 자동 모달 캡처 버튼 */}
              <Button
                size="sm"
                variant="secondary"
                onClick={handleAutoCapture}
                disabled={isCapturing || isAutoCapturing}
                className="flex items-center gap-2"
              >
                {isAutoCapturing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {autoCaptureProgress.current}/{autoCaptureProgress.total}
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    자동 캡처
                  </>
                )}
              </Button>
              
              {manualScreenshots.length > 0 && (
                <>
                  <div className="h-6 w-px bg-border" />
                  <div className="flex items-center gap-1">
                    <Image className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{manualScreenshots.length}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleClearAllScreenshots}
                    className="text-destructive hover:text-destructive"
                    disabled={isAutoCapturing}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>

            {/* 캡처된 스크린샷 썸네일 */}
            {manualScreenshots.length > 0 && (
              <div className="absolute bottom-4 left-4 right-4 z-10">
                <div className="bg-background/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border">
                  <div className="text-xs text-muted-foreground mb-2">
                    캡처된 스크린샷 ({manualScreenshots.length}개)
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {manualScreenshots.map((screenshot) => (
                      <div
                        key={screenshot.id}
                        className="relative group flex-shrink-0"
                      >
                        <img
                          src={screenshot.dataUrl}
                          alt={screenshot.label}
                          className="h-16 w-24 object-cover rounded border"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-xs px-1 py-0.5 truncate rounded-b">
                          {screenshot.label}
                        </div>
                        <button
                          onClick={() => handleDeleteScreenshot(screenshot.id)}
                          className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <CodePreview
              ref={iframeRef}
              code={screen.prototype_html}
            />
          </div>
        )}

        {currentView === 'prompt' && (
          <div className="h-full overflow-hidden">
            <PrototypeWizard
              screenId={parseInt(screenId || '0')}
              onGenerate={handleGenerate}
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
              iframeRef={iframeRef}
              prototypeCode={screen.prototype_html || ''}
              manualScreenshots={manualScreenshots}
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
