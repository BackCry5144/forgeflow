import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles } from 'lucide-react';

interface PromptPanelProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  onGenerate: () => void;
  loading: boolean;
  hasPrototype: boolean;
}

export function PromptPanel({
  prompt,
  onPromptChange,
  onGenerate,
  loading,
  hasPrototype,
}: PromptPanelProps) {
  const handleGenerate = () => {
    if (prompt.trim()) {
      onGenerate();
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 bg-background">
      <div className="max-w-4xl w-full space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-3">화면 요구사항을 입력하세요</h2>
          <p className="text-muted-foreground text-lg">
            AI가 요구사항을 분석하여 프로토타입을 생성합니다
          </p>
        </div>

        <Textarea
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder="예: 사용자 목록을 표시하고, 검색 및 필터링 기능이 있는 테이블을 만들어주세요. 각 행에는 이름, 이메일, 상태가 표시되어야 합니다."
          className="min-h-[400px] text-base resize-none"
          disabled={loading}
        />

        <Button
          onClick={handleGenerate}
          disabled={!prompt.trim() || loading}
          size="lg"
          className="w-full h-14 text-base"
        >
          <Sparkles className="mr-2 h-5 w-5" />
          {loading ? '생성 중...' : hasPrototype ? '프로토타입 재생성' : '프로토타입 생성'}
        </Button>
      </div>
    </div>
  );
}
