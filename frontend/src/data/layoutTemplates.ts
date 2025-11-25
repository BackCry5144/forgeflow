import { LayoutType, LayoutTemplate, LayoutArea } from '@/types/wizard.types';

export const LAYOUT_TEMPLATES: Record<LayoutType, LayoutTemplate> = {
  'search-grid': {
    id: 'search-grid',
    name: 'SearchGrid',
    description: '검색 + 그리드 레이아웃 (작업지시 조회, 자재 목록)',
    htmlTemplate: `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SearchGrid Layout - MES</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script defer src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js"></script>
</head>
<body class="bg-gray-100">
  <div x-data="{
    searchQuery: '',
    items: [
      { id: 'WO-001', name: '작업지시-001', status: '진행중', date: '2025-11-10' },
      { id: 'WO-002', name: '작업지시-002', status: '대기', date: '2025-11-10' },
      { id: 'WO-003', name: '작업지시-003', status: '완료', date: '2025-11-09' }
    ],
    get filteredItems() {
      return this.items.filter(item => 
        item.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
  }" class="container mx-auto p-6">
    
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">작업지시 조회</h1>
      <p class="text-gray-600">생산 작업지시 목록</p>
    </div>

    <!-- Search Bar -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="flex gap-4">
        <input 
          type="text" 
          x-model="searchQuery"
          placeholder="작업지시 검색..."
          class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
        <button class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          검색
        </button>
        <button class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          초기화
        </button>
      </div>
    </div>

    <!-- Data Grid -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">작업명</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">날짜</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">액션</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <template x-for="item in filteredItems" :key="item.id">
            <tr class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" x-text="item.id"></td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900" x-text="item.name"></td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  class="px-2 py-1 text-xs font-semibold rounded-full"
                  :class="{
                    'bg-green-100 text-green-800': item.status === '완료',
                    'bg-blue-100 text-blue-800': item.status === '진행중',
                    'bg-yellow-100 text-yellow-800': item.status === '대기'
                  }"
                  x-text="item.status"
                ></span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500" x-text="item.date"></td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <button class="text-blue-600 hover:text-blue-900 mr-3">상세</button>
                <button class="text-gray-600 hover:text-gray-900">수정</button>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

  </div>
</body>
</html>`
  },

  'master-detail': {
    id: 'master-detail',
    name: 'MasterDetail',
    description: '마스터-디테일 레이아웃 (작업지시서, 설비 정보)',
    htmlTemplate: `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MasterDetail Layout - MES</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script defer src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js"></script>
</head>
<body class="bg-gray-100 h-screen">
  <div x-data="{
    selectedItem: null,
    items: [
      { id: 1, name: '작업지시-001', equipment: '설비-A', product: '제품-X', qty: 100, status: '진행중' },
      { id: 2, name: '작업지시-002', equipment: '설비-B', product: '제품-Y', qty: 200, status: '대기' },
      { id: 3, name: '작업지시-003', equipment: '설비-C', product: '제품-Z', qty: 150, status: '완료' }
    ],
    selectItem(item) {
      this.selectedItem = item;
    }
  }" 
  x-init="selectedItem = items[0]"
  class="flex h-full">
    
    <!-- Master List (Left) -->
    <div class="w-1/3 bg-white border-r border-gray-200 overflow-y-auto">
      <div class="p-4 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900">작업지시 목록</h2>
      </div>
      
      <div class="divide-y divide-gray-200">
        <template x-for="item in items" :key="item.id">
          <div 
            @click="selectItem(item)"
            class="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
            :class="{ 'bg-blue-50 border-l-4 border-blue-600': selectedItem?.id === item.id }"
          >
            <div class="flex justify-between items-start">
              <div>
                <h3 class="font-medium text-gray-900" x-text="item.name"></h3>
                <p class="text-sm text-gray-500" x-text="item.equipment"></p>
              </div>
              <span 
                class="px-2 py-1 text-xs font-semibold rounded-full"
                :class="{
                  'bg-green-100 text-green-800': item.status === '완료',
                  'bg-blue-100 text-blue-800': item.status === '진행중',
                  'bg-yellow-100 text-yellow-800': item.status === '대기'
                }"
                x-text="item.status"
              ></span>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Detail Panel (Right) -->
    <div class="flex-1 bg-gray-50 overflow-y-auto">
      <template x-if="selectedItem">
        <div class="p-6">
          <div class="bg-white rounded-lg shadow p-6 mb-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4" x-text="selectedItem.name"></h2>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">설비</label>
                <p class="text-gray-900" x-text="selectedItem.equipment"></p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">제품</label>
                <p class="text-gray-900" x-text="selectedItem.product"></p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">수량</label>
                <p class="text-gray-900" x-text="selectedItem.qty + ' EA'"></p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">상태</label>
                <p class="text-gray-900" x-text="selectedItem.status"></p>
              </div>
            </div>

            <div class="mt-6 flex gap-3">
              <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                수정
              </button>
              <button class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                삭제
              </button>
            </div>
          </div>
        </div>
      </template>
    </div>

  </div>
</body>
</html>`
  },

  'dashboard': {
    id: 'dashboard',
    name: 'Dashboard',
    description: '대시보드 레이아웃 (생산 현황판, 실시간 모니터링)',
    htmlTemplate: `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard Layout - MES</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script defer src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js"></script>
</head>
<body class="bg-gray-100">
  <div x-data="{
    kpis: {
      production: { label: '금일 생산량', value: '1,234', unit: 'EA', trend: '+12%' },
      quality: { label: '품질 합격률', value: '98.5', unit: '%', trend: '+2.1%' },
      efficiency: { label: '설비 가동률', value: '87.3', unit: '%', trend: '-3.2%' }
    }
  }" class="container mx-auto p-6">
    
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">생산 현황판</h1>
      <p class="text-gray-600">실시간 생산 모니터링 대시보드</p>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-3 gap-6 mb-6">
      <template x-for="(kpi, key) in kpis" :key="key">
        <div class="bg-white rounded-lg shadow p-6">
          <p class="text-sm text-gray-600 mb-2" x-text="kpi.label"></p>
          <div class="flex items-baseline justify-between">
            <div>
              <span class="text-3xl font-bold text-gray-900" x-text="kpi.value"></span>
              <span class="text-lg text-gray-500 ml-1" x-text="kpi.unit"></span>
            </div>
            <span 
              class="text-sm font-semibold"
              :class="kpi.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'"
              x-text="kpi.trend"
            ></span>
          </div>
        </div>
      </template>
    </div>

    <!-- Charts -->
    <div class="grid grid-cols-2 gap-6">
      <!-- Production Chart -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">시간별 생산량</h3>
        <div class="h-64 flex items-end justify-around gap-2">
          <div class="flex-1 bg-blue-500 rounded-t" style="height: 60%"></div>
          <div class="flex-1 bg-blue-500 rounded-t" style="height: 75%"></div>
          <div class="flex-1 bg-blue-500 rounded-t" style="height: 85%"></div>
          <div class="flex-1 bg-blue-500 rounded-t" style="height: 70%"></div>
          <div class="flex-1 bg-blue-500 rounded-t" style="height: 90%"></div>
          <div class="flex-1 bg-blue-500 rounded-t" style="height: 65%"></div>
        </div>
      </div>

      <!-- Status Summary -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">설비 가동 현황</h3>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-gray-700">가동 중</span>
            <div class="flex items-center gap-2">
              <div class="w-32 h-3 bg-gray-200 rounded-full overflow-hidden">
                <div class="h-full bg-green-500 rounded-full" style="width: 75%"></div>
              </div>
              <span class="text-sm font-semibold text-gray-900">15대</span>
            </div>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-gray-700">대기 중</span>
            <div class="flex items-center gap-2">
              <div class="w-32 h-3 bg-gray-200 rounded-full overflow-hidden">
                <div class="h-full bg-yellow-500 rounded-full" style="width: 20%"></div>
              </div>
              <span class="text-sm font-semibold text-gray-900">4대</span>
            </div>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-gray-700">정지 중</span>
            <div class="flex items-center gap-2">
              <div class="w-32 h-3 bg-gray-200 rounded-full overflow-hidden">
                <div class="h-full bg-red-500 rounded-full" style="width: 5%"></div>
              </div>
              <span class="text-sm font-semibold text-gray-900">1대</span>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</body>
</html>`
  },

  'kanban': {
    id: 'kanban',
    name: 'Kanban',
    description: '칸반보드 레이아웃 (작업 진행 상태, 공정 관리)',
    htmlTemplate: `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kanban Layout - MES</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script defer src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js"></script>
</head>
<body class="bg-gray-100 h-screen">
  <div x-data="{
    columns: [
      { 
        id: 'todo', 
        title: '대기', 
        cards: [
          { id: 1, title: '작업-001', description: '절단 작업', priority: 'high' },
          { id: 2, title: '작업-002', description: '조립 작업', priority: 'medium' }
        ]
      },
      { 
        id: 'inprogress', 
        title: '진행중', 
        cards: [
          { id: 3, title: '작업-003', description: '용접 작업', priority: 'high' }
        ]
      },
      { 
        id: 'done', 
        title: '완료', 
        cards: [
          { id: 4, title: '작업-004', description: '검사 작업', priority: 'low' },
          { id: 5, title: '작업-005', description: '포장 작업', priority: 'medium' }
        ]
      }
    ]
  }" class="h-full flex flex-col">
    
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 p-4">
      <h1 class="text-2xl font-bold text-gray-900">작업 칸반보드</h1>
      <p class="text-gray-600">공정별 작업 진행 현황</p>
    </div>

    <!-- Kanban Board -->
    <div class="flex-1 overflow-x-auto p-6">
      <div class="flex gap-6 h-full">
        <template x-for="column in columns" :key="column.id">
          <div class="flex-1 min-w-[300px] bg-gray-50 rounded-lg p-4">
            <!-- Column Header -->
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold text-gray-900" x-text="column.title"></h3>
              <span class="px-2 py-1 bg-white rounded text-sm text-gray-600" x-text="column.cards.length"></span>
            </div>

            <!-- Cards -->
            <div class="space-y-3">
              <template x-for="card in column.cards" :key="card.id">
                <div class="bg-white rounded-lg shadow p-4 cursor-move hover:shadow-md transition-shadow">
                  <div class="flex items-start justify-between mb-2">
                    <h4 class="font-medium text-gray-900" x-text="card.title"></h4>
                    <span 
                      class="px-2 py-1 text-xs font-semibold rounded"
                      :class="{
                        'bg-red-100 text-red-800': card.priority === 'high',
                        'bg-yellow-100 text-yellow-800': card.priority === 'medium',
                        'bg-green-100 text-green-800': card.priority === 'low'
                      }"
                      x-text="card.priority"
                    ></span>
                  </div>
                  <p class="text-sm text-gray-600" x-text="card.description"></p>
                </div>
              </template>
            </div>

            <!-- Add Card Button -->
            <button class="w-full mt-3 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700">
              + 작업 추가
            </button>
          </div>
        </template>
      </div>
    </div>

  </div>
</body>
</html>`
  },

  'form': {
    id: 'form',
    name: 'Form',
    description: '입력 폼 레이아웃 (작업 등록, 품질 검사)',
    htmlTemplate: `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Form Layout - MES</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script defer src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js"></script>
</head>
<body class="bg-gray-100">
  <div x-data="{
    formData: {
      workOrder: '',
      equipment: '',
      product: '',
      quantity: '',
      startTime: '',
      worker: '',
      notes: ''
    },
    submitForm() {
      console.log('Form submitted:', this.formData);
      alert('작업이 등록되었습니다.');
    }
  }" class="container max-w-2xl mx-auto p-6">
    
    <!-- Form Header -->
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">작업 등록</h1>
      <p class="text-gray-600">새로운 작업을 등록합니다</p>
    </div>

    <!-- Form Body -->
    <form @submit.prevent="submitForm" class="bg-white rounded-lg shadow p-6 space-y-6">
      
      <!-- Work Order -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          작업지시 번호 <span class="text-red-500">*</span>
        </label>
        <input 
          type="text" 
          x-model="formData.workOrder"
          placeholder="WO-001"
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
      </div>

      <!-- Equipment -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          설비 <span class="text-red-500">*</span>
        </label>
        <select 
          x-model="formData.equipment"
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">선택하세요</option>
          <option value="equipment-a">설비-A</option>
          <option value="equipment-b">설비-B</option>
          <option value="equipment-c">설비-C</option>
        </select>
      </div>

      <!-- Product -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          제품명 <span class="text-red-500">*</span>
        </label>
        <input 
          type="text" 
          x-model="formData.product"
          placeholder="제품-X"
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
      </div>

      <!-- Quantity & Time -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            수량 (EA) <span class="text-red-500">*</span>
          </label>
          <input 
            type="number" 
            x-model="formData.quantity"
            placeholder="100"
            required
            min="1"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            시작 시간 <span class="text-red-500">*</span>
          </label>
          <input 
            type="datetime-local" 
            x-model="formData.startTime"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
        </div>
      </div>

      <!-- Worker -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          작업자 <span class="text-red-500">*</span>
        </label>
        <input 
          type="text" 
          x-model="formData.worker"
          placeholder="홍길동"
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
      </div>

      <!-- Notes -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          비고
        </label>
        <textarea 
          x-model="formData.notes"
          rows="4"
          placeholder="특이사항을 입력하세요..."
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        ></textarea>
      </div>

      <!-- Submit Buttons -->
      <div class="flex gap-3 pt-4">
        <button 
          type="submit"
          class="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          등록
        </button>
        <button 
          type="button"
          class="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          취소
        </button>
      </div>

    </form>

  </div>
</body>
</html>`
  }
};

// 레이아웃별 영역 정의
export const LAYOUT_AREAS: Record<LayoutType, LayoutArea[]> = {
  'search-grid': [
    {
      id: 'search-area',
      name: '검색 영역',
      description: '상단 검색 조건 입력',
      suggestedComponents: ['textbox', 'codeview', 'combo', 'date-picker', 'number-input', 'button']
    },
    {
      id: 'grid-toolbar',
      name: '그리드 툴바',
      description: '그리드 상단 액션 버튼',
      suggestedComponents: ['button', 'file-upload']
    },
    {
      id: 'grid-area',
      name: '그리드 영역',
      description: '데이터 표시',
      suggestedComponents: ['grid', 'badge', 'progress-bar']
    }
  ],
  'master-detail': [
    {
      id: 'master-toolbar',
      name: '마스터 툴바',
      description: '좌측 목록 상단',
      suggestedComponents: ['button', 'textbox', 'codeview']
    },
    {
      id: 'master-list',
      name: '마스터 목록',
      description: '좌측 항목 목록',
      suggestedComponents: ['card', 'badge']
    },
    {
      id: 'detail-header',
      name: '상세 헤더',
      description: '우측 상단 정보',
      suggestedComponents: ['button', 'badge']
    },
    {
      id: 'detail-form',
      name: '상세 폼',
      description: '우측 상세 내용',
      suggestedComponents: ['textbox', 'codeview', 'combo', 'textarea', 'date-picker', 'number-input', 'checkbox', 'radio']
    }
  ],
  'dashboard': [
    {
      id: 'kpi-area',
      name: 'KPI 카드 영역',
      description: '상단 주요 지표',
      suggestedComponents: ['card', 'badge', 'progress-bar']
    },
    {
      id: 'chart-left',
      name: '좌측 차트',
      description: '왼쪽 통계 차트',
      suggestedComponents: ['chart', 'combo', 'date-picker']
    },
    {
      id: 'chart-right',
      name: '우측 차트',
      description: '오른쪽 통계 차트',
      suggestedComponents: ['chart', 'combo', 'progress-bar']
    },
    {
      id: 'data-table',
      name: '하단 데이터 테이블',
      description: '상세 데이터',
      suggestedComponents: ['grid', 'button', 'badge']
    }
  ],
  'kanban': [
    {
      id: 'kanban-header',
      name: '칸반 헤더',
      description: '상단 필터/액션',
      suggestedComponents: ['combo', 'button', 'textbox', 'codeview', 'date-picker']
    },
    {
      id: 'todo-column',
      name: 'To Do 컬럼',
      description: '예정 작업',
      suggestedComponents: ['card', 'badge', 'button']
    },
    {
      id: 'inprogress-column',
      name: 'In Progress 컬럼',
      description: '진행 중 작업',
      suggestedComponents: ['card', 'badge', 'progress-bar', 'button']
    },
    {
      id: 'done-column',
      name: 'Done 컬럼',
      description: '완료 작업',
      suggestedComponents: ['card', 'badge', 'button']
    }
  ],
  'form': [
    {
      id: 'form-header',
      name: '폼 헤더',
      description: '상단 제목/설명',
      suggestedComponents: ['label', 'divider']
    },
    {
      id: 'form-section1',
      name: '기본 정보',
      description: '첫 번째 섹션',
      suggestedComponents: ['textbox', 'codeview', 'combo', 'date-picker', 'time-picker', 'number-input', 'checkbox', 'radio']
    },
    {
      id: 'form-section2',
      name: '추가 정보',
      description: '두 번째 섹션',
      suggestedComponents: ['textarea', 'file-upload', 'checkbox', 'combo', 'codeview']
    },
    {
      id: 'form-actions',
      name: '액션 버튼',
      description: '하단 저장/취소',
      suggestedComponents: ['button']
    }
  ]
};
