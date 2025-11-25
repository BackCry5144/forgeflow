import { useRef } from 'react';
import { CodePreview } from './CodePreview';
import { PromptPanel } from './PromptPanel';
import { useScreenshot } from '@/hooks/useScreenshot'; // Hook 경로 확인 필요
import { FileText, Loader2 } from 'lucide-react'; // Download 제거

interface ScreenDetailProps {
  // screenId: number; // 사용하지 않으므로 제거
  screenName: string;
  code: string;           // 생성된 프로토타입 코드
  prompt: string;         // 프롬프트 입력값
  loading: boolean;       // AI 생성 로딩 상태
  
  // 이벤트 핸들러 (상위로 전파)
  onPromptChange: (value: string) => void;
  onGenerate: () => void;
}

export function ScreenDetail({
  // screenId, // 사용하지 않으므로 제거
  screenName,
  code,
  prompt,
  loading,
  onPromptChange,
  onGenerate,
}: ScreenDetailProps) {
  // 1. Iframe 접근을 위한 Ref
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // 2. 스크린샷 캡처 Hook
  const { captureIframe, isCapturing } = useScreenshot();
  
  // 3. 설계서 생성 핸들러 (이 로직은 Ref 때문에 여기서 수행)
  const handleGenerateDesignDoc = async () => {
    if (!iframeRef.current) {
      alert("미리보기 화면이 로드되지 않았습니다.");
      return;
    }

    if (!code) {
        alert("생성된 코드가 없습니다. 먼저 프로토타입을 생성해주세요.");
        return;
    }

    try {
      // (A) 스크린샷 캡처
      const screenshot = await captureIframe(iframeRef, '메인화면');
      
      if (!screenshot) {
        alert("스크린샷 캡처에 실패했습니다.");
        return;
      }

      // (B) 백엔드 전송 데이터 준비
      const formData = new FormData();
      formData.append('screenshots', screenshot.blob, 'main_preview.png');
      formData.append('screenshot_labels', screenshot.label);

      // (C) API 호출 (Step 1 테스트용)
      const response = await fetch(`/api/ai/documents/designDoc`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        // 성공 시 파일 다운로드 처리 (Step 3에서 완성될 로직이지만 미리 넣어둠)
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${screenName}_화면설계서.docx`; // 파일명 지정
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url); // URL 해제
      } else {
        const errorText = await response.text();
        console.error("서버 에러:", errorText);
        alert("설계서 생성 중 서버 오류가 발생했습니다.");
      }

    } catch (e) {
      console.error("에러 발생:", e);
      alert("오류가 발생했습니다.");
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      
      {/* 1. 상단 툴바 (제목 + 설계서 버튼) */}
      <div className="h-14 border-b bg-white px-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-800">{screenName}</h2>
            {loading && <span className="text-sm text-blue-500 flex items-center gap-1"><Loader2 size={14} className="animate-spin"/> 생성 중...</span>}
        </div>
        
        <div className="flex items-center gap-2">
            <button
                onClick={handleGenerateDesignDoc}
                disabled={isCapturing || !code || loading}
                className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    !code || loading
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : isCapturing
                            ? "bg-blue-100 text-blue-700 cursor-wait"
                            : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                }`}
            >
                {isCapturing ? (
                    <Loader2 size={16} className="animate-spin" />
                ) : (
                    <FileText size={16} />
                )}
                {isCapturing ? "캡처 및 생성 중..." : "설계서 생성"}
            </button>
        </div>
      </div>

      {/* 2. 메인 영역 (CodePreview) */}
      <div className="flex-1 relative overflow-hidden p-4">
        <div className="w-full h-full bg-white rounded-lg shadow-sm border overflow-hidden relative">
            <CodePreview 
              code={code} 
              // ref={iframeRef} // forwardRef가 아니면 ref 전달 제거
            />
        </div>
      </div>

      {/* 3. 하단 프롬프트 패널 (Props로 전달받은 핸들러 연결) */}
      <div className="flex-shrink-0 border-t bg-white p-4">
        <PromptPanel
          prompt={prompt}
          onPromptChange={onPromptChange}
          onGenerate={onGenerate}
          loading={loading}
          hasPrototype={!!code}
        />
      </div>
    </div>
  );
}