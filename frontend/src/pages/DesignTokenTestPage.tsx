import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import designTokens from "@/design-tokens.json";

export default function DesignTokenTestPage() {
  const colors = designTokens.uxon.color;

  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="space-y-2">
        <h1 className="uxon-heading-xxlarge">UXON 디자인 토큰 적용 테스트</h1>
        <p className="uxon-body-large text-muted-foreground">
          ForgeFlow에 UXON 디자인 시스템이 적용되었습니다.
        </p>
      </div>

      {/* Typography Test */}
      <Card>
        <CardHeader>
          <CardTitle className="uxon-heading-large">타이포그래피</CardTitle>
          <CardDescription>UXON 타이포그래피 스타일</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="uxon-heading-xxlarge">Heading XXLarge</p>
            <p className="uxon-heading-xlarge">Heading XLarge</p>
            <p className="uxon-heading-large">Heading Large</p>
            <p className="uxon-heading-medium">Heading Medium</p>
            <p className="uxon-heading-small">Heading Small</p>
            <p className="uxon-heading-xsmall">Heading XSmall</p>
          </div>
          <div>
            <p className="uxon-body-xlarge">Body XLarge - 기본 본문 텍스트</p>
            <p className="uxon-body-large">Body Large - 기본 본문 텍스트</p>
            <p className="uxon-body-medium">Body Medium - 기본 본문 텍스트</p>
            <p className="uxon-body-small">Body Small - 기본 본문 텍스트</p>
            <p className="uxon-body-xsmall">Body XSmall - 기본 본문 텍스트</p>
          </div>
        </CardContent>
      </Card>

      {/* Color Palette Test */}
      <Card>
        <CardHeader>
          <CardTitle className="uxon-heading-large">컬러 팔레트</CardTitle>
          <CardDescription>UXON 디자인 시스템 색상</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4">
            {/* Blue */}
            <div>
              <p className="uxon-body-small font-bold mb-2">Blue</p>
              {Object.entries(colors.blue).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2 mb-1">
                  <div
                    className="w-8 h-8 rounded-4 border"
                    style={{ backgroundColor: value as string }}
                  />
                  <span className="text-xs">{key}</span>
                </div>
              ))}
            </div>

            {/* Green */}
            <div>
              <p className="uxon-body-small font-bold mb-2">Green</p>
              {Object.entries(colors.green).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2 mb-1">
                  <div
                    className="w-8 h-8 rounded-4 border"
                    style={{ backgroundColor: value as string }}
                  />
                  <span className="text-xs">{key}</span>
                </div>
              ))}
            </div>

            {/* Red */}
            <div>
              <p className="uxon-body-small font-bold mb-2">Red</p>
              {Object.entries(colors.red).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2 mb-1">
                  <div
                    className="w-8 h-8 rounded-4 border"
                    style={{ backgroundColor: value as string }}
                  />
                  <span className="text-xs">{key}</span>
                </div>
              ))}
            </div>

            {/* Orange */}
            <div>
              <p className="uxon-body-small font-bold mb-2">Orange</p>
              {Object.entries(colors.orange).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2 mb-1">
                  <div
                    className="w-8 h-8 rounded-4 border"
                    style={{ backgroundColor: value as string }}
                  />
                  <span className="text-xs">{key}</span>
                </div>
              ))}
            </div>

            {/* Neutral */}
            <div>
              <p className="uxon-body-small font-bold mb-2">Neutral</p>
              {Object.entries(colors.neutral).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2 mb-1">
                  <div
                    className="w-8 h-8 rounded-4 border"
                    style={{ backgroundColor: value as string }}
                  />
                  <span className="text-xs">{key}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Button Test */}
      <Card>
        <CardHeader>
          <CardTitle className="uxon-heading-large">버튼</CardTitle>
          <CardDescription>UXON 버튼 스타일 및 크기</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <p className="uxon-body-medium font-bold">Variants</p>
            <div className="flex flex-wrap gap-4">
              <Button variant="default">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="success">Success</Button>
              <Button variant="warning">Warning</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </div>
          </div>

          <div className="space-y-2">
            <p className="uxon-body-medium font-bold">Sizes</p>
            <div className="flex items-center gap-4">
              <Button size="sm">Small</Button>
              <Button size="default">Medium</Button>
              <Button size="lg">Large</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Spacing Test */}
      <Card>
        <CardHeader>
          <CardTitle className="uxon-heading-large">간격 (Spacing)</CardTitle>
          <CardDescription>UXON 스페이싱 시스템</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(designTokens.uxon.spacing).map(([key, value]) => (
              <div key={key} className="flex items-center gap-4">
                <span className="w-16 uxon-body-small">{key}:</span>
                <div
                  className="bg-primary h-8"
                  style={{ width: value as string }}
                />
                <span className="text-xs text-muted-foreground">{value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Border Radius Test */}
      <Card>
        <CardHeader>
          <CardTitle className="uxon-heading-large">둥근 모서리 (Border Radius)</CardTitle>
          <CardDescription>UXON 라운드 스타일</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-8">
            {Object.entries(designTokens.uxon.radius).map(([key, value]) => (
              <div key={key} className="text-center space-y-2">
                <div
                  className="w-24 h-24 bg-primary mx-auto"
                  style={{ borderRadius: value as string }}
                />
                <p className="uxon-body-small">{key}</p>
                <p className="text-xs text-muted-foreground">{value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
