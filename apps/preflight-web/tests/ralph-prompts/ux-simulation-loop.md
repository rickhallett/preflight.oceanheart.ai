# Ralph Loop: UX Simulation Testing

You are running an iterative UX simulation test loop for the Preflight application.

## Your Mission

Execute end-to-end UX testing, fix any issues discovered, and verify fixes work.

## Iteration Protocol

Each iteration you must:

1. **Check Current State**
   - Read `tests/ralph-prompts/.ralph-state.json` if it exists
   - Review what was done in previous iterations (check git status, test results)

2. **Run Tests**
   - Execute: `cd apps/preflight-web && bun run test:simulate:all`
   - Or run Playwright: `cd apps/preflight-web && bunx playwright test tests/e2e/ux-simulation.spec.ts --reporter=list`
   - Capture all failures and observations

3. **Analyze Results**
   - Parse test output for failures
   - Categorize issues: UI bugs, accessibility, performance, broken flows

4. **Fix Issues** (if any found)
   - Make targeted fixes to the application code
   - Do NOT modify test expectations unless the test itself is wrong
   - Commit each fix with clear message

5. **Re-verify**
   - Run the specific failing test again
   - Confirm the fix works

6. **Update State**
   - Update `tests/ralph-prompts/.ralph-state.json` with:
     ```json
     {
       "iteration": <number>,
       "timestamp": "<ISO timestamp>",
       "testsRun": <count>,
       "testsPassed": <count>,
       "testsFailed": <count>,
       "issuesFixed": ["<description>", ...],
       "remainingIssues": ["<description>", ...],
       "status": "in_progress" | "all_passing" | "blocked"
     }
     ```

## Completion Criteria

Output the completion promise ONLY when ALL of these are true:
- All 8 test scenarios pass
- No console errors during tests
- No accessibility issues found
- Performance metrics within thresholds (FCP < 3s, LCP < 4s)
- Screenshots captured for all scenarios

When complete, output:
```
<promise>UX SIMULATION COMPLETE</promise>
```

## Test Scenarios to Verify

| # | Scenario | Key Checks |
|---|----------|------------|
| 1 | Landing Page | Hero visible, nav works, responsive |
| 2 | Authentication | Login form, stub auth, redirect flow |
| 3 | Dashboard | User info, stats cards, navigation |
| 4 | Survey System | Form loads, autosave, completion |
| 5 | Settings | Tab navigation, all sections render |
| 6 | Error Handling | 404 page, expired session redirect |
| 7 | Performance | Core Web Vitals within budget |
| 8 | Accessibility | No critical a11y issues |

## Files You May Need to Modify

- `apps/preflight-web/app/**/*.tsx` - Page components
- `apps/preflight-web/components/**/*.tsx` - UI components
- `apps/preflight-web/middleware.ts` - Auth/routing logic
- `apps/preflight-web/lib/**/*.ts` - Utilities and auth

## Files You Should NOT Modify

- `tests/e2e/ux-simulation.spec.ts` - Test definitions (unless test is wrong)
- `playwright.config.ts` - Test configuration
- `package.json` - Dependencies

## Important Notes

- Start the dev server if not running: `cd apps/preflight-web && bun run dev &`
- API server should be at http://localhost:8000 (some tests may mock this)
- Use stub auth for testing (no real Passport server needed)
- Take screenshots to document your progress

## Current Working Directory

`/home/kai/code/repo/oAI/preflight.oceanheart.ai`

Begin your iteration now.
