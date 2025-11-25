// Playwright test for 이상발생 접수 화면 (Abnormality Reception)
// 위치: frontend/tests/quality-control/abnormality-reception-wizard.spec.ts
// Step by Step Wizard 방식으로 이상발생 접수 화면을 테스트하고, 영상 녹화도 수행합니다.


import { test, expect } from '@playwright/test';

// 비디오 녹화 옵션을 context에 적용
// 영상은 tests/quality-control/videos 폴더에 저장

test.describe('이상발생 접수 Wizard 프로토타입 생성', () => {
  test('Step by Step Wizard 자동화', async ({ browser }) => {
    const context = await browser.newContext({
      recordVideo: { dir: 'frontend/tests/quality-control/videos/' }
    });
    const page = await context.newPage();

    // 1. 이상발생 접수 Wizard 진입 (경로는 실제 라우팅에 맞게 수정)
    await page.goto('http://localhost:5173/quality-control/menus');
    await page.getByText('이상발생 접수').click();
    await page.getByRole('button', { name: /화면 추가/ }).click();
    await page.getByPlaceholder('예: 사용자 목록').fill('이상발생 접수');
    await page.getByPlaceholder('화면 설명을 입력하세요').fill('이상발생 접수 및 등록 정보를 조회하고 관리하는 화면입니다.\n검색 조건으로 이상발생 건을 조회하고, 접수 처리 및 상세 정보를 확인할 수 있습니다.');
    await page.getByRole('button', { name: /^생성$/ }).click();
    await page.getByText('이상발생 접수').click(); // 생성된 화면 진입

    // Step 1: 화면 개요
    await page.getByLabel('화면명').fill('이상발생 접수');
    await page.getByLabel('설명').fill('이상발생 접수 및 등록 정보를 조회하고 관리하는 화면입니다.\n검색 조건으로 이상발생 건을 조회하고, 접수 처리 및 상세 정보를 확인할 수 있습니다.');
    await page.getByRole('button', { name: '다음' }).click();

    // Step 2: 레이아웃
    await page.getByLabel('조회형 (Search + Grid)').check();
    await page.getByLabel('검색 영역').check();
    await page.getByLabel('그리드 툴바').check();
    await page.getByLabel('그리드 영역').check();
    await page.getByRole('button', { name: '다음' }).click();

    // Step 3: 컴포넌트 (검색 영역)
    await page.getByRole('button', { name: /Date Picker/ }).nth(0).click();
    await page.getByLabel('라벨').fill('일자 (From)');
    await page.getByLabel('Placeholder').fill('2025-07-18');
    await page.getByRole('button', { name: /추가/ }).click();

    await page.getByRole('button', { name: /Date Picker/ }).nth(1).click();
    await page.getByLabel('라벨').fill('일자 (To)');
    await page.getByLabel('Placeholder').fill('2025-07-18');
    await page.getByRole('button', { name: /추가/ }).click();

    await page.getByRole('button', { name: /콤보박스/ }).nth(0).click();
    await page.getByLabel('라벨').fill('상태');
    await page.getByLabel('Placeholder').fill('선택하세요');
    await page.getByRole('button', { name: /추가/ }).click();

    await page.getByRole('button', { name: /콤보박스/ }).nth(1).click();
    await page.getByLabel('라벨').fill('접수 등급');
    await page.getByLabel('Placeholder').fill('선택하세요');
    await page.getByRole('button', { name: /추가/ }).click();

    await page.getByRole('button', { name: /콤보박스/ }).nth(2).click();
    await page.getByLabel('라벨').fill('발생 타입');
    await page.getByLabel('Placeholder').fill('선택하세요');
    await page.getByRole('button', { name: /추가/ }).click();

    // ... (이하 CodeView, Textbox, Button 등 13개 컴포넌트 순서대로 추가)
    // ... (Abnormality_Reception_Summary.md의 Step 3 영역별 컴포넌트 추가 반복)

    // Step 3: 그리드 툴바
    // Button(Excel), Button(접수) 추가
    // ... (동일 방식 반복)

    // Step 3: 그리드 영역
    // Grid(이상발생 목록) 추가
    // ... (동일 방식 반복)

    await page.getByRole('button', { name: '다음' }).click();

    // Step 4: 인터랙션 (9개)
    // 각 인터랙션 추가 (예: 조회 버튼 클릭 → 데이터 조회 등)
    // ... (Abnormality_Reception_Summary.md의 Step 4 내용대로 반복)

    await page.getByRole('button', { name: '다음' }).click();

    // Step 5: 검토 및 프로토타입 생성
    await page.getByRole('button', { name: /프로토타입 생성/ }).click();

    // 생성 완료까지 대기
    await expect(page.getByText(/프로토타입이 성공적으로 생성되었습니다/)).toBeVisible();
    // 코드/미리보기 정상 노출 확인 (data-testid 활용 예시)
    await expect(page.getByTestId('code-preview')).toBeVisible();
    await expect(page.getByTestId('prototype-preview')).toBeVisible();

    await context.close(); // 영상 저장
  });
});
