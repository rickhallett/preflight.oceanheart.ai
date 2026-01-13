---
active: true
iteration: 1
max_iterations: 15
completion_promise: "FORM_DSL_COMPLETE"
started_at: "2026-01-12T17:15:35Z"
---

Implement Form DSL Runtime Renderer in apps/preflight-web.

CONTEXT:
- Read docs/specs/phase-2-form-system.prd.md for form DSL specification
- Backend API endpoints are now available at /forms/{form_name} and /runs/*
- Existing sandbox at app/sandbox/ has partial implementation to reference
- Use existing UI components from components/ui/ and components/survey/

TASKS:
1. Create lib/api/forms.ts - Typed API client for form endpoints
2. Create lib/types/form-dsl.ts - TypeScript types matching the JSON DSL
3. Create components/form-runtime/FormRenderer.tsx - Recursive renderer for form pages
4. Create components/form-runtime/fields/ - Field components (Text, Textarea, Select, Radio, Checkbox, Markdown)
5. Create app/(protected)/survey/[formId]/page.tsx - Survey route with form loading
6. Wire up multi-page navigation with progress tracking

SUCCESS CRITERIA:
- [ ] API client fetches form definitions from backend
- [ ] All 6 field types render correctly (markdown, text, textarea, select, radio, checkbox)
- [ ] Multi-page navigation works with Next/Previous buttons
- [ ] Progress bar shows current page position
- [ ] Form state managed properly across page navigation
- [ ] No TypeScript errors (bun run tsc --noEmit or biome check)

When ALL criteria pass, output: <promise>FORM_DSL_COMPLETE</promise>
