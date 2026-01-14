# UX Ralph Loop Command

Start an iterative Ralph Wiggum loop for UX testing and fixing.

## Instructions

Tell the user you're about to start a Ralph loop for UX simulation testing. Explain:

1. This will run iteratively until all tests pass (or max iterations reached)
2. Each iteration: runs tests → identifies failures → fixes issues → re-runs
3. Progress is tracked in `tests/ralph-prompts/.ralph-state.json`
4. Use `/cancel-ralph` to stop early if needed

Then suggest running:

```
/ralph-wiggum:ralph-loop "You are testing the Preflight app (apps/preflight-web). Each iteration: 1) Run 'cd apps/preflight-web && bun run test:simulate:all' 2) Read .ralph-state.json for previous state 3) Fix any failing tests by modifying app code 4) Update .ralph-state.json with results 5) Output <promise>UX SIMULATION COMPLETE</promise> ONLY when all 8 scenarios pass with no errors." --max-iterations 15 --completion-promise "UX SIMULATION COMPLETE"
```

Or for a quicker check, just the Playwright tests:

```
/ralph-wiggum:ralph-loop "Run 'cd apps/preflight-web && bunx playwright test tests/e2e/ux-simulation.spec.ts --reporter=list'. Fix failures. Output <promise>TESTS PASS</promise> when all pass." --max-iterations 10 --completion-promise "TESTS PASS"
```
