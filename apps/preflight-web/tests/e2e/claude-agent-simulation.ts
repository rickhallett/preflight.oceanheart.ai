/**
 * Claude Code Interactive UX Simulation Agent
 *
 * This script provides utilities for Claude Code to perform
 * manual end-to-end testing with real-time observability.
 *
 * Usage: bun run tests/e2e/claude-agent-simulation.ts [scenario]
 *
 * Scenarios:
 *   landing   - Public landing page experience
 *   auth      - Authentication flow
 *   dashboard - Protected dashboard navigation
 *   survey    - Survey system complete flow
 *   settings  - Settings and profile management
 *   errors    - Error handling edge cases
 *   all       - Run all scenarios
 */

import { chromium, type Browser, type Page, type BrowserContext } from 'playwright';

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  baseUrl: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headless: process.env.HEADLESS !== 'false',
  slowMo: parseInt(process.env.SLOW_MO || '0'),
  timeout: 30000,
};

// Stub auth token (non-expired)
const STUB_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0LXVzZXItMTIzIiwiZW1haWwiOiJqb2huLmRvZUBleGFtcGxlLmNvbSIsImV4cCI6OTk5OTk5OTk5OX0.stub-signature';

// ============================================================================
// OBSERVER - Real-time logging and metrics
// ============================================================================

interface Observation {
  time: string;
  type: 'nav' | 'ui' | 'net' | 'perf' | 'a11y' | 'err';
  message: string;
  data?: unknown;
}

class SimulationObserver {
  observations: Observation[] = [];
  private startTime: number = Date.now();

  log(type: Observation['type'], message: string, data?: unknown) {
    const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(2);
    const observation: Observation = {
      time: `+${elapsed}s`,
      type,
      message,
      data,
    };
    this.observations.push(observation);

    const typeColors: Record<string, string> = {
      nav: '\x1b[36m',    // cyan
      ui: '\x1b[33m',     // yellow
      net: '\x1b[35m',    // magenta
      perf: '\x1b[32m',   // green
      a11y: '\x1b[34m',   // blue
      err: '\x1b[31m',    // red
    };
    const reset = '\x1b[0m';
    const color = typeColors[type] || reset;

    console.log(`${color}[${type.toUpperCase()}]${reset} ${elapsed}s - ${message}`);
    if (data) console.log('  └─', JSON.stringify(data, null, 2).split('\n').join('\n     '));
  }

  reset() {
    this.observations = [];
    this.startTime = Date.now();
  }

  summary() {
    return {
      totalObservations: this.observations.length,
      byType: this.observations.reduce((acc, o) => {
        acc[o.type] = (acc[o.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      errors: this.observations.filter(o => o.type === 'err'),
      duration: `${((Date.now() - this.startTime) / 1000).toFixed(2)}s`,
    };
  }
}

// ============================================================================
// SIMULATION AGENT
// ============================================================================

class SimulationAgent {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;
  observer: SimulationObserver;

  constructor() {
    this.observer = new SimulationObserver();
  }

  async init() {
    console.log('\n🚀 Initializing Simulation Agent...\n');

    this.browser = await chromium.launch({
      headless: CONFIG.headless,
      slowMo: CONFIG.slowMo,
    });

    this.context = await this.browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
    });

    this.page = await this.context.newPage();

    // Set up observers
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Filter out known browser behaviors and expected test conditions:
        // - Hydration mismatch for caret-color is caused by browser autofill detection
        // - 404s are expected in error handling tests and for non-existent test forms
        if (
          text.includes('caret-color') ||
          text.includes('hydrated but some attributes') ||
          text.includes('status of 404')
        ) {
          // Known/expected behavior - skip logging as error
          return;
        }
        this.observer.log('err', `Console: ${text}`);
      }
    });

    this.page.on('pageerror', err => {
      this.observer.log('err', `Page Error: ${err.message}`);
    });

    this.page.on('requestfinished', async req => {
      if (req.url().includes('/api') || req.url().includes(CONFIG.apiUrl)) {
        const res = await req.response();
        this.observer.log('net', `${req.method()} ${new URL(req.url()).pathname}`, {
          status: res?.status(),
        });
      }
    });

    this.observer.log('nav', 'Browser initialized', {
      headless: CONFIG.headless,
      viewport: '1440x900',
    });
  }

  async setupAuth() {
    await this.context.addCookies([{
      name: 'oh_session',
      value: STUB_TOKEN,
      domain: 'localhost',
      path: '/',
    }]);

    await this.page.goto(CONFIG.baseUrl);
    await this.page.evaluate(() => {
      localStorage.setItem('preflight_auth_stub', 'true');
      localStorage.setItem('preflight_user_stub', JSON.stringify({
        id: 'test-user-123',
        email: 'john.doe@example.com',
        name: 'John Doe',
      }));
    });

    this.observer.log('ui', 'Auth state configured (stub mode)');
  }

  async clearAuth() {
    await this.context.clearCookies();
    await this.page.evaluate(() => {
      localStorage.removeItem('preflight_auth_stub');
      localStorage.removeItem('preflight_user_stub');
    });
  }

  async goto(path: string, options?: { allowRedirect?: boolean }) {
    const url = path.startsWith('http') ? path : `${CONFIG.baseUrl}${path}`;
    try {
      await this.page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
      this.observer.log('nav', `Navigated to ${path}`);
    } catch (error) {
      // Handle redirects and aborted navigations gracefully
      if (options?.allowRedirect) {
        this.observer.log('nav', `Navigation to ${path} redirected to ${this.page.url()}`);
      } else {
        this.observer.log('err', `Navigation failed: ${path}`, { error: String(error).slice(0, 100) });
      }
    }
  }

  async screenshot(name: string) {
    const path = `tests/screenshots/${name}.png`;
    await this.page.screenshot({ path, fullPage: true });
    this.observer.log('ui', `Screenshot saved: ${path}`);
  }

  async getPerformanceMetrics() {
    const metrics = await this.page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: nav?.domContentLoadedEventEnd - nav?.startTime,
        loadComplete: nav?.loadEventEnd - nav?.startTime,
        fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
      };
    });
    this.observer.log('perf', 'Performance metrics', metrics);
    return metrics;
  }

  async checkAccessibility() {
    const issues = await this.page.evaluate(() => {
      const problems: string[] = [];

      // Images without alt
      document.querySelectorAll('img:not([alt])').forEach(() => {
        problems.push('Image missing alt text');
      });

      // Form inputs without labels
      document.querySelectorAll('input:not([aria-label]):not([id])').forEach(() => {
        problems.push('Input missing label');
      });

      // Buttons without text or aria-label
      document.querySelectorAll('button:empty:not([aria-label])').forEach(() => {
        problems.push('Button missing accessible name');
      });

      return problems;
    });

    this.observer.log('a11y', `Found ${issues.length} accessibility issues`, issues.slice(0, 5));
    return issues;
  }

  async close() {
    await this.browser.close();
    console.log('\n📊 Simulation Summary:');
    console.log(JSON.stringify(this.observer.summary(), null, 2));
  }
}

// ============================================================================
// SCENARIO IMPLEMENTATIONS
// ============================================================================

async function runLandingScenario(agent: SimulationAgent) {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  SCENARIO 1: Public Landing Experience');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  await agent.goto('/');
  await agent.getPerformanceMetrics();

  // Check key sections
  const sections = ['nav', 'main', 'h1', '#features', '#faq'];
  for (const selector of sections) {
    const visible = await agent.page.locator(selector).first().isVisible().catch(() => false);
    agent.observer.log('ui', `Section "${selector}": ${visible ? '✅' : '❌'}`);
  }

  // Test navigation
  const navLinks = await agent.page.locator('nav a').count();
  agent.observer.log('ui', `Navigation links found: ${navLinks}`);

  await agent.checkAccessibility();
  await agent.screenshot('scenario1-landing');
}

async function runAuthScenario(agent: SimulationAgent) {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  SCENARIO 2: Authentication Flow');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  await agent.clearAuth();
  await agent.goto('/login');
  await agent.screenshot('scenario2-login-page');

  // Try to access protected route
  await agent.goto('/app');
  const redirectedToLogin = agent.page.url().includes('/login');
  agent.observer.log('ui', `Protected route redirect: ${redirectedToLogin ? '✅' : '❌'}`);

  // Perform login
  await agent.goto('/login');
  const emailInput = agent.page.locator('input[type="email"]').first();

  if (await emailInput.isVisible().catch(() => false)) {
    await emailInput.fill('john.doe@example.com');
    agent.observer.log('ui', 'Filled email input');

    const submitBtn = agent.page.locator('button[type="submit"]').first();
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      await agent.page.waitForURL(/\/(app|dashboard)/, { timeout: 10000 }).catch(() => {});
      agent.observer.log('nav', `Post-login URL: ${agent.page.url()}`);
    }
  }

  await agent.screenshot('scenario2-post-login');
}

async function runDashboardScenario(agent: SimulationAgent) {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  SCENARIO 3: Dashboard Navigation');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  await agent.setupAuth();
  await agent.goto('/app');
  await agent.getPerformanceMetrics();

  // Check dashboard elements
  const welcomeText = await agent.page.locator('h1, h2').first().textContent().catch(() => '');
  agent.observer.log('ui', `Welcome message: "${welcomeText?.substring(0, 50)}..."`);

  // Count cards/stats
  const cards = await agent.page.locator('[class*="card"], [data-testid*="card"]').count();
  agent.observer.log('ui', `Dashboard cards: ${cards}`);

  await agent.screenshot('scenario3-dashboard');

  // Test navigation to profile
  await agent.goto('/app/profile');
  agent.observer.log('nav', 'Navigated to profile');
  await agent.screenshot('scenario3-profile');

  // Test navigation to settings
  await agent.goto('/app/settings');
  agent.observer.log('nav', 'Navigated to settings');
  await agent.screenshot('scenario3-settings');
}

async function runSurveyScenario(agent: SimulationAgent) {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  SCENARIO 4: Survey System');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  await agent.setupAuth();
  await agent.goto('/app/survey/test-form');

  // Check for form or error
  const formVisible = await agent.page.locator('form').isVisible().catch(() => false);
  const errorVisible = await agent.page.locator('[class*="error"], text="not found"').isVisible().catch(() => false);

  if (errorVisible) {
    agent.observer.log('ui', 'Survey form not found (expected for test form ID)');
  } else if (formVisible) {
    agent.observer.log('ui', 'Survey form loaded');

    // Check form elements
    const inputs = await agent.page.locator('input, textarea, select').count();
    agent.observer.log('ui', `Form inputs: ${inputs}`);

    // Check for navigation buttons
    const nextBtn = await agent.page.locator('button:has-text("Next")').isVisible().catch(() => false);
    agent.observer.log('ui', `Next button: ${nextBtn ? '✅' : '❌'}`);
  }

  await agent.screenshot('scenario4-survey');
}

async function runSettingsScenario(agent: SimulationAgent) {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  SCENARIO 5: Settings & Profile');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  await agent.setupAuth();
  await agent.goto('/app/settings');

  // Test each tab
  const tabs = ['Account', 'Notifications', 'Privacy', 'Appearance', 'Billing', 'Help'];

  for (const tabName of tabs) {
    const tab = agent.page.locator(`button:has-text("${tabName}")`).first();
    if (await tab.isVisible().catch(() => false)) {
      await tab.click();
      await agent.page.waitForTimeout(300);
      agent.observer.log('ui', `Tab "${tabName}" clicked`);
    }
  }

  await agent.screenshot('scenario5-settings');

  // Check profile page
  await agent.goto('/app/profile');
  const userName = await agent.page.locator('h1, h2, [data-testid="user-name"]').first().textContent().catch(() => '');
  agent.observer.log('ui', `Profile name displayed: "${userName}"`);

  await agent.screenshot('scenario5-profile');
}

async function runErrorScenario(agent: SimulationAgent) {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  SCENARIO 6: Error Handling');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Test 404
  await agent.goto('/nonexistent-page-12345');
  const pageText = await agent.page.textContent('body').catch(() => '');
  const has404 = pageText?.includes('404') || pageText?.toLowerCase().includes('not found');
  agent.observer.log('ui', `404 page handling: ${has404 ? '✅' : '❌'}`);
  await agent.screenshot('scenario6-404');

  // Test expired session
  // First navigate to a valid page to reset state
  await agent.goto('/');
  await agent.clearAuth();
  await agent.context.addCookies([{
    name: 'oh_session',
    value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0IiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiZXhwIjoxfQ.stub-signature',
    domain: 'localhost',
    path: '/',
  }]);

  // Navigate to protected route - middleware should redirect to login
  await agent.goto('/app', { allowRedirect: true });
  await agent.page.waitForURL(/\/login/, { timeout: 5000 }).catch(() => {});
  const redirectedOnExpired = agent.page.url().includes('/login');
  agent.observer.log('ui', `Expired session redirect: ${redirectedOnExpired ? '✅' : '❌'}`);
  await agent.screenshot('scenario6-expired-session');
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  const scenario = process.argv[2] || 'all';
  const agent = new SimulationAgent();

  try {
    await agent.init();

    const scenarios: Record<string, () => Promise<void>> = {
      landing: () => runLandingScenario(agent),
      auth: () => runAuthScenario(agent),
      dashboard: () => runDashboardScenario(agent),
      survey: () => runSurveyScenario(agent),
      settings: () => runSettingsScenario(agent),
      errors: () => runErrorScenario(agent),
    };

    if (scenario === 'all') {
      for (const [name, fn] of Object.entries(scenarios)) {
        agent.observer.reset();
        await fn();
        console.log(`\n✓ Scenario "${name}" completed\n`);
      }
    } else if (scenarios[scenario]) {
      await scenarios[scenario]();
    } else {
      console.error(`Unknown scenario: ${scenario}`);
      console.log('Available: landing, auth, dashboard, survey, settings, errors, all');
      process.exit(1);
    }

    console.log('\n═══════════════════════════════════════════════════');
    console.log('  ✅ UX SIMULATION COMPLETE');
    console.log('═══════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('Simulation error:', error);
    process.exit(1);
  } finally {
    await agent.close();
  }
}

main();
