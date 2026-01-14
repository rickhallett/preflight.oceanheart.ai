# Ralph Wiggum UX Testing Integration

This directory contains Ralph loop prompts for iterative UX testing and quality improvement.

## Quick Start

### Run Full UX Simulation Loop

```bash
# From repo root, start a Ralph loop for UX testing
/ralph-loop "$(cat apps/preflight-web/tests/ralph-prompts/ux-simulation-loop.md)" --max-iterations 15 --completion-promise "UX SIMULATION COMPLETE"
```

### Run Accessibility Remediation Loop

```bash
/ralph-loop "$(cat apps/preflight-web/tests/ralph-prompts/fix-accessibility.md)" --max-iterations 10 --completion-promise "ACCESSIBILITY COMPLETE"
```

### Run Performance Optimization Loop

```bash
/ralph-loop "$(cat apps/preflight-web/tests/ralph-prompts/optimize-performance.md)" --max-iterations 10 --completion-promise "PERFORMANCE OPTIMIZED"
```

## How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                    Ralph Wiggum Loop                         │
│                                                              │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐               │
│  │  Prompt  │───▶│  Claude  │───▶│  Tests   │               │
│  │  (same)  │    │  Action  │    │  Run     │               │
│  └──────────┘    └──────────┘    └──────────┘               │
│       ▲                               │                      │
│       │         ┌──────────┐          │                      │
│       └─────────│  Stop    │◀─────────┘                      │
│                 │  Hook    │                                 │
│                 └──────────┘                                 │
│                      │                                       │
│              (re-feeds same prompt                           │
│               unless <promise> found)                        │
└─────────────────────────────────────────────────────────────┘
```

Each iteration:
1. Claude receives the **same prompt**
2. Reads previous state from `.ralph-*-state.json`
3. Runs tests, identifies issues
4. Fixes issues, commits changes
5. Updates state file
6. Outputs `<promise>` when complete (or continues to next iteration)

## Available Prompts

| Prompt | Purpose | Completion Promise |
|--------|---------|-------------------|
| `ux-simulation-loop.md` | Full E2E UX testing | `UX SIMULATION COMPLETE` |
| `fix-accessibility.md` | WCAG 2.1 AA compliance | `ACCESSIBILITY COMPLETE` |
| `optimize-performance.md` | Core Web Vitals optimization | `PERFORMANCE OPTIMIZED` |

## State Files

Ralph loops use JSON state files to track progress across iterations:

```
tests/ralph-prompts/
├── .ralph-state.json         # UX simulation state
├── .ralph-a11y-state.json    # Accessibility state
└── .ralph-perf-state.json    # Performance state
```

These are automatically created/updated by Claude during iterations.

## Integration Patterns

### Pattern 1: Full Quality Loop

Run all quality checks in sequence:

```bash
# 1. Start with UX simulation
/ralph-loop "$(cat apps/preflight-web/tests/ralph-prompts/ux-simulation-loop.md)" --max-iterations 15 --completion-promise "UX SIMULATION COMPLETE"

# 2. Then accessibility
/ralph-loop "$(cat apps/preflight-web/tests/ralph-prompts/fix-accessibility.md)" --max-iterations 10 --completion-promise "ACCESSIBILITY COMPLETE"

# 3. Finally performance
/ralph-loop "$(cat apps/preflight-web/tests/ralph-prompts/optimize-performance.md)" --max-iterations 10 --completion-promise "PERFORMANCE OPTIMIZED"
```

### Pattern 2: Focused Scenario Loop

Create a custom prompt for a specific scenario:

```bash
/ralph-loop "Run Playwright test 'Scenario 2: Authentication Flow'. Fix any failures. Output <promise>AUTH TESTS PASS</promise> when all auth tests pass." --max-iterations 5 --completion-promise "AUTH TESTS PASS"
```

### Pattern 3: Pre-Commit Quality Gate

```bash
# Run before committing changes
/ralph-loop "Run 'bun run test:e2e' and fix any failures. Output <promise>READY TO COMMIT</promise> when all tests pass." --max-iterations 10 --completion-promise "READY TO COMMIT"
```

### Pattern 4: Interactive Debugging

```bash
# Debug a specific failing test
/ralph-loop "The test 'Survey System Complete Flow' is failing. Investigate the root cause, fix the issue, and verify. Output <promise>SURVEY FIXED</promise> when the test passes." --max-iterations 8 --completion-promise "SURVEY FIXED"
```

## Best Practices

### 1. Set Appropriate Max Iterations

| Task Type | Recommended Max |
|-----------|-----------------|
| Full UX simulation | 15-20 |
| Single scenario fix | 5-8 |
| Accessibility audit | 10-12 |
| Performance tuning | 10-15 |

### 2. Use Clear Completion Promises

Good promises are:
- Unique and unlikely to appear accidentally
- Descriptive of the completion state
- Easy to grep for in logs

```bash
# Good
--completion-promise "ALL 8 SCENARIOS PASS"
--completion-promise "WCAG AA COMPLIANT"

# Bad (too generic)
--completion-promise "DONE"
--completion-promise "OK"
```

### 3. Start Dev Server First

Ensure the app is running before starting a loop:

```bash
cd apps/preflight-web
bun run dev &

# Wait for server to start
sleep 5

# Then start Ralph loop
/ralph-loop "..."
```

### 4. Review State Between Iterations

Check the state file to understand progress:

```bash
cat apps/preflight-web/tests/ralph-prompts/.ralph-state.json | jq
```

### 5. Cancel Gracefully

If a loop is stuck or going wrong:

```bash
/cancel-ralph
```

This preserves the state file so you can review what happened.

## Combining with Manual Testing

Ralph loops work best for automated verification. Combine with manual testing:

```
┌─────────────────────────────────────────────────────┐
│              Development Workflow                    │
│                                                      │
│  1. Manual exploration (Claude interactive)          │
│     └─ "Walk me through the login flow"             │
│                                                      │
│  2. Automated verification (Ralph loop)              │
│     └─ /ralph-loop "Run auth tests..."              │
│                                                      │
│  3. Fix-verify cycle (Ralph loop)                    │
│     └─ /ralph-loop "Fix failing tests..."           │
│                                                      │
│  4. Final review (Manual)                            │
│     └─ "Show me screenshots from tests/"            │
└─────────────────────────────────────────────────────┘
```

## Troubleshooting

### Loop Not Completing

1. Check if completion promise is spelled correctly
2. Review state file for "blocked" status
3. Increase `--max-iterations`
4. Check for infinite loops in test code

### Tests Timing Out

1. Ensure dev server is running
2. Increase Playwright timeout in config
3. Check for network issues with API server

### State File Corrupted

Delete and restart:
```bash
rm apps/preflight-web/tests/ralph-prompts/.ralph-*.json
/ralph-loop "..."
```

## Example Session

```
User: /ralph-loop "$(cat apps/preflight-web/tests/ralph-prompts/ux-simulation-loop.md)" --max-iterations 10 --completion-promise "UX SIMULATION COMPLETE"

[Iteration 1]
Claude: Running UX simulation tests...
        Found 3 failing scenarios
        - Scenario 2: Login button not visible on mobile
        - Scenario 5: Settings tab "Billing" crashes
        - Scenario 7: FCP is 3.2s (target < 1.8s)

        Fixing login button responsiveness...
        ✓ Fixed: Added responsive classes to login button

        Updating state file...

[Iteration 2]
Claude: Checking previous state...
        Previous: 3 failures
        Running tests again...

        Found 2 failing scenarios
        - Scenario 5: Settings tab "Billing" crashes
        - Scenario 7: FCP is 3.2s

        Investigating Billing tab crash...
        ✓ Fixed: Null check for subscription data

        Updating state file...

[Iteration 3]
Claude: Checking previous state...
        Previous: 2 failures
        Running tests again...

        Found 1 failing scenario
        - Scenario 7: FCP is 2.1s (improved but still > 1.8s)

        Optimizing bundle...
        ✓ Added dynamic import for heavy chart component

        Updating state file...

[Iteration 4]
Claude: Checking previous state...
        Previous: 1 failure
        Running tests again...

        All 8 scenarios PASSING!
        - FCP: 1.6s ✓
        - All UI tests pass ✓
        - No accessibility issues ✓

        <promise>UX SIMULATION COMPLETE</promise>

[Loop completed after 4 iterations]
```

## Files Reference

```
apps/preflight-web/
├── tests/
│   ├── e2e/
│   │   ├── ux-simulation.spec.ts      # Playwright test suite
│   │   └── claude-agent-simulation.ts  # Interactive simulation agent
│   ├── ralph-prompts/
│   │   ├── README.md                   # This file
│   │   ├── ux-simulation-loop.md       # Full UX test loop
│   │   ├── fix-accessibility.md        # A11y remediation loop
│   │   ├── optimize-performance.md     # Performance loop
│   │   └── .ralph-*.json               # State files (generated)
│   ├── screenshots/                     # Test screenshots
│   └── reports/                         # Playwright reports
└── playwright.config.ts                 # Playwright configuration
```
