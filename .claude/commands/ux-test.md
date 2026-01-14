# UX Test Command

Run the UX simulation tests interactively and report findings.

## Instructions

1. First, check if the dev server is running:
   ```bash
   curl -s http://localhost:3002 > /dev/null && echo "Server running" || echo "Server not running"
   ```

2. If not running, start it:
   ```bash
   cd apps/preflight-web && bun run dev &
   ```

3. Run the simulation agent:
   ```bash
   cd apps/preflight-web && bun run test:simulate:all
   ```

4. Analyze the output and report:
   - Total scenarios run
   - Pass/fail count
   - Key issues found
   - Screenshots captured

5. If any failures, offer to:
   - Fix the issues directly
   - Start a Ralph loop for iterative fixing
   - Run specific failing scenario again

Present findings in a clear summary table.
