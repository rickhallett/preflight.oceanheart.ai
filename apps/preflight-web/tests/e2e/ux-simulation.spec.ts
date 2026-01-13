/**
 * Preflight UX Simulation Test Suite
 *
 * End-to-end user experience testing with comprehensive observability.
 * Uses Playwright with Chrome DevTools Protocol for deep inspection.
 *
 * Test Scenarios:
 * 1. Public Landing Experience
 * 2. Authentication Flow (Stub Mode)
 * 3. Protected Dashboard Navigation
 * 4. Survey System Complete Flow
 * 5. Settings & Profile Management
 * 6. Error Handling & Edge Cases
 * 7. Performance & Accessibility Audits
 */

import { test, expect, type Page, type BrowserContext } from '@playwright/test';

// ============================================================================
// TEST CONFIGURATION & HELPERS
// ============================================================================

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface TestObservation {
  timestamp: string;
  type: 'navigation' | 'interaction' | 'network' | 'console' | 'performance' | 'accessibility';
  description: string;
  data?: Record<string, unknown>;
}

class UXObserver {
  private observations: TestObservation[] = [];
  private page: Page;
  private networkRequests: Array<{ url: string; status: number; timing: number }> = [];

  constructor(page: Page) {
    this.page = page;
    this.setupObservers();
  }

  private setupObservers() {
    // Console log observer
    this.page.on('console', (msg) => {
      this.log('console', `Console ${msg.type()}: ${msg.text()}`, {
        type: msg.type(),
        location: msg.location(),
      });
    });

    // Network request observer
    this.page.on('requestfinished', async (request) => {
      const response = await request.response();
      const timing = request.timing();
      this.networkRequests.push({
        url: request.url(),
        status: response?.status() || 0,
        timing: timing.responseEnd - timing.requestStart,
      });

      if (request.url().includes('/api') || request.url().includes(API_URL)) {
        this.log('network', `API: ${request.method()} ${request.url()}`, {
          status: response?.status(),
          timing: timing.responseEnd - timing.requestStart,
        });
      }
    });

    // Page error observer
    this.page.on('pageerror', (error) => {
      this.log('console', `Page Error: ${error.message}`, { stack: error.stack });
    });
  }

  log(type: TestObservation['type'], description: string, data?: Record<string, unknown>) {
    this.observations.push({
      timestamp: new Date().toISOString(),
      type,
      description,
      data,
    });
    console.log(`[${type.toUpperCase()}] ${description}`);
  }

  async capturePerformanceMetrics() {
    const metrics = await this.page.evaluate(() => {
      const perf = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: perf?.domContentLoadedEventEnd - perf?.startTime,
        loadComplete: perf?.loadEventEnd - perf?.startTime,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
      };
    });

    this.log('performance', 'Page Performance Metrics', metrics);
    return metrics;
  }

  async runAccessibilityAudit() {
    // Basic accessibility checks
    const issues: string[] = [];

    // Check for images without alt text
    const imagesWithoutAlt = await this.page.$$eval('img:not([alt])', imgs => imgs.length);
    if (imagesWithoutAlt > 0) {
      issues.push(`${imagesWithoutAlt} images without alt text`);
    }

    // Check for buttons without accessible names
    const buttonsWithoutLabel = await this.page.$$eval(
      'button:not([aria-label]):not(:has(span)):empty',
      btns => btns.length
    );
    if (buttonsWithoutLabel > 0) {
      issues.push(`${buttonsWithoutLabel} buttons without accessible names`);
    }

    // Check for form inputs without labels
    const inputsWithoutLabels = await this.page.$$eval(
      'input:not([aria-label]):not([id])',
      inputs => inputs.length
    );
    if (inputsWithoutLabels > 0) {
      issues.push(`${inputsWithoutLabels} inputs without associated labels`);
    }

    this.log('accessibility', 'Accessibility Audit', { issues, count: issues.length });
    return issues;
  }

  getReport() {
    return {
      observations: this.observations,
      networkSummary: {
        totalRequests: this.networkRequests.length,
        apiRequests: this.networkRequests.filter(r => r.url.includes('/api')).length,
        avgResponseTime: this.networkRequests.length > 0
          ? this.networkRequests.reduce((sum, r) => sum + r.timing, 0) / this.networkRequests.length
          : 0,
      },
    };
  }
}

// ============================================================================
// SCENARIO 1: PUBLIC LANDING EXPERIENCE
// ============================================================================

test.describe('Scenario 1: Public Landing Experience', () => {
  let observer: UXObserver;

  test.beforeEach(async ({ page }) => {
    observer = new UXObserver(page);
  });

  test('1.1 - Initial landing page load and visual inspection', async ({ page }) => {
    observer.log('navigation', 'Starting landing page test');

    // Navigate to landing page
    await page.goto(BASE_URL);
    observer.log('navigation', 'Landed on homepage');

    // Wait for hero section to be visible
    await expect(page.locator('main')).toBeVisible();

    // Capture initial performance metrics
    await observer.capturePerformanceMetrics();

    // Verify key landing page sections exist
    const sections = [
      { name: 'Navigation', selector: 'nav, [role="navigation"]' },
      { name: 'Hero Section', selector: 'h1, [data-testid="hero"]' },
      { name: 'Features', selector: '#features, [data-testid="features"]' },
      { name: 'FAQ', selector: '#faq, [data-testid="faq"]' },
    ];

    for (const section of sections) {
      const isVisible = await page.locator(section.selector).first().isVisible().catch(() => false);
      observer.log('interaction', `Section "${section.name}": ${isVisible ? 'VISIBLE' : 'NOT FOUND'}`, {
        selector: section.selector,
        visible: isVisible,
      });
    }

    // Take screenshot for visual reference
    await page.screenshot({ path: 'tests/screenshots/landing-page.png', fullPage: true });
    observer.log('interaction', 'Captured full-page screenshot');
  });

  test('1.2 - Navigation and anchor links', async ({ page }) => {
    await page.goto(BASE_URL);
    observer.log('navigation', 'Testing navigation links');

    // Test anchor navigation
    const anchorLinks = ['#features', '#faq', '#contact'];

    for (const anchor of anchorLinks) {
      const link = page.locator(`a[href="${anchor}"]`).first();
      if (await link.isVisible().catch(() => false)) {
        await link.click();
        await page.waitForTimeout(500); // Allow smooth scroll
        observer.log('interaction', `Clicked anchor link: ${anchor}`);

        // Verify URL hash changed
        const currentUrl = page.url();
        expect(currentUrl).toContain(anchor);
      }
    }

    // Test login button presence
    const loginButton = page.locator('a[href="/login"], button:has-text("Login"), button:has-text("Sign")').first();
    const loginVisible = await loginButton.isVisible().catch(() => false);
    observer.log('interaction', `Login button visible: ${loginVisible}`);
  });

  test('1.3 - Responsive design check', async ({ page }) => {
    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1440, height: 900 },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');

      observer.log('interaction', `Testing ${viewport.name} viewport (${viewport.width}x${viewport.height})`);

      // Capture viewport-specific screenshot
      await page.screenshot({
        path: `tests/screenshots/landing-${viewport.name.toLowerCase()}.png`
      });

      // Check for horizontal overflow
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      observer.log('interaction', `${viewport.name} horizontal overflow: ${hasHorizontalScroll}`);
      expect(hasHorizontalScroll).toBe(false);
    }
  });

  test.afterEach(async () => {
    console.log('\n=== Test Report ===');
    console.log(JSON.stringify(observer.getReport(), null, 2));
  });
});

// ============================================================================
// SCENARIO 2: AUTHENTICATION FLOW
// ============================================================================

test.describe('Scenario 2: Authentication Flow', () => {
  let observer: UXObserver;

  test.beforeEach(async ({ page }) => {
    observer = new UXObserver(page);
    // Clear any existing auth state
    await page.context().clearCookies();
  });

  test('2.1 - Login page renders correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    observer.log('navigation', 'Navigated to login page');

    // Wait for login form to be visible
    await page.waitForSelector('form, [data-testid="login-form"], input[type="email"]', { timeout: 10000 });
    observer.log('interaction', 'Login form loaded');

    // Check for email input
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const emailVisible = await emailInput.isVisible().catch(() => false);
    observer.log('interaction', `Email input visible: ${emailVisible}`);

    // Check for submit button
    const submitButton = page.locator('button[type="submit"], button:has-text("Sign"), button:has-text("Log")').first();
    const submitVisible = await submitButton.isVisible().catch(() => false);
    observer.log('interaction', `Submit button visible: ${submitVisible}`);

    await page.screenshot({ path: 'tests/screenshots/login-page.png' });
  });

  test('2.2 - Stub authentication flow', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    observer.log('navigation', 'Starting stub auth flow');

    // Look for stub auth mode or test mode indicator
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();

    if (await emailInput.isVisible().catch(() => false)) {
      // Fill in test credentials
      await emailInput.fill('john.doe@example.com');
      observer.log('interaction', 'Filled email: john.doe@example.com');

      // Find and click submit
      const submitButton = page.locator('button[type="submit"]').first();
      if (await submitButton.isVisible()) {
        await submitButton.click();
        observer.log('interaction', 'Clicked submit button');

        // Wait for navigation or auth completion
        await page.waitForURL(/\/(app|dashboard)/, { timeout: 10000 }).catch(() => {
          observer.log('interaction', 'Did not redirect to dashboard - checking for errors');
        });

        // Check if we're on the dashboard
        const currentUrl = page.url();
        observer.log('navigation', `Post-login URL: ${currentUrl}`);

        // Verify cookie was set
        const cookies = await page.context().cookies();
        const sessionCookie = cookies.find(c => c.name === 'oh_session');
        observer.log('interaction', `Session cookie set: ${!!sessionCookie}`);
      }
    }

    await page.screenshot({ path: 'tests/screenshots/post-login.png' });
  });

  test('2.3 - Protected route redirect', async ({ page }) => {
    // Attempt to access protected route without auth
    await page.goto(`${BASE_URL}/app`);
    observer.log('navigation', 'Attempting to access /app without auth');

    // Should redirect to login
    await page.waitForURL(/\/login/, { timeout: 5000 }).catch(() => {
      observer.log('interaction', 'Did not redirect to login - may already be authenticated');
    });

    const currentUrl = page.url();
    observer.log('navigation', `Redirect result: ${currentUrl}`);

    // Check for returnTo parameter
    if (currentUrl.includes('returnTo')) {
      observer.log('interaction', 'ReturnTo parameter present in redirect');
    }
  });

  test('2.4 - Logout flow', async ({ page, context }) => {
    // First, authenticate
    await page.goto(`${BASE_URL}/login`);
    const emailInput = page.locator('input[type="email"]').first();

    if (await emailInput.isVisible().catch(() => false)) {
      await emailInput.fill('john.doe@example.com');
      await page.locator('button[type="submit"]').first().click();
      await page.waitForURL(/\/(app|dashboard)/, { timeout: 10000 }).catch(() => {});
    }

    // Navigate to profile and find logout
    await page.goto(`${BASE_URL}/app/profile`);
    observer.log('navigation', 'Navigated to profile page');

    // Look for sign out button
    const signOutButton = page.locator('button:has-text("Sign Out"), button:has-text("Log out"), button:has-text("Logout")').first();

    if (await signOutButton.isVisible().catch(() => false)) {
      await signOutButton.click();
      observer.log('interaction', 'Clicked sign out button');

      // Verify redirect to login or landing
      await page.waitForURL(/\/(login|$)/, { timeout: 5000 });
      observer.log('navigation', `Post-logout URL: ${page.url()}`);

      // Verify cookies cleared
      const cookies = await context.cookies();
      const sessionCookie = cookies.find(c => c.name === 'oh_session');
      observer.log('interaction', `Session cookie after logout: ${sessionCookie ? 'PRESENT' : 'CLEARED'}`);
    }
  });
});

// ============================================================================
// SCENARIO 3: DASHBOARD NAVIGATION
// ============================================================================

test.describe('Scenario 3: Protected Dashboard', () => {
  let observer: UXObserver;

  test.beforeEach(async ({ page, context }) => {
    observer = new UXObserver(page);

    // Set up authenticated state via stub auth
    await context.addCookies([{
      name: 'oh_session',
      value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0LXVzZXItMTIzIiwiZW1haWwiOiJqb2huLmRvZUBleGFtcGxlLmNvbSIsImV4cCI6OTk5OTk5OTk5OX0.stub-signature',
      domain: 'localhost',
      path: '/',
    }]);

    // Also set localStorage for stub auth
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.setItem('preflight_auth_stub', 'true');
      localStorage.setItem('preflight_user_stub', JSON.stringify({
        id: 'test-user-123',
        email: 'john.doe@example.com',
        name: 'John Doe',
      }));
    });
  });

  test('3.1 - Dashboard loads and displays user info', async ({ page }) => {
    await page.goto(`${BASE_URL}/app`);
    observer.log('navigation', 'Navigated to dashboard');

    await page.waitForLoadState('networkidle');
    await observer.capturePerformanceMetrics();

    // Check for welcome message with user name
    const welcomeText = await page.locator('h1, h2, [data-testid="welcome"]').first().textContent().catch(() => '');
    observer.log('interaction', `Welcome text: ${welcomeText}`);

    // Check for dashboard stats/cards
    const statsCards = await page.locator('[data-testid="stat"], .stat-card, [class*="card"]').count();
    observer.log('interaction', `Dashboard cards found: ${statsCards}`);

    await page.screenshot({ path: 'tests/screenshots/dashboard.png', fullPage: true });
  });

  test('3.2 - Navigation menu functionality', async ({ page }) => {
    await page.goto(`${BASE_URL}/app`);
    observer.log('navigation', 'Testing main navigation');

    const navLinks = [
      { text: 'Profile', expectedPath: '/app/profile' },
      { text: 'Settings', expectedPath: '/app/settings' },
    ];

    for (const navLink of navLinks) {
      const link = page.locator(`a:has-text("${navLink.text}"), nav >> text="${navLink.text}"`).first();

      if (await link.isVisible().catch(() => false)) {
        await link.click();
        await page.waitForLoadState('networkidle');

        const currentPath = new URL(page.url()).pathname;
        observer.log('navigation', `Clicked "${navLink.text}" -> ${currentPath}`);

        expect(currentPath).toContain(navLink.expectedPath.replace('/app', ''));

        // Navigate back to dashboard
        await page.goto(`${BASE_URL}/app`);
      }
    }
  });

  test('3.3 - Survey CTA interaction', async ({ page }) => {
    await page.goto(`${BASE_URL}/app`);
    observer.log('interaction', 'Looking for survey CTA');

    // Look for survey start button
    const surveyButton = page.locator('button:has-text("Survey"), a:has-text("Survey"), button:has-text("Feedback"), a:has-text("Start")').first();

    if (await surveyButton.isVisible().catch(() => false)) {
      observer.log('interaction', 'Survey CTA found');
      await surveyButton.click();

      await page.waitForURL(/\/survey/, { timeout: 5000 }).catch(() => {
        observer.log('interaction', 'Survey navigation did not occur');
      });

      observer.log('navigation', `Post-CTA URL: ${page.url()}`);
    } else {
      observer.log('interaction', 'Survey CTA not found on dashboard');
    }
  });
});

// ============================================================================
// SCENARIO 4: SURVEY SYSTEM FLOW
// ============================================================================

test.describe('Scenario 4: Survey System', () => {
  let observer: UXObserver;

  test.beforeEach(async ({ page, context }) => {
    observer = new UXObserver(page);

    // Set up auth
    await context.addCookies([{
      name: 'oh_session',
      value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0LXVzZXItMTIzIiwiZW1haWwiOiJqb2huLmRvZUBleGFtcGxlLmNvbSIsImV4cCI6OTk5OTk5OTk5OX0.stub-signature',
      domain: 'localhost',
      path: '/',
    }]);

    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.setItem('preflight_auth_stub', 'true');
      localStorage.setItem('preflight_user_stub', JSON.stringify({
        id: 'test-user-123',
        email: 'john.doe@example.com',
        name: 'John Doe',
      }));
    });
  });

  test('4.1 - Survey page loads with form definition', async ({ page }) => {
    // Navigate to a survey (using a test form ID)
    await page.goto(`${BASE_URL}/app/survey/test-survey`);
    observer.log('navigation', 'Navigated to survey page');

    await page.waitForLoadState('networkidle');

    // Check for form elements
    const formExists = await page.locator('form, [data-testid="survey-form"]').isVisible().catch(() => false);
    observer.log('interaction', `Survey form visible: ${formExists}`);

    // Check for error state (form not found)
    const errorMessage = await page.locator('[data-testid="error"], .error, text="not found"').isVisible().catch(() => false);
    if (errorMessage) {
      observer.log('interaction', 'Survey not found - expected for test form ID');
    }

    await page.screenshot({ path: 'tests/screenshots/survey-page.png' });
  });

  test('4.2 - Survey form interaction and autosave', async ({ page }) => {
    // This test requires a valid form ID - adjust based on your test data
    await page.goto(`${BASE_URL}/app/survey/onboarding`);
    observer.log('navigation', 'Testing survey interactions');

    await page.waitForLoadState('networkidle');

    // Look for form inputs
    const textInputs = await page.locator('input[type="text"], textarea').count();
    const radioInputs = await page.locator('input[type="radio"]').count();
    const checkboxInputs = await page.locator('input[type="checkbox"]').count();

    observer.log('interaction', `Form inputs found - Text: ${textInputs}, Radio: ${radioInputs}, Checkbox: ${checkboxInputs}`);

    // Fill first text input if available
    const firstInput = page.locator('input[type="text"], textarea').first();
    if (await firstInput.isVisible().catch(() => false)) {
      await firstInput.fill('Test response from UX simulation');
      observer.log('interaction', 'Filled test input');

      // Wait for potential autosave
      await page.waitForTimeout(2000);

      // Check localStorage for saved answers
      const savedData = await page.evaluate(() => {
        const keys = Object.keys(localStorage).filter(k => k.startsWith('preflight-'));
        return keys.map(k => ({ key: k, hasValue: !!localStorage.getItem(k) }));
      });
      observer.log('interaction', `LocalStorage state: ${JSON.stringify(savedData)}`);
    }
  });

  test('4.3 - Survey navigation (multi-page)', async ({ page }) => {
    await page.goto(`${BASE_URL}/app/survey/onboarding`);
    observer.log('navigation', 'Testing survey pagination');

    await page.waitForLoadState('networkidle');

    // Look for next/previous buttons
    const nextButton = page.locator('button:has-text("Next"), button:has-text("Continue"), button[aria-label*="next"]').first();
    const prevButton = page.locator('button:has-text("Previous"), button:has-text("Back"), button[aria-label*="prev"]').first();

    // Check progress indicator
    const progressBar = await page.locator('[role="progressbar"], .progress, [data-testid="progress"]').isVisible().catch(() => false);
    observer.log('interaction', `Progress indicator visible: ${progressBar}`);

    if (await nextButton.isVisible().catch(() => false)) {
      await nextButton.click();
      observer.log('interaction', 'Clicked next button');
      await page.waitForTimeout(500);

      // Verify page changed (could check URL hash, step indicator, etc.)
      const newProgress = await page.locator('[data-testid="step-indicator"], .step-current').textContent().catch(() => 'unknown');
      observer.log('interaction', `Current step: ${newProgress}`);
    }
  });

  test('4.4 - Survey completion flow', async ({ page }) => {
    // This would be a longer test that completes an entire survey
    // For now, we'll check for the completion UI elements
    await page.goto(`${BASE_URL}/app/survey/onboarding`);
    observer.log('interaction', 'Checking completion flow elements');

    await page.waitForLoadState('networkidle');

    // Look for submit button (usually on last page)
    const submitButton = page.locator('button:has-text("Submit"), button:has-text("Complete"), button:has-text("Finish")').first();
    const submitExists = await submitButton.isVisible().catch(() => false);
    observer.log('interaction', `Submit button visible: ${submitExists}`);

    await page.screenshot({ path: 'tests/screenshots/survey-completion.png' });
  });
});

// ============================================================================
// SCENARIO 5: SETTINGS & PROFILE
// ============================================================================

test.describe('Scenario 5: Settings & Profile Management', () => {
  let observer: UXObserver;

  test.beforeEach(async ({ page, context }) => {
    observer = new UXObserver(page);

    await context.addCookies([{
      name: 'oh_session',
      value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0LXVzZXItMTIzIiwiZW1haWwiOiJqb2huLmRvZUBleGFtcGxlLmNvbSIsImV4cCI6OTk5OTk5OTk5OX0.stub-signature',
      domain: 'localhost',
      path: '/',
    }]);

    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.setItem('preflight_auth_stub', 'true');
      localStorage.setItem('preflight_user_stub', JSON.stringify({
        id: 'test-user-123',
        email: 'john.doe@example.com',
        name: 'John Doe',
      }));
    });
  });

  test('5.1 - Settings page tabs navigation', async ({ page }) => {
    await page.goto(`${BASE_URL}/app/settings`);
    observer.log('navigation', 'Navigated to settings page');

    await page.waitForLoadState('networkidle');

    // Expected settings tabs
    const expectedTabs = ['Account', 'Notifications', 'Privacy', 'Appearance', 'Billing', 'Help'];

    for (const tabName of expectedTabs) {
      const tab = page.locator(`button:has-text("${tabName}"), [role="tab"]:has-text("${tabName}")`).first();
      const tabVisible = await tab.isVisible().catch(() => false);

      if (tabVisible) {
        await tab.click();
        await page.waitForTimeout(300);
        observer.log('interaction', `Tab "${tabName}" clicked and content loaded`);
      } else {
        observer.log('interaction', `Tab "${tabName}" not found`);
      }
    }

    await page.screenshot({ path: 'tests/screenshots/settings-page.png', fullPage: true });
  });

  test('5.2 - Profile information display', async ({ page }) => {
    await page.goto(`${BASE_URL}/app/profile`);
    observer.log('navigation', 'Navigated to profile page');

    await page.waitForLoadState('networkidle');

    // Check for user information display
    const profileElements = [
      { name: 'Avatar', selector: 'img[alt*="avatar"], img[alt*="profile"], .avatar' },
      { name: 'Name', selector: 'h1, h2, [data-testid="user-name"]' },
      { name: 'Email', selector: '[data-testid="user-email"], text="@"' },
    ];

    for (const element of profileElements) {
      const isVisible = await page.locator(element.selector).first().isVisible().catch(() => false);
      observer.log('interaction', `Profile ${element.name}: ${isVisible ? 'VISIBLE' : 'NOT FOUND'}`);
    }

    await page.screenshot({ path: 'tests/screenshots/profile-page.png' });
  });

  test('5.3 - Theme/appearance toggle', async ({ page }) => {
    await page.goto(`${BASE_URL}/app/settings`);
    observer.log('interaction', 'Testing appearance settings');

    // Navigate to appearance tab
    const appearanceTab = page.locator('button:has-text("Appearance"), [role="tab"]:has-text("Appearance")').first();
    if (await appearanceTab.isVisible().catch(() => false)) {
      await appearanceTab.click();
      await page.waitForTimeout(500);
    }

    // Look for theme toggle
    const darkModeToggle = page.locator('button:has-text("Dark"), input[type="checkbox"][name*="theme"], [data-testid="theme-toggle"]').first();

    if (await darkModeToggle.isVisible().catch(() => false)) {
      // Capture current theme
      const initialTheme = await page.evaluate(() => {
        return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
      });
      observer.log('interaction', `Initial theme: ${initialTheme}`);

      await darkModeToggle.click();
      await page.waitForTimeout(500);

      const newTheme = await page.evaluate(() => {
        return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
      });
      observer.log('interaction', `Theme after toggle: ${newTheme}`);
    }
  });
});

// ============================================================================
// SCENARIO 6: ERROR HANDLING & EDGE CASES
// ============================================================================

test.describe('Scenario 6: Error Handling', () => {
  let observer: UXObserver;

  test.beforeEach(async ({ page }) => {
    observer = new UXObserver(page);
  });

  test('6.1 - 404 page handling', async ({ page }) => {
    await page.goto(`${BASE_URL}/non-existent-page-${Date.now()}`);
    observer.log('navigation', 'Navigated to non-existent page');

    // Check for 404 indication
    const pageContent = await page.textContent('body');
    const has404 = pageContent?.includes('404') || pageContent?.includes('not found') || pageContent?.includes('Not Found');
    observer.log('interaction', `404 indication present: ${has404}`);

    await page.screenshot({ path: 'tests/screenshots/404-page.png' });
  });

  test('6.2 - Network error handling', async ({ page, context }) => {
    // Block API requests to simulate network failure
    await context.route(`${API_URL}/**`, route => route.abort('failed'));

    await page.goto(`${BASE_URL}/app`);
    observer.log('interaction', 'Testing with blocked API');

    // Check for error state or graceful degradation
    await page.waitForTimeout(3000);

    const errorVisible = await page.locator('.error, [data-testid="error"], text="error"').isVisible().catch(() => false);
    observer.log('interaction', `Error UI displayed: ${errorVisible}`);

    await page.screenshot({ path: 'tests/screenshots/network-error.png' });
  });

  test('6.3 - Invalid form submission', async ({ page, context }) => {
    await context.addCookies([{
      name: 'oh_session',
      value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0LXVzZXItMTIzIiwiZW1haWwiOiJqb2huLmRvZUBleGFtcGxlLmNvbSIsImV4cCI6OTk5OTk5OTk5OX0.stub-signature',
      domain: 'localhost',
      path: '/',
    }]);

    await page.goto(`${BASE_URL}/app/settings`);
    observer.log('interaction', 'Testing form validation');

    // Find any form with validation
    const emailInput = page.locator('input[type="email"]').first();

    if (await emailInput.isVisible().catch(() => false)) {
      // Enter invalid email
      await emailInput.fill('invalid-email');

      // Try to submit
      const submitButton = page.locator('button[type="submit"]').first();
      if (await submitButton.isVisible().catch(() => false)) {
        await submitButton.click();

        // Check for validation message
        const validationError = await page.locator('.error, [aria-invalid="true"], :invalid').isVisible().catch(() => false);
        observer.log('interaction', `Validation error shown: ${validationError}`);
      }
    }
  });

  test('6.4 - Session expiry handling', async ({ page, context }) => {
    // Set an expired token
    await context.addCookies([{
      name: 'oh_session',
      value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0LXVzZXItMTIzIiwiZW1haWwiOiJqb2huLmRvZUBleGFtcGxlLmNvbSIsImV4cCI6MX0.stub-signature',
      domain: 'localhost',
      path: '/',
    }]);

    await page.goto(`${BASE_URL}/app`);
    observer.log('interaction', 'Testing with expired session');

    // Should redirect to login
    await page.waitForURL(/\/login/, { timeout: 5000 }).catch(() => {});

    const currentUrl = page.url();
    observer.log('navigation', `Expired session redirect: ${currentUrl}`);

    expect(currentUrl).toContain('/login');
  });
});

// ============================================================================
// SCENARIO 7: PERFORMANCE & ACCESSIBILITY
// ============================================================================

test.describe('Scenario 7: Performance & Accessibility', () => {
  let observer: UXObserver;

  test.beforeEach(async ({ page }) => {
    observer = new UXObserver(page);
  });

  test('7.1 - Core Web Vitals check', async ({ page }) => {
    await page.goto(BASE_URL);
    observer.log('performance', 'Measuring Core Web Vitals');

    // Wait for page to fully load
    await page.waitForLoadState('networkidle');

    // Collect performance metrics
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lcp = entries.find(e => e.entryType === 'largest-contentful-paint');
          resolve({
            lcp: lcp?.startTime,
          });
        });
        observer.observe({ entryTypes: ['largest-contentful-paint'] });

        // Fallback if no LCP entry
        setTimeout(() => resolve({ lcp: null }), 5000);
      });
    });

    observer.log('performance', 'Core Web Vitals', metrics as Record<string, unknown>);

    // Get navigation timing
    const timing = await observer.capturePerformanceMetrics();

    // Assert reasonable performance
    if (timing.domContentLoaded) {
      expect(timing.domContentLoaded).toBeLessThan(5000); // 5 second threshold
    }
  });

  test('7.2 - Accessibility audit - Landing page', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    const issues = await observer.runAccessibilityAudit();

    // Additional checks
    const headingOrder = await page.evaluate(() => {
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      return headings.map(h => ({ tag: h.tagName, text: h.textContent?.slice(0, 50) }));
    });
    observer.log('accessibility', 'Heading structure', { headings: headingOrder });

    // Check for skip link
    const skipLink = await page.locator('a[href="#main"], a[href="#content"], .skip-link').isVisible().catch(() => false);
    observer.log('accessibility', `Skip link present: ${skipLink}`);

    // Color contrast would require additional tooling like axe-core
    observer.log('accessibility', 'Note: Run axe-core for full accessibility audit');
  });

  test('7.3 - Keyboard navigation', async ({ page }) => {
    await page.goto(BASE_URL);
    observer.log('accessibility', 'Testing keyboard navigation');

    // Tab through focusable elements
    const focusableElements: string[] = [];

    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');

      const focused = await page.evaluate(() => {
        const el = document.activeElement;
        return {
          tag: el?.tagName,
          text: el?.textContent?.slice(0, 30),
          role: el?.getAttribute('role'),
        };
      });

      focusableElements.push(`${focused.tag}: ${focused.text || focused.role || 'unnamed'}`);
    }

    observer.log('accessibility', 'Focus order', { elements: focusableElements });

    // Test Enter key on focused button/link
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    observer.log('interaction', 'Activated focused element with Enter key');
  });

  test('7.4 - Resource loading analysis', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Analyze loaded resources
    const resources = await page.evaluate(() => {
      const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

      return {
        total: entries.length,
        byType: entries.reduce((acc, entry) => {
          const type = entry.initiatorType;
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        largestResources: entries
          .sort((a, b) => b.transferSize - a.transferSize)
          .slice(0, 5)
          .map(e => ({
            name: e.name.split('/').pop(),
            size: Math.round(e.transferSize / 1024) + 'KB',
            duration: Math.round(e.duration) + 'ms',
          })),
        totalTransferSize: Math.round(entries.reduce((sum, e) => sum + e.transferSize, 0) / 1024) + 'KB',
      };
    });

    observer.log('performance', 'Resource loading analysis', resources);

    // Assert reasonable resource count
    expect(resources.total).toBeLessThan(100);
  });
});

// ============================================================================
// SCENARIO 8: SANDBOX TESTING (Development Tool)
// ============================================================================

test.describe('Scenario 8: Sandbox Environment', () => {
  let observer: UXObserver;

  test.beforeEach(async ({ page }) => {
    observer = new UXObserver(page);
  });

  test('8.1 - Sandbox page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/sandbox`);
    observer.log('navigation', 'Navigated to sandbox');

    await page.waitForLoadState('networkidle');

    // Check for split pane interface
    const jsonViewer = await page.locator('[data-testid="json-viewer"], .json-viewer, pre').isVisible().catch(() => false);
    const formPreview = await page.locator('[data-testid="form-preview"], form').isVisible().catch(() => false);

    observer.log('interaction', `JSON viewer visible: ${jsonViewer}`);
    observer.log('interaction', `Form preview visible: ${formPreview}`);

    await page.screenshot({ path: 'tests/screenshots/sandbox.png', fullPage: true });
  });

  test('8.2 - Sandbox form interaction', async ({ page }) => {
    await page.goto(`${BASE_URL}/sandbox`);
    await page.waitForLoadState('networkidle');

    // Look for step navigator
    const stepNav = page.locator('[data-testid="step-navigator"], .step-nav').first();

    if (await stepNav.isVisible().catch(() => false)) {
      observer.log('interaction', 'Step navigator found');

      // Try clicking through steps
      const steps = await page.locator('[data-testid="step"], .step').count();
      observer.log('interaction', `Number of steps: ${steps}`);
    }

    // Interact with form preview
    const inputs = await page.locator('form input, form textarea, form select').count();
    observer.log('interaction', `Form inputs in preview: ${inputs}`);
  });
});

// ============================================================================
// TEST UTILITIES
// ============================================================================

// Helper to run all tests with comprehensive reporting
test.afterAll(async () => {
  console.log('\n========================================');
  console.log('UX SIMULATION TEST SUITE COMPLETE');
  console.log('========================================');
  console.log('Screenshots saved to: tests/screenshots/');
  console.log('Run with --headed flag for visual debugging');
  console.log('Run with --trace on for detailed traces');
  console.log('========================================\n');
});
