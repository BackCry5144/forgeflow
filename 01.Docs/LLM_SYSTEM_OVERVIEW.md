# -*- coding: utf-8 -*-
# ForgeFlow Lite System Overview (LLM-Readable)

Purpose: This document explains the ForgeFlow Lite system at a level of detail suitable for an LLM or developer to understand architecture, data flows, APIs, prompts, caching, DB schema, and extension points. It is intended to be precise and actionable.

---

## 1. High-level Architecture

- Frontend: React + Vite + TypeScript + Tailwind CSS. Renders the workspace, wizard, and CodePreview prototype.
- Backend: FastAPI (Python). Hosts REST API, routes, and services.
- AI Provider: Google Gemini (via `google.generativeai`), abstracted via `services/ai_service.py`.
- Cache: Redis (optional) for context caching of `SYSTEM_PROMPT`.
- Database: PostgreSQL, managed via SQLAlchemy models in `backend/models`.

Components:
- Frontend (`frontend/`)
  - `CodePreview.tsx`: Renders generated React code inside an iframe (Babel-based runtime, JS/TS cleanup).
  - Wizard + UI pages: Collect wizard data and call backend `POST /api/ai/generate`.
- Backend (`backend/`)
  - `main.py`: FastAPI application and router registration.
  - `routers/ai.py`: Entry point for prototype generation invoked by frontend.
  - `services/ai_service.py`: Encapsulates LLM calls and implements context caching.
  - `services/cache_service.py`: Redis-based cache manager for system prompt caching.
  - `models/`: SQLAlchemy models (`screens`, `wizard_test_results`, `menus`, etc.).

---

## 2. Key Data Flows (Request → Prototype)

1. Frontend (Wizard) invokes `POST /api/ai/generate` with payload:
```json
{
  "screen_id": <int>,
  "wizard_data": { /* step1..step4 data */ },
  "menu_name": "Budget Management",
  "screen_name": "Budget View Screen"
}
```

2. `routers/ai.generate_prototype` validates screen and wizard data, then calls `services/ai_service.generate_prototype()`.

3. `AIService.generate_prototype()` builds `user_prompt` via `get_wizard_based_prompt()` (uses `utils/prompt_templates.py`).

4. Context Caching:
   - `services/cache_service` computes a hash for `SYSTEM_PROMPT` and looks up Redis.
   - If cached context exists, it uses Gemini's cached content (calls `from_cached_content` & sends only `user_prompt`).
   - If not, it creates cached content via Gemini (and stores the `cache_id` in Redis), then uses it.

5. AI returns React code (JSX/TSX). Backend validates/cleans and returns `prototype_html` in response.

6. Backend stores record in `wizard_test_results` with `final_prompt`, `raw_wizard_data`, `layout_type`, `menu_id`, `screen_name`, `test_status='success'`.

7. Frontend receives generated code and uses `CodePreview` to render it inside an iframe.

---

## 3. Important Files / Endpoints

- `backend/main.py` → app bootstrap. Includes routers:
  - `/api/menus` (menus_router)
  - `/api/screens` (screens_router)
  - `/api/ai/generate` (ai_router)
  - `/api/cache/*` (cache_router)

- `backend/services/ai_service.py` → LLM integration; key functions:
  - `generate_prototype(prompt, menu_name, screen_name, wizard_data)`
    - returns `{ "prototype_html": <str>, "final_prompt": <str> }`

- `backend/services/cache_service.py` → Redis caching helper:
  - `get_cached_context(system_prompt)`
  - `set_cached_context(system_prompt, cache_id, ttl_hours=1)`
  - `invalidate_cache(system_prompt)`

- `frontend/src/components/workspace/CodePreview.tsx` → iframe-based runtime that:
  - removes TypeScript annotations via regex
  - injects Babel standalone + React UMD into iframe
  - renders component with `ReactDOM.createRoot(...).render(React.createElement(Component))`

---

## 4. Prompts and Prompt Templates

- `backend/utils/prompt_templates.py` contains `SYSTEM_PROMPT` and `get_wizard_based_prompt()`.
- `SYSTEM_PROMPT` currently instructs the model to produce pure JSX code (JavaScript variant) with Tailwind and shadcn/ui style, and to **avoid external imports**.
- `get_wizard_based_prompt()` composes the SYSTEM + USER prompt including wizard steps, components, interactions, and layout.

**Important**: If SYSTEM_PROMPT changes, you must call `DELETE /api/cache/invalidate` (or run cache service invalidation) to clear old context.

---

## 5. Database Model Overview

- `screens` table: stores screen metadata and generated `prototype_html`.
  - important columns: `id`, `menu_id`, `name`, `prototype_html`, `status`, `created_at`.

- `wizard_test_results` table: stores generation metadata and LLM prompt history.
  - important columns: `id`, `created_at`, `menu_id`, `screen_name`, `layout_type`, `raw_wizard_data`, `final_prompt`, `test_status`

---

## 6. Context Caching Details (Redis + Gemini)

- Cache key computed as `gemini_cache:{sha256(SYSTEM_PROMPT)[:16]}`.
- On cache MISS: create cached content via Gemini `CachedContent.create_async(...)`, store returned `cache.name` in Redis with TTL.
- On cache HIT: use `GenerativeModel.from_cached_content(cached)` and send only `user_prompt`.
- If cache usage fails, code invalidates cache and falls back to full prompt send.

Benefits: large token & cost savings when SYSTEM_PROMPT is large and repeated.

---

## 7. Extension Points & Providers

- `services/ai_service.py` is the ideal location to implement a `Provider` abstraction (Strategy Pattern). Implement `GeminiProvider`, `FigmaProvider`, `ClaudeProvider` classes and swap by configuration.

- `n8n` can be introduced as an orchestration layer, but for production-critical, low-latency code path it's preferable to keep provider calls in backend and use n8n for ETL/async pipelines and integrations.

---

## 8. Security & Operational Notes

- Store secrets (API keys) in environment variables and never commit `.env` to Git.
- For production, use a managed Redis or Redis with persistence and high-availability (Sentinel/Cluster).
- Ensure CORS is restricted to allowed origins via `CORS_ORIGINS` env.

---

## 9. Minimal Run Checklist (local dev)

1. Start PostgreSQL (or use local DB)
2. Start Redis (recommended) or leave `REDIS_URL` blank to run without caching
3. Start backend: `cd backend && python main.py`
4. Start frontend: `cd frontend && npm run dev`

---

## 10. Quick Examples (API)

- Generate prototype (example):
```http
POST /api/ai/generate
Content-Type: application/json

{
  "screen_id": 15,
  "wizard_data": { /* wizard JSON */ },
  "menu_name": "Budget Management",
  "screen_name": "Budget View Screen"
}
```

- Cache stats:
```http
GET /api/cache/stats
```

- Invalidate SYSTEM_PROMPT cache:
```http
DELETE /api/cache/invalidate
```

---

## 11. Notes for LLMs (how to produce compatible code)

- Output must be a single React component file in pure JavaScript JSX (no `import` lines).
- Use Tailwind utility classes and shadcn/ui styling conventions but implement via standard tags (div/button/input).
- Start with `export default function ComponentName() { ... }`.
- Include sample data arrays inside the component for immediate rendering.
- Avoid external dependencies, modules, or network calls.

---

## 12. Contacts & Next Steps

- For Provider switching, implement Strategy Pattern in `services/ai_service.py`.
- For RAG-based CSS training, evaluate vector DB (Pinecone/Weaviate) and add RAG retrieval inside prompt construction.

---

This file is intended as a canonical, LLM-and-developer-readable overview. If you want, I can also produce a condensed `README-LLM.md` with shorter bullet points or generate a JSON schema describing all endpoints and models.
