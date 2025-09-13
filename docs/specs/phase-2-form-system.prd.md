# PRD: Phase 2 — Form System Implementation

## Document Information
- Version: 1.0.0 (Draft)
- Date: 2025-09-13
- Author: Project Team
- Status: For Review
- Dependencies: Phase 1 (Foundation) complete; Phase 3 (LLM Coaching) depends on this phase

## 1. Executive Summary
Build a dynamic, versioned form system that renders a multi‑page survey from JSON, validates input, autosaves progress, and persists results. This unlocks the AI readiness questionnaire and provides structured data needed by the coaching pipeline in Phase 3.

## 2. Goals & Non‑Goals
- Goals
  - JSON Form DSL with validation, paging, and navigation
  - Runtime renderer in SvelteKit with accessible controls
  - Autosave on navigation and every 30s; resume from last state
  - Backend endpoints for form definitions, runs, and answers
  - Minimal analytics hooks for page/view events
- Non‑Goals (Out of scope)
  - LLM coaching flow and safety guardrails (Phase 3)
  - Auth integration and user profiles
  - Advanced analytics dashboards

## 3. Functional Requirements
- Form Definition
  - Stored as versioned JSON in `form_definitions` (name, version, definition JSONB)
  - Supported blocks: `markdown`, `text`, `textarea`, `select`, `radio`, `checkbox` (single/multi)
  - Metadata: `id`, `title`, `pages[]`, `navigation: { style: 'pager'|'scroll', autosave: boolean }`, `meta.version`
- Rendering & Navigation
  - Routes: `/survey/[formId]/[page]`
  - Progress indicator; next/previous navigation
  - Client‑side validation per field; disable Next until valid
- Persistence
  - Create run: server assigns `run.id` and session token (cookie or localStorage)
  - Autosave page answers on navigation and every 30s idle
  - Resume: load last completed page for an existing run
- Validation
  - Client: required, min/max length, allowed options
  - Server: mirror validation; reject invalid payloads with meaningful errors

## 4. API Endpoints (FastAPI)
- GET `/forms/{form_name}?version={semver?}` → { id, title, pages, navigation, meta }
- POST `/runs` { form_name, version? } → { run_id, form_version, started_at }
- GET `/runs/{run_id}` → { status, last_page, answers_summary }
- PATCH `/runs/{run_id}/answers` { page_id, answers: { [field]: value } } → { saved_at }
- POST `/runs/{run_id}/complete` → { status: 'completed', completed_at }
- Notes: validate payloads; rate‑limit by IP; CORS already configured

## 5. Data Model (Postgres)
- Reuse Phase 1 tables: `form_definitions`, `runs`, `answers`
- Indexes: `runs(form_definition_id)`, `answers(run_id)`, `answers(saved_at)`
- Optional: `runs.status` enum (`in_progress`, `completed`)

## 6. Frontend (SvelteKit)
- Files
  - `src/lib/form-runtime/types.ts` — TypeScript DSL types
  - `src/lib/form-runtime/renderer.svelte` — renders a page from blocks
  - `src/lib/api/forms.ts` — typed client for endpoints
  - Routes: `src/routes/survey/[formId]/[page]/+page.svelte`
- Accessibility: keyboard focus order, labels/aria, error messaging

## 7. Acceptance Criteria
- Load form by name; render first page within 200ms after fetch completes
- Navigate pages with validation; cannot advance on invalid required fields
- Autosave fires on page change and every 30s; server reflects saved page
- Browser refresh resumes at last page with persisted answers populated
- API returns 400 with field‑level errors for invalid data
- Lighthouse a11y score ≥ 90 on survey pages

## 8. Testing
- Backend: pytest unit tests for validators and endpoints; integration test for run lifecycle
- Frontend: bun/vitest component tests for renderer and validation; happy‑path E2E via Playwright (smoke)
- Target coverage: critical paths of validation and persistence

## 9. Risks & Mitigations
- Inconsistent client/server validation → Single source of truth JSON schema; share constraints via types
- Autosave race conditions → Debounce, cancel in‑flight on navigation, idempotent PATCH by page_id
- Large forms → Lazy load pages; keep definition cached

## 10. Rollout
- Feature flag per form name/version
- Seed one example form `ai-readiness-v1` for QA

---

## Appendix: JSON Form DSL (example)
```json
{
  "id": "ai-readiness-v1",
  "title": "AI Readiness (Clinicians)",
  "pages": [
    {
      "id": "p1",
      "title": "Background",
      "blocks": [
        {"type": "markdown", "content": "# Quick check-in"},
        {"type": "select", "name": "role", "label": "Your role",
         "options": ["Psychologist","GP","Coach","Complementary/Alt"], "required": true},
        {"type": "radio", "name": "ai_confidence", "label": "Confidence (0–5)",
         "options": [0,1,2,3,4,5], "required": true},
        {"type": "textarea", "name": "recent_problem", "label": "Recent difficulty"}
      ]
    }
  ],
  "navigation": {"style":"pager","autosave":true},
  "meta": {"version":"1.0.0"}
}
```

