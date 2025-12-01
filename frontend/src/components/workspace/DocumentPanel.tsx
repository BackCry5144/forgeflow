// 반복되는 탭 컨텐츠 컴포넌트 분리
interface DocumentTabContentProps {
  label: string;
  icon: React.ReactNode;
  doc: string | null;
  status: string;
  loading: boolean;
  onGenerate: () => void;
  onDownload: (content: string, filename: string) => void;
  downloadName: string;
  needsPrototype?: boolean; // 프로토타입 필요 여부
}

function DocumentTabContent({ label, icon, doc, status, loading, onGenerate, onDownload, downloadName, needsPrototype }: DocumentTabContentProps) {
  return (
    !doc ? (
      <Card className="h-full">
        <CardContent className="flex flex-col items-center justify-center h-full py-16">
          {icon}
          <div className="text-center">
            <div className="text-2xl font-medium mb-3">{label}가 없습니다</div>
            <div className="text-muted-foreground text-lg">
              {status === 'draft' ? '프로토타입을 먼저 생성해주세요.' : null}
              {needsPrototype && status === 'in_review' && (
                <div className="text-sm text-amber-600 mt-2">
                  📸 프로토타입 탭에서 화면을 먼저 확인해주세요
                </div>
              )}
            </div>
            {status === 'in_review' && (
              <Button
                className="mt-6"
                variant="default"
                onClick={onGenerate}
                disabled={loading}
              >
                {loading ? '생성 중...' : `${label} 생성`}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    ) : (
      <div className="space-y-4 h-full flex flex-col">
        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={() => onDownload(doc, downloadName)}
          >
            <Download className="mr-2 h-4 w-4" />
            다운로드
          </Button>
        </div>
        <Card className="flex-1">
          <CardContent className="pt-6 h-full">
            <div className="prose max-w-none overflow-y-auto h-full pr-4">
              {/* 설계서 영역은 안내 메시지만 표시 (랜더링 없음) */}
              <div className="text-muted-foreground text-lg">
                설계서는 Word 파일로 저장되어 있습니다. 다운로드 버튼을 이용해 파일을 받아주세요.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  );
}
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, TestTube, BookOpen, Download, Image } from 'lucide-react';


import { useState, RefObject } from 'react';
import { aiService } from '@/services/aiService';
import type { GenerateRequest } from '@/types/ai';
import { useScreenshot } from '@/hooks/useScreenshot';
import type { CapturedScreenshot } from '@/pages/ScreenWorkspacePage';


export function DocumentPanel(props: {
  designDoc: string | null;
  testPlan: string | null;
  manual: string | null;
  status: string;
  screenId: number;
  menuName: string;
  screenName: string;
  wizardData?: any;
  iframeRef?: RefObject<HTMLIFrameElement>; // 📸 프로토타입 iframe ref
  prototypeCode?: string; // 프로토타입 코드 (향후 사용)
  manualScreenshots?: CapturedScreenshot[]; // 📸 수동 캡처 스크린샷
}) {
  const { designDoc, testPlan, manual, status, screenId, menuName, screenName, wizardData, iframeRef, manualScreenshots = [] } = props;
  const [loadingDesign, setLoadingDesign] = useState(false);
  const [loadingTest, setLoadingTest] = useState(false);
  const [loadingManual, setLoadingManual] = useState(false);
  const [localDesignDoc, setLocalDesignDoc] = useState<string | null>(designDoc);
  const [localTestPlan, setLocalTestPlan] = useState<string | null>(testPlan);
  const [localManual, setLocalManual] = useState<string | null>(manual);
  
  // 📸 스크린샷 캡처 훅
  const { captureIframe } = useScreenshot();

  // [수정] 파일 다운로드 핸들러
  const downloadDocument = async (content: string, filename: string) => {
    
    console.info("downloadDocument Start:", filename);

    // 1. 설계서(.docx)인 경우: 서버에서 파일 스트림 받아오기 (GET)
    if (filename.endsWith('.docx')) {
      try {
        // 저장된 파일 다운로드 API 호출
        const response = await fetch(`/api/ai/screens/${screenId}/documents/design/download`);

        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename; // 전달받은 파일명 사용
          document.body.appendChild(a);
          a.click();

          // 메모리 해제 및 요소 제거
          setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
          }, 100);
        } else {
          if (response.status === 404) {
            alert("생성된 설계서가 없습니다. 먼저 '설계서 생성'을 진행해 주세요.");
          } else {
            alert("파일 다운로드에 실패했습니다. 서버 상태를 확인해 주세요.");
          }
        }
      } catch (e) {
        console.error("Download failed:", e);
        alert("다운로드 중 오류가 발생했습니다.");
      }
      return;
    }

    // 2. 그 외 파일(.md 등): 텍스트 기반 다운로드 (기존 로직 유지)
    // (테스트 계획서나 매뉴얼이 아직 마크다운 방식이라면 이 로직을 탑니다)
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 100);
  };

  const generateRequest: GenerateRequest = {
    screen_id: screenId,
    menu_name: menuName,
    screen_name: screenName,
    wizard_data: wizardData,
  };

  // ✅ [수정] 설계서 생성 및 다운로드 핸들러 (ScreenDetail에서 이사 옴)
  const handleGenerateDesign = async () => {
    
    console.log("handleGenerateDesign Start");

    setLoadingDesign(true);
    try {
      // 1. 전송 데이터 준비
      console.log("1. 전송 데이터 준비");
      const formData = new FormData();
      formData.append('screen_id', screenId.toString());

      // 📸 2. 메인 화면 스크린샷 캡처
      console.log("2. 메인 화면 스크린샷 캡처 시도");
      if (iframeRef?.current) {
        try {
          const screenshot = await captureIframe(iframeRef, '메인화면');
          if (screenshot) {
            console.log(`   ✅ 스크린샷 캡처 성공: ${screenshot.label} (${screenshot.blob.size} bytes)`);
            formData.append('screenshots', screenshot.blob, `${screenshot.label}.png`);
            formData.append('screenshot_labels', screenshot.label);
          } else {
            console.warn("   ⚠️ 스크린샷 캡처 실패: null 반환");
          }
        } catch (captureError) {
          console.error("   ❌ 스크린샷 캡처 에러:", captureError);
          // 캡처 실패해도 설계서 생성은 계속 진행
        }
      } else {
        console.warn("   ⚠️ iframeRef가 없음 - 스크린샷 없이 진행");
      }

      // 📸 3. 수동 캡처 스크린샷 추가
      if (manualScreenshots.length > 0) {
        console.log(`3. 수동 캡처 스크린샷 추가: ${manualScreenshots.length}개`);
        for (const screenshot of manualScreenshots) {
          formData.append('screenshots', screenshot.blob, `${screenshot.label}.png`);
          formData.append('screenshot_labels', screenshot.label);
          console.log(`   📸 추가: ${screenshot.label} (${screenshot.blob.size} bytes)`);
        }
      }

      // 4. API 호출
      console.log("4. API 호출");
      const response = await fetch(`/api/ai/documents/designDoc`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        // 5. 파일 다운로드 처리
        console.log("5. 파일 다운로드 처리");
        const blob = await response.blob();
        
        // 파일명 추출
        const disposition = response.headers.get('Content-Disposition');
        let filename = `${screenName}_화면설계서.docx`;
        if (disposition && disposition.includes('filename=')) {
            filename = disposition.split('filename=')[1].replace(/["']/g, '');
            try { filename = decodeURIComponent(filename); } catch(e) {}
        }

        // 브라우저 다운로드 트리거
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        
        // 6. 뒷정리
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            console.log("6. 뒷정리 완료");
        }, 100);

        // 7. UI 상태 업데이트 (성공 표시용)
        console.log("7. UI 상태 업데이트 (성공 표시용)");
        setLocalDesignDoc(`### ✅ 설계서 생성 완료\n\n**파일명:** ${filename}\n\n파일이 자동으로 다운로드되었습니다. 다시 다운로드하려면 우측 상단의 버튼을 클릭하세요.`);
        
      } else {
        const errorText = await response.text();
        console.error("서버 에러:", errorText);
        alert("설계서 생성 실패: " + errorText);
      }
    } catch (e) {
      console.error("에러 발생:", e);
      alert("오류가 발생했습니다.");
    } finally {
      setLoadingDesign(false);
    }
  };

  const handleGenerateTest = async () => {
    setLoadingTest(true);
    try {
      const res = await aiService.generateTestPlan(generateRequest);
      setLocalTestPlan(res.design_doc); // If test_plan is returned, use res.test_plan
    } finally {
      setLoadingTest(false);
    }
  };

  const handleGenerateManual = async () => {
    setLoadingManual(true);
    try {
      const res = await aiService.generateManual(generateRequest);
      setLocalManual(res.design_doc); // If manual is returned, use res.manual
    } finally {
      setLoadingManual(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-6 bg-background">
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-2">설계 문서</h2>
        <p className="text-muted-foreground text-lg">
          생성된 설계서와 산출물을 확인하세요
        </p>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <Tabs defaultValue="design" className="flex-1 flex flex-col">
          <TabsList className="w-fit mb-4">
            <TabsTrigger value="design" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              설계서
              {manualScreenshots.length > 0 && (
                <span className="bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 rounded-full flex items-center gap-1">
                  <Image className="h-3 w-3" />
                  {manualScreenshots.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="test">
              <TestTube className="mr-2 h-4 w-4" />
              테스트계획서
            </TabsTrigger>
            <TabsTrigger value="manual">
              <BookOpen className="mr-2 h-4 w-4" />
              매뉴얼
            </TabsTrigger>
          </TabsList>
          <div className="flex-1 overflow-y-auto">
            <TabsContent value="design" className="mt-0 h-full">
              <DocumentTabContent
                label="설계서"
                icon={<FileText className="h-24 w-24 text-muted-foreground mb-6" />}
                doc={localDesignDoc}
                status={status}
                loading={loadingDesign}
                onGenerate={handleGenerateDesign}
                onDownload={downloadDocument}
                downloadName="설계서.md"
              />
            </TabsContent>

            <TabsContent value="test" className="mt-0 h-full">
              <DocumentTabContent
                label="테스트 계획서"
                icon={<TestTube className="h-24 w-24 text-muted-foreground mb-6" />}
                doc={localTestPlan}
                status={status}
                loading={loadingTest}
                onGenerate={handleGenerateTest}
                onDownload={downloadDocument}
                downloadName="테스트계획서.md"
              />
            </TabsContent>

            <TabsContent value="manual" className="mt-0 h-full">
              <DocumentTabContent
                label="매뉴얼"
                icon={<BookOpen className="h-24 w-24 text-muted-foreground mb-6" />}
                doc={localManual}
                status={status}
                loading={loadingManual}
                onGenerate={handleGenerateManual}
                onDownload={downloadDocument}
                downloadName="사용자매뉴얼.md"
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
