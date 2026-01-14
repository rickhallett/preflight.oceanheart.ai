# UX Baseline Command

Establish a baseline of the current UX state by running all simulation tests.

## Instructions

Execute these steps in order:

### 1. Install Dependencies (if needed)

```bash
cd apps/preflight-web && bun install
```

Check if Playwright is installed:
```bash
bunx playwright --version || bunx playwright install chromium
```

### 2. Check/Start Dev Server

```bash
# Check if already running on port 3002
curl -s http://localhost:3002 > /dev/null 2>&1 && echo "DEV_SERVER=running" || echo "DEV_SERVER=stopped"
```

If stopped, start it:
```bash
cd apps/preflight-web && bun run dev &
sleep 5  # Wait for server to initialize
```

### 3. Run Full Simulation

```bash
cd apps/preflight-web && bun run test:simulate:all 2>&1
```

### 4. Report Findings

After running, present results in this format:

```
## UX Baseline Report

| Scenario | Status | Issues |
|----------|--------|--------|
| 1. Landing | ✅/❌ | ... |
| 2. Auth | ✅/❌ | ... |
| 3. Dashboard | ✅/❌ | ... |
| 4. Survey | ✅/❌ | ... |
| 5. Settings | ✅/❌ | ... |
| 6. Errors | ✅/❌ | ... |
| 7. Performance | ✅/❌ | ... |
| 8. Accessibility | ✅/❌ | ... |

**Summary:** X/8 passing

**Screenshots:** tests/screenshots/

**Recommended Next Step:**
- [Based on results, suggest: manual fix, Ralph loop, or specific focus]
```

### 5. Offer Next Actions

Based on results, offer:
- `/ux-ralph` - Start iterative fix loop
- Fix specific issues manually
- Run focused test: `bun run test:simulate [scenario]`
