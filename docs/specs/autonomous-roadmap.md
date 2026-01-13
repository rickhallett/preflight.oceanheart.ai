# Autonomous Development Roadmap with Ralph Wiggum Orchestration

> Generated: 2026-01-12 | Branch: `auth-integration`

## Executive Summary

Project Preflight is at **Phase 2** of a 3-phase roadmap. This document defines an autonomous development strategy using the Ralph Wiggum iterative technique at multiple orchestration levels.

### Current Status Snapshot

| Phase | Status | Completion |
|-------|--------|------------|
| Phase 1: Foundation | Complete | 100% |
| Phase 2: Form System | In Progress | ~25% |
| Phase 3: LLM Coaching | Planned | 0% |
| UI Polish (Aceternity) | Phase 3/5 In Progress | ~50% |
| Authentication | Complete | 100% |

---

## Multi-Level Orchestration Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    LEVEL 0: Meta-Orchestrator                   │
│         (Human oversight, phase transitions, blockers)          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  LEVEL 1: Phase Orchestration                   │
│            Ralph loops for completing entire phases             │
│         Prompt: PHASE-PROMPT.md with success criteria           │
└─────────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  LEVEL 2: PRD   │ │  LEVEL 2: PRD   │ │  LEVEL 2: PRD   │
│  Orchestration  │ │  Orchestration  │ │  Orchestration  │
│  (Form DSL)     │ │  (Autosave)     │ │  (Validation)   │
└─────────────────┘ └─────────────────┘ └─────────────────┘
          │                   │                   │
          ▼                   ▼                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                    LEVEL 3: Task Execution                      │
│         Individual tasks with atomic completion signals         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phase 2: Form System Completion

### 2A. Form DSL Runtime (Priority: HIGH)

**Objective:** Implement JSON Form DSL renderer with full validation

**Ralph Loop Prompt:**
```
/ralph-loop "Implement the Form DSL runtime renderer in apps/preflight-web.

CONTEXT:
- Read docs/specs/phase-2-form-system.prd.md for requirements
- Read docs/specs/decision-log/ADR-0001-form-dsl-scope.md for scope decisions
- Existing sandbox at app/sandbox/ has partial implementation

TASKS:
1. Create FormDefinitionLoader service to fetch form schemas from API
2. Build recursive DSL renderer supporting: markdown, text, textarea, select, radio, checkbox
3. Implement multi-page navigation with progress tracking
4. Wire up to existing SurveyContainer and form components
5. Add unit tests for renderer logic

SUCCESS CRITERIA:
- [ ] FormDefinitionLoader fetches and caches form definitions
- [ ] All 6 field types render correctly
- [ ] Multi-page navigation works with progress bar
- [ ] bun test passes with >80% coverage on new code
- [ ] No TypeScript errors (tsc --noEmit)

When ALL criteria pass, output: <promise>FORM_DSL_COMPLETE</promise>" --completion-promise "FORM_DSL_COMPLETE" --max-iterations 15
```

### 2B. Autosave System (Priority: HIGH)

**Objective:** Implement debounced autosave with resume capability

**Ralph Loop Prompt:**
```
/ralph-loop "Implement autosave system for survey responses.

CONTEXT:
- Read docs/specs/phase-2-form-system.prd.md for autosave requirements
- Read docs/specs/decision-log/ADR-0003-autosave-resume-strategy.md

TASKS:
1. Create useAutosave hook with 30s debounce
2. Implement PATCH /runs/{run_id}/answers endpoint call
3. Add visual indicator for save status (saving/saved/error)
4. Implement resume logic on page load (check for existing run)
5. Handle offline gracefully with localStorage fallback

SUCCESS CRITERIA:
- [ ] Autosave triggers on field change with 30s debounce
- [ ] Save indicator shows correct state
- [ ] Refresh page resumes from last saved state
- [ ] Offline mode queues saves for retry
- [ ] No data loss on navigation

When ALL criteria pass, output: <promise>AUTOSAVE_COMPLETE</promise>" --completion-promise "AUTOSAVE_COMPLETE" --max-iterations 12
```

### 2C. API Endpoints (Priority: HIGH)

**Objective:** Implement Phase 2 backend endpoints

**Ralph Loop Prompt:**
```
/ralph-loop "Implement Phase 2 API endpoints in apps/preflight-api.

CONTEXT:
- Read docs/specs/phase-2-form-system.prd.md for endpoint specs
- Database models exist in app/models/

ENDPOINTS TO IMPLEMENT:
1. GET /forms/{form_name}?version={semver?} - Return form definition
2. POST /runs - Create new survey run
3. GET /runs/{run_id} - Get run with answers
4. PATCH /runs/{run_id}/answers - Autosave answers (idempotent by page_id)
5. POST /runs/{run_id}/complete - Mark run complete

SUCCESS CRITERIA:
- [ ] All 5 endpoints return correct responses
- [ ] pytest passes with all new tests
- [ ] Endpoints handle auth (stub mode OK for now)
- [ ] PATCH is idempotent (same call = same result)
- [ ] Error responses follow RFC 7807

When ALL criteria pass, output: <promise>API_PHASE2_COMPLETE</promise>" --completion-promise "API_PHASE2_COMPLETE" --max-iterations 10
```

---

## Phase 3: LLM Coaching Pipeline

### 3A. LLM Service Abstraction (Priority: MEDIUM)

**Ralph Loop Prompt:**
```
/ralph-loop "Implement LLM service abstraction layer.

CONTEXT:
- Read docs/specs/phase-3-llm-coaching.prd.md
- Read docs/specs/decision-log/ADR-0004-llm-provider-strategy.md

TASKS:
1. Create LLMService abstract interface in app/services/llm/
2. Implement OpenAIProvider with chat completions
3. Implement AnthropicProvider with messages API
4. Create provider factory with env-based selection
5. Add retry logic with exponential backoff
6. Implement token counting and cost tracking

SUCCESS CRITERIA:
- [ ] LLMService interface defined with send_message, count_tokens
- [ ] OpenAI provider works with gpt-4
- [ ] Anthropic provider works with claude-3
- [ ] Provider selected via LLM_PROVIDER env var
- [ ] Retries on transient errors
- [ ] pytest passes

When ALL criteria pass, output: <promise>LLM_SERVICE_COMPLETE</promise>" --completion-promise "LLM_SERVICE_COMPLETE" --max-iterations 12
```

### 3B. Prompt Pipeline Engine (Priority: MEDIUM)

**Ralph Loop Prompt:**
```
/ralph-loop "Implement prompt pipeline engine for coaching flow.

CONTEXT:
- Read docs/specs/phase-3-llm-coaching.prd.md for pipeline specs
- LLM service abstraction must be complete first

TASKS:
1. Create PromptPipeline class with template loading
2. Implement variable substitution ({{survey_responses}}, {{user_context}})
3. Add conversation history management
4. Create safety guardrail checks (no medical advice detection)
5. Implement round limiting (max 4 turns)
6. Add pipeline version tracking

SUCCESS CRITERIA:
- [ ] Pipelines load from prompt_pipelines table
- [ ] Variables substitute correctly
- [ ] History persists to coach_turns table
- [ ] Safety checks block inappropriate content
- [ ] Round limit enforced
- [ ] pytest passes

When ALL criteria pass, output: <promise>PIPELINE_COMPLETE</promise>" --completion-promise "PIPELINE_COMPLETE" --max-iterations 15
```

### 3C. Coaching UI (Priority: MEDIUM)

**Ralph Loop Prompt:**
```
/ralph-loop "Implement coaching chat interface in Next.js.

CONTEXT:
- Read docs/specs/phase-3-llm-coaching.prd.md for UI requirements
- Use existing Aceternity UI components where possible

TASKS:
1. Create CoachingChat component with message bubbles
2. Add typing indicator during LLM response
3. Implement message history display
4. Add input with send button and Enter key support
5. Show round counter (X of 4)
6. Handle session end gracefully

SUCCESS CRITERIA:
- [ ] Chat renders with user/assistant message distinction
- [ ] Typing indicator shows during API call
- [ ] History loads on component mount
- [ ] Mobile responsive layout
- [ ] Round counter accurate
- [ ] No TypeScript errors

When ALL criteria pass, output: <promise>COACHING_UI_COMPLETE</promise>" --completion-promise "COACHING_UI_COMPLETE" --max-iterations 10
```

---

## Aceternity UI Migration Completion

### UI Phase 3: Interactive Elements (Priority: LOW)

**Ralph Loop Prompt:**
```
/ralph-loop "Complete Aceternity UI Phase 3 - Interactive Elements.

CONTEXT:
- Read docs/specs/aceternity-ui-migration.prd.md
- AnimatedCard and AnimatedButton already done

REMAINING TASKS:
1. Apply animations to form input components
2. Add loading state animations (skeleton, spinner)
3. Implement scroll-triggered animations
4. Add micro-interactions to navigation
5. Test cross-browser compatibility

SUCCESS CRITERIA:
- [ ] Form inputs have focus/blur animations
- [ ] Loading states use Aceternity patterns
- [ ] Scroll animations work on landing page
- [ ] Navigation has smooth transitions
- [ ] Works in Chrome, Firefox, Safari
- [ ] No layout shifts (CLS < 0.1)

When ALL criteria pass, output: <promise>ACETERNITY_PHASE3_COMPLETE</promise>" --completion-promise "ACETERNITY_PHASE3_COMPLETE" --max-iterations 10
```

---

## Orchestration Strategies

### Strategy A: Sequential Phase Completion

Best for: Stable progress, dependency management

```bash
# Run phases in sequence
/ralph-loop "Complete Phase 2A..." --completion-promise "FORM_DSL_COMPLETE"
# Wait for completion
/ralph-loop "Complete Phase 2B..." --completion-promise "AUTOSAVE_COMPLETE"
# etc.
```

### Strategy B: Parallel Workstreams

Best for: Speed, independent features

```bash
# Terminal 1: Frontend form system
/ralph-loop "Implement Form DSL renderer..." --max-iterations 15

# Terminal 2: Backend API
/ralph-loop "Implement Phase 2 API..." --max-iterations 10

# Terminal 3: UI polish
/ralph-loop "Complete Aceternity UI..." --max-iterations 10
```

### Strategy C: Nested Orchestration

Best for: Complex features with sub-tasks

```bash
# Outer loop: Phase-level
/ralph-loop "Complete Phase 2 Form System.

SUB-TASKS (run as inner loops if needed):
- Form DSL Runtime
- Autosave System
- API Endpoints
- Integration Testing

Check docs/specs/phase-2-form-system.prd.md for full requirements.

When phase is complete with all tests passing: <promise>PHASE_2_COMPLETE</promise>" --completion-promise "PHASE_2_COMPLETE" --max-iterations 30
```

---

## Completion Criteria by Phase

### Phase 2 Complete When:
- [ ] Form DSL renders all field types
- [ ] Multi-page navigation works
- [ ] Autosave persists every 30s
- [ ] Resume works on page refresh
- [ ] All API endpoints functional
- [ ] `bun test` passes (frontend)
- [ ] `pytest` passes (backend)
- [ ] Lighthouse accessibility >= 90
- [ ] Page load < 200ms after initial fetch

### Phase 3 Complete When:
- [ ] LLM service abstraction works with 2 providers
- [ ] Prompt pipeline loads and executes
- [ ] Conversation persists across refreshes
- [ ] Safety guardrails block inappropriate content
- [ ] Rate limiting enforced (4 rounds, 5 req/min)
- [ ] Full E2E flow tested
- [ ] All tests pass

---

## Recommended Execution Order

### Immediate (This Week)
1. **2C: API Endpoints** - Backend foundation for everything else
2. **2A: Form DSL Runtime** - Core frontend feature
3. **2B: Autosave System** - UX critical

### Next Sprint
4. **3A: LLM Service Abstraction** - Foundation for coaching
5. **UI Phase 3** - Polish parallel to feature work

### Following Sprint
6. **3B: Prompt Pipeline Engine** - Core coaching logic
7. **3C: Coaching UI** - User-facing chat
8. **Integration & Testing** - E2E validation

---

## Risk Mitigation

| Risk | Mitigation | Ralph Strategy |
|------|------------|----------------|
| Loop gets stuck | `--max-iterations` limit | Always set max |
| Scope creep | Clear success criteria | Explicit checkboxes |
| Breaking changes | Git commits each iteration | Review diffs |
| Test failures | Include test pass in criteria | Block on red tests |
| Auth complexity | Use stub auth during dev | Isolate concerns |

---

## Monitoring & Checkpoints

### After Each Ralph Loop
1. Review git diff for changes made
2. Verify tests pass (`bun test`, `pytest`)
3. Check for TypeScript errors (`tsc --noEmit`)
4. Validate against PRD requirements
5. Update change log if significant

### Phase Transitions
1. Full test suite pass
2. Manual smoke test
3. Update implementation report
4. Commit with conventional message
5. Consider PR to main if stable

---

## Quick Start

**To begin Phase 2 completion immediately:**

```bash
cd /home/kai/code/repo/oAI/preflight.oceanheart.ai

# Start with API endpoints (backend foundation)
/ralph-loop "Implement Phase 2 API endpoints in apps/preflight-api.

Read docs/specs/phase-2-form-system.prd.md for specs.

ENDPOINTS:
1. GET /forms/{form_name} - Return form definition
2. POST /runs - Create survey run
3. GET /runs/{run_id} - Get run with answers
4. PATCH /runs/{run_id}/answers - Autosave (idempotent)
5. POST /runs/{run_id}/complete - Mark complete

When all endpoints work and pytest passes: <promise>API_READY</promise>" --completion-promise "API_READY" --max-iterations 10
```

---

## Appendix: File Locations

| Component | Location |
|-----------|----------|
| Phase 2 PRD | `docs/specs/phase-2-form-system.prd.md` |
| Phase 3 PRD | `docs/specs/phase-3-llm-coaching.prd.md` |
| ADRs | `docs/specs/decision-log/` |
| Frontend App | `apps/preflight-web/` |
| Backend API | `apps/preflight-api/` |
| UI Components | `apps/preflight-web/components/` |
| Form Sandbox | `apps/preflight-web/app/sandbox/` |
