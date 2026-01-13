---
active: true
iteration: 1
max_iterations: 12
completion_promise: "AUTOSAVE_COMPLETE"
started_at: "2026-01-12T17:26:48Z"
---

Implement Autosave System for form responses in apps/preflight-web.

CONTEXT:
- Read docs/specs/phase-2-form-system.prd.md for autosave requirements
- Read docs/specs/decision-log/ADR-0003-autosave-resume-strategy.md for strategy
- FormRuntime component already exists at components/form-runtime/FormRuntime.tsx
- API client exists at lib/api/forms.ts with saveAnswers function
- Survey page exists at app/(protected)/survey/[formId]/page.tsx

TASKS:
1. Create hooks/useAutosave.ts - Custom hook with 30s debounce timer
2. Create hooks/useFormPersistence.ts - Handle localStorage fallback for offline
3. Add visual save indicator component showing (saving/saved/error) states
4. Integrate autosave into FormRuntime - trigger on field change with debounce
5. Implement resume logic - restore form state on page refresh
6. Handle offline gracefully - queue saves for retry when back online

SUCCESS CRITERIA:
- [ ] Autosave triggers on field change with 30s debounce
- [ ] Save indicator shows correct state (idle/saving/saved/error)
- [ ] Refresh page resumes from last saved state
- [ ] Offline mode queues saves and retries when online
- [ ] No data loss on navigation between pages
- [ ] No TypeScript errors

When ALL criteria pass, output: <promise>AUTOSAVE_COMPLETE</promise>
