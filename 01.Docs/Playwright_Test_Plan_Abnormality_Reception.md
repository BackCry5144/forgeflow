# Playwright 테스트 플랜: 이상발생관리 화면

## 📋 기본 정보

- **화면명**: 이상발생 접수 (Abnormality Reception)
- **Menu ID**: 131
- **목적**: Wizard를 통해 이상발생 접수 화면을 생성하고 Playwright로 자동화 테스트 수행
- **주요 기능**: 
  - 이상발생 검색 및 조회
  - 이상발생 접수 처리 (Reception)
  - 이상발생 등록 (Registration)
  - Code 조회 팝업 (Line/Oper/Equip/Mat/User)

---

## 🎯 테스트 시나리오 개요

### **Wizard 입력 데이터 구조**

```json
{
  "step1": {
    "screenName": "이상발생 접수",
    "description": "이상발생 접수 및 등록 정보를 관리하는 화면"
  },
  "step2": {
    "selectedLayout": "search-grid",
    "layoutAreas": [
      {
        "id": "search-area",
        "name": "검색 영역",
        "description": "이상발생 검색 조건 입력",
        "suggestedComponents": ["textbox", "combo", "date-picker", "button"]
      },
      {
        "id": "grid-toolbar",
        "name": "그리드 툴바",
        "description": "그리드 상단 액션 버튼",
        "suggestedComponents": ["button"]
      },
      {
        "id": "grid-area",
        "name": "그리드 영역",
        "description": "이상발생 목록 표시",
        "suggestedComponents": ["grid", "badge"]
      }
    ]
  },
  "step3": {
    "components": [
      {
        "id": "comp-search-date-from",
        "type": "date-picker",
        "label": "일자 (From)",
        "areaId": "search-area"
      },
      {
        "id": "comp-search-date-to",
        "type": "date-picker",
        "label": "일자 (To)",
        "areaId": "search-area"
      },
      {
        "id": "comp-search-status",
        "type": "combo",
        "label": "상태",
        "areaId": "search-area"
      },
      {
        "id": "comp-search-receipt-grade",
        "type": "combo",
        "label": "접수 등급",
        "areaId": "search-area"
      },
      {
        "id": "comp-search-occured-type",
        "type": "combo",
        "label": "발생 타입",
        "areaId": "search-area"
      },
      {
        "id": "comp-search-line-code",
        "type": "codeview",
        "label": "라인 코드",
        "areaId": "search-area"
      },
      {
        "id": "comp-search-oper-code",
        "type": "codeview",
        "label": "공정 코드",
        "areaId": "search-area"
      },
      {
        "id": "comp-search-equip-code",
        "type": "codeview",
        "label": "설비 코드",
        "areaId": "search-area"
      },
      {
        "id": "comp-search-mat-code",
        "type": "codeview",
        "label": "자재 코드",
        "areaId": "search-area"
      },
      {
        "id": "comp-search-abnormal-no",
        "type": "textbox",
        "label": "이상번호",
        "areaId": "search-area"
      },
      {
        "id": "comp-search-recipient",
        "type": "codeview",
        "label": "접수자",
        "areaId": "search-area"
      },
      {
        "id": "comp-btn-search",
        "type": "button",
        "label": "조회",
        "areaId": "search-area"
      },
      {
        "id": "comp-btn-reset",
        "type": "button",
        "label": "초기화",
        "areaId": "search-area"
      },
      {
        "id": "comp-btn-excel",
        "type": "button",
        "label": "Excel",
        "areaId": "grid-toolbar"
      },
      {
        "id": "comp-btn-reception",
        "type": "button",
        "label": "접수",
        "areaId": "grid-toolbar"
      },
      {
        "id": "comp-grid-abnormality",
        "type": "grid",
        "label": "이상발생 목록",
        "areaId": "grid-area"
      }
    ]
  },
  "step4": {
    "interactions": [
      {
        "id": "int-search",
        "triggerComponentId": "comp-btn-search",
        "triggerEvent": "click",
        "actionType": "fetch-data",
        "targetAreaId": "grid-area",
        "description": "검색 조건에 따라 이상발생 목록을 조회하여 그리드에 표시"
      },
      {
        "id": "int-reset",
        "triggerComponentId": "comp-btn-reset",
        "triggerEvent": "click",
        "actionType": "clear",
        "targetAreaId": "search-area",
        "description": "검색 조건 초기화"
      },
      {
        "id": "int-line-code-click",
        "triggerComponentId": "comp-search-line-code",
        "triggerEvent": "click",
        "actionType": "open-modal",
        "modalConfig": {
          "id": "modal-line-list",
          "title": "Line List 조회",
          "size": "md",
          "type": "form",
          "fields": [
            {
              "id": "field-search-type",
              "label": "조회 조건",
              "type": "combo",
              "required": false,
              "options": ["Code", "Description"]
            }
          ]
        },
        "description": "Line Code 클릭 시 Line List 조회 팝업 오픈"
      },
      {
        "id": "int-oper-code-click",
        "triggerComponentId": "comp-search-oper-code",
        "triggerEvent": "click",
        "actionType": "open-modal",
        "modalConfig": {
          "id": "modal-oper-list",
          "title": "Oper List 조회",
          "size": "md",
          "type": "form",
          "fields": [
            {
              "id": "field-search-type",
              "label": "조회 조건",
              "type": "combo",
              "required": false,
              "options": ["Code", "Description"]
            }
          ]
        },
        "description": "Oper Code 클릭 시 Oper List 조회 팝업 오픈"
      },
      {
        "id": "int-equip-code-click",
        "triggerComponentId": "comp-search-equip-code",
        "triggerEvent": "click",
        "actionType": "open-modal",
        "modalConfig": {
          "id": "modal-equip-list",
          "title": "Equip List 조회",
          "size": "md",
          "type": "form",
          "fields": [
            {
              "id": "field-search-type",
              "label": "조회 조건",
              "type": "combo",
              "required": false,
              "options": ["Code", "Description"]
            }
          ]
        },
        "description": "Equip Code 클릭 시 Equip List 조회 팝업 오픈"
      },
      {
        "id": "int-mat-code-click",
        "triggerComponentId": "comp-search-mat-code",
        "triggerEvent": "click",
        "actionType": "open-modal",
        "modalConfig": {
          "id": "modal-material-list",
          "title": "Material List 조회",
          "size": "md",
          "type": "form",
          "fields": [
            {
              "id": "field-search-type",
              "label": "조회 조건",
              "type": "combo",
              "required": false,
              "options": ["Code", "Description"]
            }
          ]
        },
        "description": "Mat Code 클릭 시 Material List 조회 팝업 오픈"
      },
      {
        "id": "int-recipient-click",
        "triggerComponentId": "comp-search-recipient",
        "triggerEvent": "click",
        "actionType": "open-modal",
        "modalConfig": {
          "id": "modal-user-list",
          "title": "사용자 목록 조회",
          "size": "md",
          "type": "form",
          "fields": [
            {
              "id": "field-search-type",
              "label": "조회 조건",
              "type": "combo",
              "required": false,
              "options": ["Code", "Description"]
            }
          ]
        },
        "description": "접수자 클릭 시 사용자 목록 조회 팝업 오픈"
      },
      {
        "id": "int-excel-export",
        "triggerComponentId": "comp-btn-excel",
        "triggerEvent": "click",
        "actionType": "submit",
        "description": "현재 그리드 데이터를 엑셀 파일로 다운로드"
      },
      {
        "id": "int-reception-button",
        "triggerComponentId": "comp-btn-reception",
        "triggerEvent": "click",
        "actionType": "open-modal",
        "modalConfig": {
          "id": "modal-abnormal-reception-detail",
          "title": "이상발생 상세",
          "size": "full",
          "type": "form",
          "fields": [
            {
              "id": "section-reception-info",
              "label": "=== 이상발생 접수 정보 ===",
              "type": "label",
              "required": false
            },
            {
              "id": "field-receipt-grade",
              "label": "접수 등급",
              "type": "combo",
              "required": true,
              "options": ["A", "B", "C", "D"]
            },
            {
              "id": "field-recipient",
              "label": "접수자",
              "type": "codeview",
              "required": true,
              "placeholder": "접수자 CodeView"
            },
            {
              "id": "field-receipt-time",
              "label": "접수 시간",
              "type": "textbox",
              "required": false
            },
            {
              "id": "field-grade-change-reason",
              "label": "등급 변경 사유",
              "type": "textbox",
              "required": false
            },
            {
              "id": "field-reception-comments",
              "label": "접수 의견",
              "type": "textarea",
              "required": false,
              "placeholder": "접수 의견을 입력하세요"
            },
            {
              "id": "section-registration-info",
              "label": "=== 이상발생 등록 정보 ===",
              "type": "label",
              "required": false
            },
            {
              "id": "field-abnormal-no",
              "label": "이상번호",
              "type": "textbox",
              "required": false
            },
            {
              "id": "field-register-user",
              "label": "등록자",
              "type": "codeview",
              "required": false,
              "placeholder": "등록자 CodeView"
            },
            {
              "id": "field-status",
              "label": "상태",
              "type": "combo",
              "required": false,
              "options": ["Register", "Receipt"]
            },
            {
              "id": "field-register-time",
              "label": "등록 시간",
              "type": "textbox",
              "required": false
            },
            {
              "id": "field-register-grade",
              "label": "등록 등급",
              "type": "combo",
              "required": false,
              "options": ["A", "B", "C", "D"]
            },
            {
              "id": "field-occurred-type",
              "label": "발생 타입",
              "type": "combo",
              "required": false,
              "options": ["Quality", "Equipment", "Safety", "Other"]
            },
            {
              "id": "field-line-code",
              "label": "라인 코드",
              "type": "codeview",
              "required": false,
              "placeholder": "라인 코드 CodeView"
            },
            {
              "id": "field-oper-code",
              "label": "공정 코드",
              "type": "codeview",
              "required": false,
              "placeholder": "공정 코드 CodeView"
            },
            {
              "id": "field-equip-code",
              "label": "설비 코드",
              "type": "codeview",
              "required": false,
              "placeholder": "설비 코드 CodeView"
            },
            {
              "id": "field-mat-code",
              "label": "자재 코드",
              "type": "codeview",
              "required": false,
              "placeholder": "자재 코드 CodeView"
            },
            {
              "id": "field-title",
              "label": "제목",
              "type": "textbox",
              "required": false
            },
            {
              "id": "field-detail-issue",
              "label": "상세 내용",
              "type": "textarea",
              "required": false,
              "placeholder": "상세 내용을 입력하세요"
            },
            {
              "id": "field-damage-range",
              "label": "피해 범위",
              "type": "textarea",
              "required": false,
              "placeholder": "피해 범위를 입력하세요"
            },
            {
              "id": "field-corrective-action",
              "label": "시정 조치",
              "type": "textarea",
              "required": false,
              "placeholder": "시정 조치 내용을 입력하세요"
            },
            {
              "id": "field-attachments",
              "label": "첨부파일",
              "type": "file-upload",
              "required": false
            }
          ]
        },
        "description": "접수 버튼 클릭 시 이상발생 접수/등록 정보 상세 팝업 오픈 (2개 섹션)"
      }
    ]
  }
}
```

---

## 🧪 Playwright 테스트 스크립트

### **1. Wizard 자동화 테스트**

```typescript
// tests/wizard/abnormality-reception.spec.ts

import { test, expect } from '@playwright/test';

test.describe('이상발생관리 Wizard 테스트', () => {
  
  test('Step 1: 화면 기본 정보 입력', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // 메뉴 선택 (이상발생관리)
    await page.click('text=이상발생관리');
    
    // Wizard 시작
    await page.click('button:has-text("Wizard 시작")');
    
    // Step 1: 기본 정보
    await page.fill('input[name="screenName"]', '이상발생관리');
    await page.fill('textarea[name="description"]', '공장 내 발생한 이상사항을 등록하고 관리하는 화면');
    
    await page.click('button:has-text("다음")');
    
    // Step 1 완료 확인
    expect(await page.locator('.step-indicator').nth(0)).toHaveClass(/completed/);
  });

  test('Step 2: 레이아웃 선택', async ({ page }) => {
    // ... Step 1 완료 후
    
    // Search-Grid 레이아웃 선택
    await page.click('[data-layout="search-grid"]');
    
    // 레이아웃 영역 확인
    await expect(page.locator('text=검색 영역')).toBeVisible();
    await expect(page.locator('text=그리드 툴바')).toBeVisible();
    await expect(page.locator('text=그리드 영역')).toBeVisible();
    
    await page.click('button:has-text("다음")');
  });

  test('Step 3: 컴포넌트 배치', async ({ page }) => {
    // ... Step 2 완료 후
    
    // 검색 영역 컴포넌트 추가
    await page.click('text=검색 영역');
    
    // 일자 (From) 날짜선택
    await page.click('[data-component-type="date-picker"]');
    await page.fill('input[name="label"]', '일자 (From)');
    await page.click('button:has-text("추가")');
    
    // 일자 (To) 날짜선택
    await page.click('[data-component-type="date-picker"]');
    await page.fill('input[name="label"]', '일자 (To)');
    await page.click('button:has-text("추가")');
    
    // 상태 콤보박스
    await page.click('[data-component-type="combo"]');
    await page.fill('input[name="label"]', '상태');
    await page.click('button:has-text("추가")');
    
    // 접수 등급 콤보박스
    await page.click('[data-component-type="combo"]');
    await page.fill('input[name="label"]', '접수 등급');
    await page.click('button:has-text("추가")');
    
    // 발생 타입 콤보박스
    await page.click('[data-component-type="combo"]');
    await page.fill('input[name="label"]', '발생 타입');
    await page.click('button:has-text("추가")');
    
    // 라인 코드 코드뷰
    await page.click('[data-component-type="codeview"]');
    await page.fill('input[name="label"]', '라인 코드');
    await page.click('button:has-text("추가")');
    
    // 공정 코드 코드뷰
    await page.click('[data-component-type="codeview"]');
    await page.fill('input[name="label"]', '공정 코드');
    await page.click('button:has-text("추가")');
    
    // 설비 코드 코드뷰
    await page.click('[data-component-type="codeview"]');
    await page.fill('input[name="label"]', '설비 코드');
    await page.click('button:has-text("추가")');
    
    // 자재 코드 코드뷰
    await page.click('[data-component-type="codeview"]');
    await page.fill('input[name="label"]', '자재 코드');
    await page.click('button:has-text("추가")');
    
    // 이상번호 텍스트박스
    await page.click('[data-component-type="textbox"]');
    await page.fill('input[name="label"]', '이상번호');
    await page.click('button:has-text("추가")');
    
    // 접수자 코드뷰
    await page.click('[data-component-type="codeview"]');
    await page.fill('input[name="label"]', '접수자');
    await page.click('button:has-text("추가")');
    
    // 조회 버튼
    await page.click('[data-component-type="button"]');
    await page.fill('input[name="label"]', '조회');
    await page.click('button:has-text("추가")');
    
    // 초기화 버튼
    await page.click('[data-component-type="button"]');
    await page.fill('input[name="label"]', '초기화');
    await page.click('button:has-text("추가")');
    
    // 그리드 툴바 컴포넌트 추가
    await page.click('text=그리드 툴바');
    
    // Excel 버튼
    await page.click('[data-component-type="button"]');
    await page.fill('input[name="label"]', 'Excel');
    await page.click('button:has-text("추가")');
    
    // 접수 버튼
    await page.click('[data-component-type="button"]');
    await page.fill('input[name="label"]', '접수');
    await page.click('button:has-text("추가")');
    
    // 그리드 영역 컴포넌트 추가
    await page.click('text=그리드 영역');
    
    // 이상발생 목록 그리드
    await page.click('[data-component-type="grid"]');
    await page.fill('input[name="label"]', '이상발생 목록');
    await page.click('button:has-text("추가")');
    
    // 배치된 컴포넌트 개수 확인 (13개 검색조건 + 2개 버튼 + 1개 그리드 = 16개)
    await expect(page.locator('.placed-components-list > div')).toHaveCount(16);
    
    await page.click('button:has-text("다음")');
  });

  test('Step 4: 인터랙션 정의', async ({ page }) => {
    // ... Step 3 완료 후
    
    // 인터랙션 1: 조회 버튼 클릭 시 데이터 조회
    await page.click('button:has-text("인터랙션 추가")');
    await page.selectOption('select[name="triggerComponent"]', { label: '조회' });
    await page.selectOption('select[name="triggerEvent"]', 'click');
    await page.selectOption('select[name="actionType"]', 'fetch-data');
    await page.selectOption('select[name="targetArea"]', { label: '그리드 영역' });
    await page.fill('textarea[name="description"]', '검색 조건에 따라 이상발생 목록을 조회하여 그리드에 표시');
    await page.click('button:has-text("인터랙션 저장")');
    
    // 인터랙션 2: 초기화 버튼 클릭 시 검색 조건 초기화
    await page.click('button:has-text("인터랙션 추가")');
    await page.selectOption('select[name="triggerComponent"]', { label: '초기화' });
    await page.selectOption('select[name="triggerEvent"]', 'click');
    await page.selectOption('select[name="actionType"]', 'clear');
    await page.selectOption('select[name="targetArea"]', { label: '검색 영역' });
    await page.fill('textarea[name="description"]', '검색 조건 초기화');
    await page.click('button:has-text("인터랙션 저장")');
    
    // 인터랙션 3: 라인 코드 클릭 시 Line List 팝업
    await page.click('button:has-text("인터랙션 추가")');
    await page.selectOption('select[name="triggerComponent"]', { label: '라인 코드' });
    await page.selectOption('select[name="triggerEvent"]', 'click');
    await page.selectOption('select[name="actionType"]', 'open-modal');
    await page.fill('input[name="modalTitle"]', 'Line List 조회');
    await page.selectOption('select[name="modalSize"]', 'md');
    await page.selectOption('select[name="modalType"]', 'form');
    await page.click('button:has-text("필드 추가")');
    await page.fill('input[name="fieldLabel"][data-index="0"]', '조회 조건');
    await page.selectOption('select[name="fieldType"][data-index="0"]', 'combo');
    await page.click('button:has-text("인터랙션 저장")');
    
    // 인터랙션 4: 공정 코드 클릭 시 Oper List 팝업
    await page.click('button:has-text("인터랙션 추가")');
    await page.selectOption('select[name="triggerComponent"]', { label: '공정 코드' });
    await page.selectOption('select[name="triggerEvent"]', 'click');
    await page.selectOption('select[name="actionType"]', 'open-modal');
    await page.fill('input[name="modalTitle"]', 'Oper List 조회');
    await page.selectOption('select[name="modalSize"]', 'md');
    await page.selectOption('select[name="modalType"]', 'form');
    await page.click('button:has-text("필드 추가")');
    await page.fill('input[name="fieldLabel"][data-index="0"]', '조회 조건');
    await page.selectOption('select[name="fieldType"][data-index="0"]', 'combo');
    await page.click('button:has-text("인터랙션 저장")');
    
    // 인터랙션 5: 설비 코드 클릭 시 Equip List 팝업
    await page.click('button:has-text("인터랙션 추가")');
    await page.selectOption('select[name="triggerComponent"]', { label: '설비 코드' });
    await page.selectOption('select[name="triggerEvent"]', 'click');
    await page.selectOption('select[name="actionType"]', 'open-modal');
    await page.fill('input[name="modalTitle"]', 'Equip List 조회');
    await page.selectOption('select[name="modalSize"]', 'md');
    await page.selectOption('select[name="modalType"]', 'form');
    await page.click('button:has-text("필드 추가")');
    await page.fill('input[name="fieldLabel"][data-index="0"]', '조회 조건');
    await page.selectOption('select[name="fieldType"][data-index="0"]', 'combo');
    await page.click('button:has-text("인터랙션 저장")');
    
    // 인터랙션 6: 제품 코드 클릭 시 Material List 팝업
    await page.click('button:has-text("인터랙션 추가")');
    await page.selectOption('select[name="triggerComponent"]', { label: '제품 코드' });
    await page.selectOption('select[name="triggerEvent"]', 'click');
    await page.selectOption('select[name="actionType"]', 'open-modal');
    await page.fill('input[name="modalTitle"]', 'Material List 조회');
    await page.selectOption('select[name="modalSize"]', 'md');
    await page.selectOption('select[name="modalType"]', 'form');
    await page.click('button:has-text("필드 추가")');
    await page.fill('input[name="fieldLabel"][data-index="0"]', '조회 조건');
    await page.selectOption('select[name="fieldType"][data-index="0"]', 'combo');
    await page.click('button:has-text("인터랙션 저장")');
    
    // 인터랙션 7: 접수자 클릭 시 사용자 목록 팝업
    await page.click('button:has-text("인터랙션 추가")');
    await page.selectOption('select[name="triggerComponent"]', { label: '접수자' });
    await page.selectOption('select[name="triggerEvent"]', 'click');
    await page.selectOption('select[name="actionType"]', 'open-modal');
    await page.fill('input[name="modalTitle"]', '사용자 목록 조회');
    await page.selectOption('select[name="modalSize"]', 'md');
    await page.selectOption('select[name="modalType"]', 'form');
    await page.click('button:has-text("필드 추가")');
    await page.fill('input[name="fieldLabel"][data-index="0"]', '조회 조건');
    await page.selectOption('select[name="fieldType"][data-index="0"]', 'combo');
    await page.click('button:has-text("인터랙션 저장")');
    
    // 인터랙션 8: Excel 버튼 클릭 시 엑셀 다운로드
    await page.click('button:has-text("인터랙션 추가")');
    await page.selectOption('select[name="triggerComponent"]', { label: 'Excel' });
    await page.selectOption('select[name="triggerEvent"]', 'click');
    await page.selectOption('select[name="actionType"]', 'submit');
    await page.fill('textarea[name="description"]', '현재 그리드 데이터를 엑셀 파일로 다운로드');
    await page.click('button:has-text("인터랙션 저장")');
    
    // 인터랙션 9: 접수 버튼 클릭 시 이상발생 상세 팝업 (대규모 폼)
    await page.click('button:has-text("인터랙션 추가")');
    await page.selectOption('select[name="triggerComponent"]', { label: '접수' });
    await page.selectOption('select[name="triggerEvent"]', 'click');
    await page.selectOption('select[name="actionType"]', 'open-modal');
    await page.fill('input[name="modalTitle"]', '이상발생 상세');
    await page.selectOption('select[name="modalSize"]', 'full');
    await page.selectOption('select[name="modalType"]', 'form');
    
    // 접수 정보 섹션 주요 필드만 추가 (간소화)
    const receptionFields = [
      { label: '접수 등급', type: 'combo' },
      { label: '접수자', type: 'codeview' },
      { label: '접수 의견', type: 'textarea' }
    ];
    
    // 등록 정보 섹션 주요 필드 추가 (간소화)
    const registrationFields = [
      { label: '이상번호', type: 'textbox' },
      { label: '등록자', type: 'codeview' },
      { label: '라인 코드', type: 'codeview' },
      { label: '설비 코드', type: 'codeview' },
      { label: '상세 내용', type: 'textarea' }
    ];
    
    let fieldIndex = 0;
    [...receptionFields, ...registrationFields].forEach(async (field) => {
      await page.click('button:has-text("필드 추가")');
      await page.fill(`input[name="fieldLabel"][data-index="${fieldIndex}"]`, field.label);
      await page.selectOption(`select[name="fieldType"][data-index="${fieldIndex}"]`, field.type);
      fieldIndex++;
    });
    
    await page.click('button:has-text("인터랙션 저장")');
    
    // 정의된 인터랙션 개수 확인 (9개)
    await expect(page.locator('.interaction-list > div')).toHaveCount(9);
    
    await page.click('button:has-text("다음")');
  });

  test('Step 5: 검토 및 생성', async ({ page }) => {
    // ... Step 4 완료 후
    
    // 최종 검토 화면 확인
    await expect(page.locator('h2:has-text("화면 정보")')).toBeVisible();
    await expect(page.locator('h2:has-text("레이아웃")')).toBeVisible();
    await expect(page.locator('h2:has-text("컴포넌트")')).toBeVisible();
    await expect(page.locator('h2:has-text("인터랙션")')).toBeVisible();
    
    // 생성 버튼 클릭
    await page.click('button:has-text("프로토타입 생성")');
    
    // 로딩 표시 확인
    await expect(page.locator('text=생성 중...')).toBeVisible();
    
    // 생성 완료 대기 (최대 60초)
    await page.waitForSelector('text=생성 완료', { timeout: 60000 });
    
    // 생성된 화면 확인
    await expect(page.locator('.prototype-preview')).toBeVisible();
  });

  test('전체 Wizard 플로우 통합 테스트', async ({ page }) => {
    // 전체 플로우를 한 번에 실행
    await page.goto('http://localhost:5173');
    
    // 1. 메뉴 선택
    await page.click('text=이상발생관리');
    await page.click('button:has-text("Wizard 시작")');
    
    // 2. Step 1
    await page.fill('input[name="screenName"]', '이상발생관리');
    await page.fill('textarea[name="description"]', '이상발생 접수 및 처리를 관리하는 화면');
    await page.click('button:has-text("다음")');
    
    // 3. Step 2
    await page.click('[data-layout="search-grid"]');
    await page.click('button:has-text("다음")');
    
    // 4. Step 3 (간소화 - 주요 컴포넌트만)
    // 검색 영역
    await page.click('text=검색 영역');
    for (const comp of [
      { type: 'date-picker', label: '이상등록 일자 (From)' },
      { type: 'date-picker', label: '이상등록 일자 (To)' },
      { type: 'combo', label: '상태' },
      { type: 'combo', label: '등급' },
      { type: 'codeview', label: '라인 코드' },
      { type: 'codeview', label: '설비 코드' },
      { type: 'button', label: '조회' },
      { type: 'button', label: '초기화' }
    ]) {
      await page.click(`[data-component-type="${comp.type}"]`);
      await page.fill('input[name="label"]', comp.label);
      await page.click('button:has-text("추가")');
    }
    
    // 그리드 툴바
    await page.click('text=그리드 툴바');
    await page.click('[data-component-type="button"]');
    await page.fill('input[name="label"]', 'Reception');
    await page.click('button:has-text("추가")');
    
    // 그리드 영역
    await page.click('text=그리드 영역');
    await page.click('[data-component-type="grid"]');
    await page.fill('input[name="label"]', '이상발생 목록');
    await page.click('button:has-text("추가")');
    
    await page.click('button:has-text("다음")');
    
    // 5. Step 4 (간소화 - 주요 인터랙션만)
    // 조회 인터랙션
    await page.click('button:has-text("인터랙션 추가")');
    await page.selectOption('select[name="triggerComponent"]', { label: '조회' });
    await page.selectOption('select[name="actionType"]', 'fetch-data');
    await page.selectOption('select[name="targetArea"]', { label: '그리드 영역' });
    await page.click('button:has-text("인터랙션 저장")');
    
    // 라인 코드 팝업 인터랙션
    await page.click('button:has-text("인터랙션 추가")');
    await page.selectOption('select[name="triggerComponent"]', { label: '라인 코드' });
    await page.selectOption('select[name="actionType"]', 'open-modal');
    await page.fill('input[name="modalTitle"]', 'Line List 조회');
    await page.click('button:has-text("인터랙션 저장")');
    
    // Reception 버튼 인터랙션
    await page.click('button:has-text("인터랙션 추가")');
    await page.selectOption('select[name="triggerComponent"]', { label: 'Reception' });
    await page.selectOption('select[name="actionType"]', 'open-modal');
    await page.fill('input[name="modalTitle"]', 'Abnormality Reception Detail');
    await page.click('button:has-text("인터랙션 저장")');
    
    await page.click('button:has-text("다음")');
    
    // 6. Step 5
    await page.click('button:has-text("프로토타입 생성")');
    await page.waitForSelector('text=생성 완료', { timeout: 60000 });
    
    // 최종 확인
    await expect(page.locator('.prototype-preview')).toBeVisible();
    
    // 스크린샷 저장
    await page.screenshot({ path: 'test-results/abnormality-reception-wizard-complete.png', fullPage: true });
  });
});
```

---

## 📊 예상 데이터 구조

### **그리드 컬럼 (이상발생 목록)**

```javascript
[
  { field: 'abnormalityNo', header: '이상발생 번호', width: 140 },
  { field: 'regDate', header: '이상등록 일자', width: 120 },
  { field: 'status', header: '상태', width: 100 },
  { field: 'grade', header: '등급', width: 80 },
  { field: 'type', header: '발생 타입', width: 120 },
  { field: 'lineCode', header: '라인 코드', width: 120 },
  { field: 'operCode', header: '공정 코드', width: 120 },
  { field: 'equipCode', header: '설비 코드', width: 120 },
  { field: 'matCode', header: '제품 코드', width: 120 },
  { field: 'registrant', header: '이상발생 등록자', width: 120 },
  { field: 'receptionStatus', header: '접수 상태', width: 100 },
  { field: 'receptionComment', header: '접수 의견', width: 200 }
]
```

### **샘플 데이터**

```javascript
[
  {
    abnormalityNo: 'ABN-2025-001',
    regDate: '2025-11-17',
    status: 'Register',
    grade: 'A',
    type: 'Quality',
    lineCode: 'LINE-001',
    operCode: 'OPER-101',
    equipCode: 'EQUIP-501',
    matCode: 'MAT-1001',
    registrant: 'USER001',
    receptionStatus: '접수완료',
    receptionComment: '품질 이슈 확인 중'
  },
  {
    abnormalityNo: 'ABN-2025-002',
    regDate: '2025-11-17',
    status: 'Reject',
    grade: 'B',
    type: 'Equipment',
    lineCode: 'LINE-002',
    operCode: 'OPER-102',
    equipCode: 'EQUIP-502',
    matCode: 'MAT-1002',
    registrant: 'USER002',
    receptionStatus: '접수대기',
    receptionComment: null
  },
  {
    abnormalityNo: 'ABN-2025-003',
    regDate: '2025-11-16',
    status: 'Register',
    grade: 'C',
    type: 'Safety',
    lineCode: 'LINE-003',
    operCode: 'OPER-103',
    equipCode: 'EQUIP-503',
    matCode: 'MAT-1003',
    registrant: 'USER003',
    receptionStatus: '접수완료',
    receptionComment: '안전 조치 완료'
  }
]
```

### **조회 팝업 데이터 구조 (Line/Oper/Equip/Material/Recipient)**

```javascript
// 모든 조회 팝업은 동일한 구조 사용
[
  { code: 'LINE-001', description: '생산 라인 A' },
  { code: 'LINE-002', description: '생산 라인 B' },
  { code: 'LINE-003', description: '생산 라인 C' }
]
```

---

## 🎯 테스트 체크리스트

### **Wizard 단계별 체크**

- [ ] **Step 1**: 화면명 "이상발생관리" 입력 가능
- [ ] **Step 1**: 설명 입력 가능
- [ ] **Step 2**: search-grid 레이아웃 선택 가능
- [ ] **Step 2**: 3개 영역(검색, 툴바, 그리드) 표시 확인
- [ ] **Step 3**: 검색 영역에 13개 컴포넌트 배치
  - [ ] 이상등록 일자 (From/To) - 2개
  - [ ] 상태, 등급, 발생 타입 콤보박스 - 3개
  - [ ] 라인/공정/설비/제품 코드, 등록자 코드뷰 - 5개
  - [ ] 이상발생 번호 텍스트박스 - 1개
  - [ ] 조회, 초기화 버튼 - 2개
- [ ] **Step 3**: 그리드 툴바에 1개 버튼 배치 (Reception)
- [ ] **Step 3**: 그리드 영역에 1개 그리드 배치
- [ ] **Step 3**: 총 15개 컴포넌트 배치 확인
- [ ] **Step 4**: 8개 인터랙션 정의
  - [ ] 조회 버튼 → 데이터 조회
  - [ ] 초기화 버튼 → 검색 조건 초기화
  - [ ] 라인 코드 클릭 → Line List 팝업
  - [ ] 공정 코드 클릭 → Oper List 팝업
  - [ ] 설비 코드 클릭 → Equip List 팝업
  - [ ] 제품 코드 클릭 → Material List 팝업
  - [ ] 등록자 클릭 → Recipient List 팝업
  - [ ] Reception 버튼 → 접수 처리 상세 팝업
- [ ] **Step 4**: 각 조회 팝업 모달 설정 확인 (Code/Description 콤보)
- [ ] **Step 4**: Reception Detail 모달 11개 필드 확인
- [ ] **Step 5**: 최종 검토 화면에서 모든 정보 확인
- [ ] **Step 5**: 프로토타입 생성 버튼 클릭 가능
- [ ] **Step 5**: 생성 완료 메시지 표시 확인

### **생성된 화면 기능 체크**

#### **검색 영역**
- [ ] 이상등록 일자 (From/To) 날짜 선택 가능
- [ ] 상태 콤보박스 (Register/Reject) 선택 가능
- [ ] 등급 콤보박스 (A/B/C/D) 선택 가능
- [ ] 발생 타입 콤보박스 선택 가능
- [ ] 라인 코드 코드뷰 클릭 시 팝업 오픈
- [ ] 공정 코드 코드뷰 클릭 시 팝업 오픈
- [ ] 설비 코드 코드뷰 클릭 시 팝업 오픈
- [ ] 제품 코드 코드뷰 클릭 시 팝업 오픈
- [ ] 이상발생 번호 입력 가능
- [ ] 이상발생 등록자 코드뷰 클릭 시 팝업 오픈
- [ ] 조회 버튼 클릭 시 그리드 데이터 로드
- [ ] 초기화 버튼 클릭 시 검색 조건 초기화

#### **조회 팝업 (Line/Oper/Equip/Material/Recipient)**
- [ ] Code/Description 콤보박스 선택 가능
- [ ] 그리드에 Code, Description 컬럼 표시
- [ ] 행 선택 시 메인 화면에 값 반영
- [ ] 닫기 버튼 동작

#### **그리드 영역**
- [ ] 그리드에 12개 컬럼 표시
- [ ] 샘플 데이터 표시
- [ ] 상태별 색상 표시 (Register/Reject)
- [ ] 등급별 색상 표시 (A/B/C/D)
- [ ] 스크롤 동작
- [ ] 행 선택 가능

#### **Reception Detail 팝업**
- [ ] 이상발생 번호 필드 표시
- [ ] 이상등록 일자 날짜 선택 가능
- [ ] 상태 콤보박스 (Register/Reject)
- [ ] 등급 콤보박스 (A/B/C/D)
- [ ] 발생 타입 콤보박스
- [ ] 라인 코드 입력/선택 가능
- [ ] 공정 코드 입력/선택 가능
- [ ] 설비 코드 입력/선택 가능
- [ ] 제품 코드 입력/선택 가능
- [ ] 이상발생 등록자 입력 가능
- [ ] 접수 의견 텍스트영역 입력 가능
- [ ] 저장 버튼 동작
- [ ] 취소 버튼 동작

#### **일반 기능**
- [ ] 반응형 레이아웃 동작
- [ ] 모든 모달 ESC 키로 닫기 가능
- [ ] 필수 입력 필드 검증
- [ ] 에러 메시지 표시

---

## 🚀 실행 방법

### **1. Playwright 설치**

```bash
# 프로젝트 루트에서
npm install -D @playwright/test
npx playwright install
```

### **2. 테스트 설정**

```javascript
// playwright.config.ts

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,  // Wizard는 순차 실행
  timeout: 120000,  // 2분 타임아웃
  expect: {
    timeout: 10000
  },
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true
  }
});
```

### **3. 테스트 실행**

```bash
# 전체 테스트 실행
npx playwright test

# 특정 테스트만 실행
npx playwright test abnormality-reception

# UI 모드로 실행 (디버깅)
npx playwright test --ui

# 헤드리스 모드 해제 (브라우저 보면서 실행)
npx playwright test --headed

# 특정 브라우저로 실행
npx playwright test --project=chromium
```

### **4. 결과 확인**

```bash
# HTML 리포트 생성
npx playwright show-report

# 스크린샷 확인
ls test-results/*.png
```

---

## 📝 주의사항

1. **데이터베이스**: Menu ID 131에 해당하는 화면이 DB에 존재해야 함
2. **Wizard 데이터**: `wizard_data` 컬럼이 screens 테이블에 존재해야 함
3. **LLM API**: Google Gemini API 키가 설정되어 있어야 함
4. **타임아웃**: 프로토타입 생성은 30-60초 소요될 수 있음 (복잡한 화면의 경우 더 소요)
5. **셀렉터**: 실제 UI 구조에 맞게 셀렉터 조정 필요
6. **컴포넌트 개수**: 15개 컴포넌트 + 8개 인터랙션으로 복잡한 화면
7. **CodeView 컴포넌트**: 🔍 검색 아이콘과 텍스트박스가 결합된 전용 컴포넌트 (라인/공정/설비/제품 코드, 등록자용)
8. **조회 조건**: 11개의 검색 조건을 효과적으로 배치하기 위해 그리드 레이아웃 고려

---

## 📐 화면 구조 다이어그램

```
┌──────────────────────────────────────────────────────────────────────────┐
│ 이상발생관리 (Abnormality Reception Management)                           │
├──────────────────────────────────────────────────────────────────────────┤
│ [검색 영역]                                                                │
│ ┌────────────────────────────────────────────────────────────────────┐   │
│ │ 이상등록 일자: [From 📅] ~ [To 📅]                                  │   │
│ │ 상태: [Register/Reject ▼]  등급: [A/B/C/D ▼]                      │   │
│ │ 발생 타입: [Quality/Equipment... ▼]                                │   │
│ │                                                                    │   │
│ │ 라인 코드: [🔍____]  공정 코드: [🔍____]  설비 코드: [🔍____]     │   │
│ │ 제품 코드: [🔍____]  이상발생 번호: [____]                        │   │
│ │ 이상발생 등록자: [🔍____]                                          │   │
│ │                                                                    │   │
│ │ [조회] [초기화]                                                    │   │
│ └────────────────────────────────────────────────────────────────────┘   │
├──────────────────────────────────────────────────────────────────────────┤
│ [그리드 툴바]                                                              │
│ [Reception]                                                               │
├──────────────────────────────────────────────────────────────────────────┤
│ [그리드 영역]                                                              │
│ ┌────────────────────────────────────────────────────────────────────┐   │
│ │번호│일자│상태│등급│타입│라인│공정│설비│제품│등록자│접수상태│의견│   │
│ │────┼────┼────┼────┼────┼────┼────┼────┼────┼──────┼────────┼────│   │
│ │001 │11-17│REG │A   │QUA │L001│O101│E501│M001│USER01│접수완료│... │   │
│ │002 │11-17│REJ │B   │EQU │L002│O102│E502│M002│USER02│접수대기│    │   │
│ │003 │11-16│REG │C   │SAF │L003│O103│E503│M003│USER03│접수완료│... │   │
│ └────────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────┘

[🔍 클릭 시 팝업]
┌─────────────────────────────────┐
│ Line List 조회                   │
├─────────────────────────────────┤
│ 조회 조건: [Code/Description ▼] │
│ [조회]                           │
│                                 │
│ ┌───────────────────────────┐   │
│ │ Code    │ Description    │   │
│ ├─────────┼────────────────┤   │
│ │ LINE-001│ 생산 라인 A    │   │
│ │ LINE-002│ 생산 라인 B    │   │
│ │ LINE-003│ 생산 라인 C    │   │
│ └───────────────────────────┘   │
│ [선택] [닫기]                    │
└─────────────────────────────────┘

[Reception 버튼 클릭 시]
┌──────────────────────────────────────────┐
│ Abnormality Reception Detail              │
├──────────────────────────────────────────┤
│ 이상발생 번호: [____]                     │
│ 이상등록 일자: [📅]                       │
│ 상태: [Register/Reject ▼]                │
│ 등급: [A/B/C/D ▼]                        │
│ 발생 타입: [Quality/Equipment ▼]         │
│ 라인 코드: [____]  공정 코드: [____]     │
│ 설비 코드: [____]  제품 코드: [____]     │
│ 이상발생 등록자: [____]                   │
│                                          │
│ 접수 의견:                                │
│ ┌────────────────────────────────────┐   │
│ │                                    │   │
│ │                                    │   │
│ │                                    │   │
│ └────────────────────────────────────┘   │
│ [저장] [취소]                             │
└──────────────────────────────────────────┘
```

---

## 🔄 다음 단계

1. **테스트 스크립트 작성**: 위 Playwright 스크립트를 `tests/wizard/abnormality-reception.spec.ts` 에 저장
2. **Playwright 설치**: `npm install -D @playwright/test` 및 브라우저 설치
3. **테스트 실행**: `npx playwright test abnormality-reception --headed` 로 실행
4. **결과 검증**: 생성된 화면이 요구사항을 만족하는지 확인
5. **개선**: 
   - ✅ CodeView 컴포넌트 타입 추가 완료 (🔍 아이콘 포함)
   - 검색 조건 11개를 효과적으로 배치하기 위한 그리드 레이아웃 조정
   - 팝업 그리드 컬럼 구조 세부 조정
   - Reception Detail 모달 레이아웃 개선
   - CodeView 컴포넌트 UI 실제 구현 (React 컴포넌트)
6. **API 연동**: 실제 백엔드 API와 연동하여 데이터 CRUD 구현
7. **추가 기능**: 
   - 엑셀 업로드/다운로드 기능
   - 첨부파일 관리
   - 접수 이력 관리
   - 알림 기능

