네, **GitHub Copilot**이 **"Vibe Coding"**(문맥을 완벽히 이해하고 코드의 뉘앙스까지 맞춰서 작성하는 것)을 할 수 있도록, 우리가 논의한 모든 아키텍처 변경 사항과 구현 세부 정보를 **완벽한 지시서(Prompt)** 형태로 정리해 드립니다.

이 내용을 복사해서 Copilot Chat 창에 붙여넣으시면, 백엔드 DB 설계부터 프론트엔드 Admin 페이지까지 한 번에 코딩을 시킬 수 있습니다.

-----

# 🤖 GitHub Copilot용 마스터 프롬프트: Wizard 리소스 관리 시스템 구축

아래 내용을 복사하여 Copilot Chat에 입력하세요.

```markdown
# Project Context & Goal
We are upgrading **ForgeFlow**, an AI-powered prototype generation platform (FastAPI + React).
Currently, the Wizard's assets (Layouts, Components, Interactions) are hardcoded in TypeScript files (`frontend/src/data/*.ts`).

**Your Goal:** Refactor this system to be **Database-driven**.
Move all static data to PostgreSQL and create an **Admin UI (Resource Manager)** so non-developers can manage Wizard assets dynamically.

---

## 🛠️ Technical Stack
- **Backend:** FastAPI, SQLAlchemy (Async), Pydantic, PostgreSQL
- **Frontend:** React, TypeScript, Tailwind CSS, Lucide React
- **Architecture:** Layered (Routers -> Services -> Models)

---

## 📋 Step-by-Step Implementation Plan

Please implement the following features step-by-step.

### Step 1. Backend: Database Modeling
Create a new model file `backend/models/resource.py` with the following tables:

1.  **`layouts` Table:**
    * `id` (String, PK): e.g., 'search-grid'
    * `name` (String): e.g., 'SearchGrid'
    * `description` (Text)
    * `html_template` (Text): Full HTML/Tailwind code for the layout.
    * `areas` (JSON): Array of layout areas (e.g., `[{ "id": "search", "name": "Search Area" }]`).
    * `thumbnail` (String, Optional): URL or path to image.
    * `category` (String): e.g., 'mes', 'erp'.

2.  **`components` Table:**
    * `id` (String, PK): e.g., 'date-picker'
    * `label` (String): e.g., 'Date Picker'
    * `type` (String): e.g., 'input', 'display'
    * `default_props` (JSON): Default attributes (e.g., `{"placeholder": "YYYY-MM-DD"}`).
    * `jsx_template` (Text): The React code snippet LLM should use (e.g., `<DatePicker ... />`).

3.  **`actions` Table (For Interactions):**
    * `id` (String, PK): e.g., 'open-modal'
    * `label` (String)
    * `params_schema` (JSON): Schema for required parameters (e.g., `{"target_modal": "string"}`).

**Action:** Create `models/resource.py` and register it in `models/__init__.py`.

---

### Step 2. Backend: API Implementation
Create RESTful APIs to manage these resources.
* **File:** `backend/routers/resources.py`
* **Endpoints:**
    * `GET /api/resources/layouts` (List all)
    * `POST /api/resources/layouts` (Create)
    * `PUT /api/resources/layouts/{id}` (Update)
    * (Same CRUD for `components` and `actions`)
* **Schemas:** Define Pydantic models in `backend/schemas/resource.py`.

**Action:** Implement the Router and Schemas, then include the router in `main.py`.

---

### Step 3. Data Migration (Seeding)
We need to migrate existing hardcoded data to the DB.
* **Source Files:**
    * `frontend/src/data/layoutTemplates.ts` -> `layouts` table
    * `frontend/src/data/componentLibrary.ts` -> `components` table
* **Task:** Create a Python script `backend/scripts/seed_resources.py` that imports these data (you can extract them from the provided context) and inserts them into the database if the tables are empty.

---

### Step 4. Frontend: Service Layer Update
Refactor the frontend to fetch data from the API instead of local files.
* **Create:** `frontend/src/services/resourceService.ts` with `getLayouts`, `getComponents`, `getActions` methods using `api.ts`.
* **Hook:** Create `frontend/src/hooks/useResources.ts` using `useEffect` (or React Query if available) to load this data on app startup.

---

### Step 5. Frontend: Wizard Refactoring
Update the Wizard steps to use the dynamic data.
* **`Step2Layout.tsx`:** Fetch layouts from `useResources` instead of importing `LAYOUT_TEMPLATES`.
* **`Step3Components.tsx`:** Fetch components from `useResources`.
* **`Step4Interactions.tsx`:** Fetch actions from `useResources`.

---

### Step 6. Frontend: Resource Manager (Admin UI)
Create a settings page where we can add/edit these resources.
* **Location:** `frontend/src/pages/admin/`
* **Features:**
    * **Layout Manager:** List view + Editor (Code editor for HTML template, JSON editor for Areas).
    * **Component Manager:** List view + Form to edit props and JSX templates.
* **Navigation:** Add a "Settings" or "Admin" link in the main `ActivityBar` or `Menu`.

---

## 🚀 Executive Summary
1.  **DB First:** Define Schema & API.
2.  **Migrate:** Move static data to DB.
3.  **Refactor:** Make Wizard dynamic.
4.  **Manage:** Build Admin UI.

Let's start with **Step 1 (Backend Models)**. Please write the code for `models/resource.py`.
```

-----

### 💡 Copilot 활용 팁

1.  **순차적 진행:** 위 프롬프트 전체를 한 번에 주되, \*\*"Let's start with Step 1"\*\*이라고 마지막에 명시했습니다. Copilot이 한 번에 너무 긴 코드를 짜다가 실수를 하지 않도록 단계별로 끊어서 요청하는 것이 좋습니다.
2.  **Step 1 완료 후:** "Great, now proceed to Step 2 (API implementation)"라고 이어서 명령하면 맥락을 유지하며 다음 코드를 짜줍니다.
3.  **기존 코드 참조:** Copilot은 현재 열려있는 파일을 참조합니다. `frontend/src/data/layoutTemplates.ts` 파일을 열어둔 상태에서 질문하면 데이터 마이그레이션 스크립트를 훨씬 정확하게 짜줍니다.