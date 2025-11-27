import { useRef } from 'react';
import { CodePreview } from './CodePreview';
import { PromptPanel } from './PromptPanel';
import { useScreenshot } from '@/hooks/useScreenshot'; // Hook 경로 확인 필요
import { FileText, Loader2 } from 'lucide-react'; // Download 제거

interface ScreenDetailProps {
  screenId: number; // 사용하지 않으므로 제거
  screenName: string;
    code: string;           // 생성된 프로토타입 코드
  prompt: string;         // 프롬프트 입력값
  loading: boolean;       // AI 생성 로딩 상태
  
  // 이벤트 핸들러 (상위로 전파)
  onPromptChange: (value: string) => void;
  onGenerate: () => void;
}

export function ScreenDetail({
  screenId,
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
      console.log("📸 스크린샷 캡처 시도...");
      const screenshot = await captureIframe(iframeRef, '메인화면');
      
      // (B) 백엔드 전송 데이터 준비
      const formData = new FormData();
      // 🔥 [중요] screenId를 문자로 변환해서 전송
      formData.append('screen_id', String(screenId)); 
      
      if (screenshot) {
        formData.append('screenshots', screenshot.blob, 'main_preview.png');
        formData.append('screenshot_labels', screenshot.label);
        console.log(`📸 스크린샷 추가됨 (${screenshot.blob.size} bytes)`);
      } else {
        console.log("⚠️ 스크린샷 없이 진행합니다.");
      }

      // (C) API 호출
      console.log("🚀 서버로 요청 전송 중...");
      const response = await fetch(`/api/ai/documents/designDoc`, { 
        method: 'POST',
        body: formData,
      });

      console.log(`📩 서버 응답 상태: ${response.status}`);

      if (response.ok) {
        // 🔥 [핵심] 응답 데이터를 Blob(파일)으로 변환
        const blob = await response.blob();
        console.log(`📦 파일 데이터 수신 완료: ${blob.size} bytes`);

        if (blob.size === 0) {
            alert("오류: 서버에서 빈 파일이 전송되었습니다.");
            return;
        }
        
        // 파일명 추출 (헤더에서 가져오거나 기본값 사용)
        const disposition = response.headers.get('Content-Disposition');
        let filename = `${screenName}_화면설계서.docx`;
        if (disposition && disposition.includes('filename=')) {
            // 따옴표 제거 및 디코딩
            filename = disposition.split('filename=')[1].replace(/["']/g, '');
            try {
                filename = decodeURIComponent(escape(filename)); // 한글 깨짐 방지 시도
            } catch(e) {
                // decode 실패 시 raw string 사용
            }
        }

        // 브라우저 다운로드 강제 실행 (a 태그 생성 -> 클릭 -> 삭제)
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename; // 다운로드될 파일명 지정
        document.body.appendChild(a); // Firefox 등을 위해 body에 추가
        a.click(); // 클릭 트리거
        
        // 정리
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            console.log("✅ 다운로드 완료 및 메모리 해제");
        }, 100);
        
      } else {
        const errorText = await response.text();
        console.error("❌ 서버 에러 내용:", errorText);
        alert(`설계서 생성 실패 (HTTP ${response.status}): ${errorText}`);
      }

    } catch (e) {
      console.error("❌ 클라이언트 스크립트 오류:", e);
      alert("문서 생성 중 브라우저 오류가 발생했습니다. 콘솔을 확인해주세요.");
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
          <CodePreview code={code} ref={iframeRef} />
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