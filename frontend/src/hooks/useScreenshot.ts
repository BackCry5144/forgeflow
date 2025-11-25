// hooks/useScreenshot.ts
import { useState, useCallback } from 'react';
import html2canvas from 'html2canvas';

export const useScreenshot = () => {
  const [isCapturing, setIsCapturing] = useState(false);

  const captureIframe = useCallback(async (
    iframeRef: React.RefObject<HTMLIFrameElement>,
    label: string = 'main'
  ): Promise<{ label: string; blob: Blob } | null> => {
    const iframe = iframeRef.current;
    
    // 1. 유효성 검사
    if (!iframe || !iframe.contentDocument || !iframe.contentDocument.body) {
      console.error("❌ Iframe을 찾을 수 없습니다.");
      return null;
    }

    setIsCapturing(true);

    try {
      const iframeBody = iframe.contentDocument.body;

      // 2. html2canvas로 캡처
      const canvas = await html2canvas(iframeBody, {
        useCORS: true,       // 외부 이미지 허용
        logging: false,      // 로그 끄기
        scale: 2,            // 고해상도 (Retina 대응)
        width: iframeBody.scrollWidth,  // 전체 스크롤 영역 캡처
        height: iframeBody.scrollHeight,
        windowWidth: iframeBody.scrollWidth,
        windowHeight: iframeBody.scrollHeight,
        x: 0,
        y: 0,
      });

      // 3. Blob 변환
      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve({ label, blob });
          } else {
            resolve(null);
          }
        }, 'image/png', 1.0);
      });

    } catch (error) {
      console.error("❌ 스크린샷 캡처 실패:", error);
      return null;
    } finally {
      setIsCapturing(false);
    }
  }, []);

  return { captureIframe, isCapturing };
};