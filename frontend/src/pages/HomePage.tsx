export default function HomePage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">대시보드</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {/* 대시보드 카드 */}
        <div className="p-6 bg-white rounded-lg shadow flex flex-col items-center">
          <span className="text-5xl font-bold text-blue-600 mb-2">12</span>
          <span className="text-lg text-muted-foreground">전체 메뉴</span>
        </div>
        <div className="p-6 bg-white rounded-lg shadow flex flex-col items-center">
          <span className="text-5xl font-bold text-green-600 mb-2">34</span>
          <span className="text-lg text-muted-foreground">전체 화면</span>
        </div>
        <div className="p-6 bg-white rounded-lg shadow flex flex-col items-center">
          <span className="text-5xl font-bold text-purple-600 mb-2">5</span>
          <span className="text-lg text-muted-foreground">최근 완료</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 프로토타입/설계서 진행률 차트 */}
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">진행률 차트</h2>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-1">
                <span className="font-medium">프로토타입 생성 진행률</span>
                <span className="text-sm text-muted-foreground">80%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div className="bg-blue-500 h-4 rounded-full" style={{ width: '80%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="font-medium">설계서 생성 진행률</span>
                <span className="text-sm text-muted-foreground">65%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div className="bg-green-500 h-4 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* 최근 완료된 화면 리스트 */}
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">최근 완료된 화면</h2>
          <ul className="space-y-3">
            <li className="flex items-center justify-between">
              <span className="font-medium">생산현황 대시보드</span>
              <span className="text-xs text-green-600">완료</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="font-medium">설비관리 화면</span>
              <span className="text-xs text-green-600">완료</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="font-medium">작업지시 관리</span>
              <span className="text-xs text-green-600">완료</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="font-medium">불량 분석</span>
              <span className="text-xs text-green-600">완료</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="font-medium">공정 모니터링</span>
              <span className="text-xs text-green-600">완료</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
