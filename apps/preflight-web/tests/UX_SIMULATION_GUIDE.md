# Preflight UX Simulation Test Guide

## Overview

This guide describes how to use **Claude Code as the testing agent** to perform comprehensive end-to-end user experience testing on the Preflight application. The approach combines automated Playwright tests with manual Claude-assisted exploration using Chrome DevTools Protocol (CDP) and MCP integrations.

---

## Quick Start

### Option 1: Run Automated Tests

```bash
cd apps/preflight-web

# Install Playwright browsers
bunx playwright install

# Run all UX simulation tests
bunx playwright test tests/e2e/ux-simulation.spec.ts

# Run with visual browser
bunx playwright test --headed

# Run with step-by-step debugging
bunx playwright test --debug

# Generate and view HTML report
bunx playwright show-report
```

### Option 2: Claude Code Manual Simulation

Use Claude Code to interactively simulate user journeys while providing real-time feedback and observations.

---

## Test Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    UX Simulation Framework                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │   Scenario   │    │   Observer   │    │   Reporter   │       │
│  │   Runner     │───▶│   (CDP/MCP)  │───▶│   (Logs)     │       │
│  └──────────────┘    └──────────────┘    └──────────────┘       │
│         │                   │                   │                │
│         ▼                   ▼                   ▼                │
│  ┌──────────────────────────────────────────────────────┐       │
│  │                  Chrome DevTools                      │       │
│  │  • Network Monitor  • Console Logs  • Performance    │       │
│  │  • Accessibility    • Memory        • Coverage       │       │
│  └──────────────────────────────────────────────────────┘       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Test Scenarios

### Scenario 1: Public Landing Experience

**Objective:** Verify the landing page provides a compelling first impression and functions correctly.

**Steps for Claude Code:**
1. Navigate to http://localhost:3000
2. Observe and report:
   - Page load time
   - Hero section visibility
   - Navigation menu items
   - Call-to-action buttons
3. Test anchor navigation (#features, #faq, #contact)
4. Verify responsive design at 375px, 768px, 1440px widths
5. Check for console errors
6. Capture screenshots at each viewport

**Expected Observations:**
```
[NAVIGATION] Landed on homepage
[PERFORMANCE] DOMContentLoaded: <3000ms
[INTERACTION] Hero section: VISIBLE
[INTERACTION] Navigation: 4 links (Features, FAQ, Contact, Login)
[ACCESSIBILITY] No images without alt text
```

---

### Scenario 2: Authentication Flow

**Objective:** Verify users can authenticate using stub mode and access protected areas.

**Steps for Claude Code:**
1. Navigate to /login
2. Verify login form renders (email input, submit button)
3. Enter test credentials: `john.doe@example.com`
4. Click submit and observe:
   - Network request to auth endpoint
   - Cookie `oh_session` being set
   - Redirect to /app
5. Verify user info displays on dashboard
6. Test logout flow from /app/profile

**Authentication States to Test:**
| State | Cookie | Expected Behavior |
|-------|--------|-------------------|
| No auth | None | Redirect to /login |
| Valid stub | `oh_session` (stub-signature) | Access granted |
| Expired | `oh_session` (exp < now) | Redirect to /login |
| Invalid | Malformed JWT | Redirect to /login |

---

### Scenario 3: Protected Dashboard Navigation

**Objective:** Verify authenticated users can navigate all dashboard sections.

**Steps for Claude Code:**
1. Set up auth state (stub cookie + localStorage)
2. Navigate to /app
3. Observe dashboard elements:
   - Welcome message with user name
   - Stats cards (Assessments, Score, Actions, Team)
   - Recent activity timeline
   - Quick action buttons
4. Click each navigation link:
   - Profile (/app/profile)
   - Settings (/app/settings)
5. Verify breadcrumbs/back navigation works

**Navigation Matrix:**
```
/app ─────────────────┬─── /app/profile
                      ├─── /app/settings
                      ├─── /app/survey/[formId]
                      └─── /app/coaching/[runId]
```

---

### Scenario 4: Survey System Complete Flow

**Objective:** Test the full survey experience from start to completion.

**Steps for Claude Code:**
1. From dashboard, click "Start Survey" CTA
2. Observe survey page load:
   - Form definition fetched from API
   - Run created or resumed
   - Progress indicator displayed
3. Fill in form fields on each page
4. Test navigation (Next/Previous)
5. Verify autosave:
   - Check localStorage for `preflight-answers-{runId}`
   - Wait 30 seconds and verify network save
6. Complete survey and observe:
   - Completion API called
   - Success message displayed
   - Redirect to dashboard

**Autosave Verification:**
```javascript
// Check localStorage
localStorage.getItem('preflight-run-{formId}')  // Should have run ID
localStorage.getItem('preflight-answers-{runId}')  // Should have answers

// Network observation
PATCH /runs/{runId}/answers  // Every 30 seconds
POST /runs/{runId}/complete  // On submit
```

---

### Scenario 5: Settings & Profile Management

**Objective:** Verify settings UI and profile display work correctly.

**Settings Tabs to Test:**
1. **Account** - Name, email, phone inputs
2. **Notifications** - Toggle switches for email/push
3. **Privacy & Security** - 2FA status, sessions list
4. **Appearance** - Theme toggle (Dark/Light/System)
5. **Billing** - Plan info, payment method
6. **Help & Support** - Documentation links, contact form

**Profile Page Checks:**
- Avatar display
- User name and email
- Account details (type, status, join date)
- Sign out button functionality

---

### Scenario 6: Error Handling

**Objective:** Verify the application handles errors gracefully.

**Error Cases to Test:**

| Test | Trigger | Expected |
|------|---------|----------|
| 404 Page | Navigate to /nonexistent | Friendly 404 UI |
| API Failure | Block API requests | Error state, retry option |
| Invalid Form | Submit empty required fields | Validation messages |
| Session Expired | Use expired token | Redirect to login |
| Network Offline | Disable network | Graceful degradation |

---

### Scenario 7: Performance & Accessibility

**Objective:** Ensure the application meets performance and accessibility standards.

**Performance Metrics:**
```
Target Thresholds:
- First Contentful Paint (FCP): < 1.8s
- Largest Contentful Paint (LCP): < 2.5s
- Time to Interactive (TTI): < 3.9s
- Cumulative Layout Shift (CLS): < 0.1
- Total Bundle Size: < 500KB gzipped
```

**Accessibility Checklist:**
- [ ] All images have alt text
- [ ] All form inputs have labels
- [ ] Color contrast ratio >= 4.5:1
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Skip link present
- [ ] Heading hierarchy correct (h1 > h2 > h3)
- [ ] ARIA attributes where needed

---

## Using Claude Code as Testing Agent

### Interactive Session Example

Start a manual testing session with Claude Code:

```
User: "Let's test the Preflight app. Start with the landing page."

Claude: I'll navigate to the landing page and report my observations.

[Executes: Navigate to http://localhost:3000]

Observations:
1. Page loaded in 1.2s (DOMContentLoaded)
2. Hero section displays "Preflight" heading
3. Navigation has 4 items: Features, FAQ, Contact, Login
4. CTA button "Get Started" is visible and clickable
5. No console errors detected
6. 3 images found, all have alt text

Shall I test the navigation links or proceed to login?
```

### Chrome DevTools MCP Integration

With Chrome DevTools MCP enabled, Claude can:

1. **Inspect Network Traffic**
   ```
   GET /api/health - 200 OK (45ms)
   GET /forms/onboarding - 200 OK (120ms)
   POST /runs - 201 Created (89ms)
   ```

2. **Monitor Console Logs**
   ```
   [INFO] Auth: Stub mode enabled
   [WARN] Form: No saved answers found
   [DEBUG] Navigation: Route changed to /app
   ```

3. **Capture Performance Data**
   ```
   LCP: 1.8s (Good)
   FCP: 0.9s (Good)
   CLS: 0.02 (Good)
   ```

4. **Run Accessibility Audits**
   ```
   Audit Results:
   - 0 critical issues
   - 2 moderate issues (color contrast)
   - 5 minor issues (missing landmarks)
   ```

---

## Test Data

### Stub Auth Credentials
```
Email: john.doe@example.com
(No password required in stub mode)
```

### Test Cookie
```javascript
{
  name: 'oh_session',
  value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0LXVzZXItMTIzIiwiZW1haWwiOiJqb2huLmRvZUBleGFtcGxlLmNvbSIsImV4cCI6OTk5OTk5OTk5OX0.stub-signature',
  domain: 'localhost',
  path: '/'
}
```

### LocalStorage Setup
```javascript
localStorage.setItem('preflight_auth_stub', 'true');
localStorage.setItem('preflight_user_stub', JSON.stringify({
  id: 'test-user-123',
  email: 'john.doe@example.com',
  name: 'John Doe',
}));
```

---

## Reporting Template

After each test scenario, Claude should provide:

```markdown
## Test Report: [Scenario Name]

**Status:** PASS / FAIL / PARTIAL
**Duration:** X seconds
**Date:** YYYY-MM-DD HH:MM

### Observations
- [List key observations]

### Issues Found
- [List any bugs or issues]

### Performance Metrics
- FCP: Xms
- LCP: Xms
- Network Requests: N

### Screenshots
- landing-page.png
- dashboard.png
- etc.

### Recommendations
- [Improvement suggestions]
```

---

## Running the Full Suite

### Automated Execution

```bash
# Full suite
bunx playwright test

# With traces for debugging
bunx playwright test --trace on

# Specific scenario
bunx playwright test -g "Scenario 1"

# Generate report
bunx playwright show-report
```

### Manual Execution with Claude

Prompt: "Run the complete UX simulation for Preflight"

Claude will:
1. Execute each scenario sequentially
2. Report observations in real-time
3. Capture evidence (screenshots, logs)
4. Summarize findings at the end

---

## Output Artifacts

After running tests, you'll find:

```
tests/
├── screenshots/
│   ├── landing-page.png
│   ├── landing-mobile.png
│   ├── landing-tablet.png
│   ├── landing-desktop.png
│   ├── login-page.png
│   ├── post-login.png
│   ├── dashboard.png
│   ├── settings-page.png
│   ├── profile-page.png
│   ├── survey-page.png
│   ├── 404-page.png
│   └── network-error.png
├── reports/
│   ├── index.html
│   └── results.json
└── results/
    └── [test artifacts]
```

---

## Integration with CI/CD

Add to your CI workflow:

```yaml
- name: Run UX Simulation Tests
  run: |
    cd apps/preflight-web
    bunx playwright install --with-deps
    bunx playwright test
  env:
    PLAYWRIGHT_BASE_URL: http://localhost:3000

- name: Upload Test Report
  uses: actions/upload-artifact@v4
  if: always()
  with:
    name: playwright-report
    path: apps/preflight-web/tests/reports/
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Tests timeout | Increase timeout in playwright.config.ts |
| Auth not working | Verify cookie domain matches test URL |
| API calls fail | Ensure backend is running on port 8000 |
| Screenshots blank | Add waitForLoadState before screenshot |
| Flaky tests | Add explicit waits for network/animations |

---

## Next Steps

1. Expand test coverage for edge cases
2. Add visual regression testing
3. Integrate axe-core for full a11y audits
4. Set up performance budgets
5. Create data-driven test variants
