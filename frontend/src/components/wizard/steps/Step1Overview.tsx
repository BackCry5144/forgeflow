import { Step1Data } from '@/types/wizard.types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface Step1OverviewProps {
  data: Step1Data;
  onChange: (data: Step1Data) => void;
}

export function Step1Overview({ data, onChange }: Step1OverviewProps) {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">어떤 화면을 만들까요?</h2>
        <p className="mt-2 text-gray-600">화면의 기본 정보를 입력해주세요</p>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>화면 개요</CardTitle>
          <CardDescription>
            생성할 화면의 이름과 목적을 설명해주세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 화면명 */}
          <div className="space-y-2">
            <Label htmlFor="screenName">
              화면명 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="screenName"
              placeholder="예: 생산실적 조회"
              value={data.screenName}
              onChange={(e) => onChange({ ...data, screenName: e.target.value })}
            />
          </div>

          {/* 화면 설명 */}
          <div className="space-y-2">
            <Label htmlFor="description">
              화면 설명 <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="이 화면의 목적과 주요 기능을 설명해주세요"
              rows={4}
              value={data.description}
              onChange={(e) => onChange({ ...data, description: e.target.value })}
            />
            <p className="text-xs text-gray-500">
              💡 구체적으로 작성할수록 더 정확한 프로토타입이 생성됩니다
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
