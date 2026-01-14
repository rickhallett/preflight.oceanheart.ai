/**
 * OAuth Integration E2E Tests
 *
 * Tests the authentication flows including:
 * - Stub authentication (test mode)
 * - OAuth redirect and callback
 * - Token validation and refresh
 * - Session expiry handling
 */
import { test, expect } from '@playwright/test';
import {
  AuthTestHelper,
  createStubToken,
  createExpiredStubToken,
  createNearExpiryToken,
  STUB_USER,
} from '../fixtures/auth-fixtures';

test.describe('Authentication Flow - Stub Mode', () => {
  let authHelper: AuthTestHelper;

  test.beforeEach(async ({ page, context }) => {
    authHelper = new AuthTestHelper();
    // Clear any existing auth state
    await authHelper.clearAuth(context, page);
  });

  test('should display login page for unauthenticated users', async ({ page }) => {
    await page.goto('/login');

    // Check login page elements
    await expect(page.locator('h1, h2').first()).toContainText(/sign in|login|welcome/i);
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
    await expect(page.locator('button:has-text("Sign in")')).toBeVisible();
  });

  test('should redirect to login when accessing protected route without auth', async ({
    page,
  }) => {
    await page.goto('/app');

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });

  test('should authenticate with stub mode and access protected route', async ({
    page,
    context,
  }) => {
    // Set up stub auth
    await authHelper.setupStubAuth(context, page);

    // Navigate to protected route
    await page.goto('/app');

    // Should not redirect to login
    await expect(page).not.toHaveURL(/\/login/);

    // Should show dashboard content
    await expect(page.locator('body')).toContainText(/dashboard|welcome/i);
  });

  test('should sign in via login form (stub mode)', async ({ page }) => {
    await page.goto('/login');

    // Fill email
    await page.fill('input[type="email"], input[name="email"]', 'test@example.com');

    // Click sign in (test mode button)
    const signInButton = page.locator('button:has-text("Sign in")').first();
    await signInButton.click();

    // Wait for navigation
    await page.waitForURL('/app', { timeout: 5000 });

    // Should be on app page
    await expect(page).toHaveURL('/app');
  });

  test('should sign out and redirect to login', async ({ page, context }) => {
    // First, set up auth
    await authHelper.setupStubAuth(context, page);
    await page.goto('/app');

    // Find and click sign out button
    const signOutButton = page.locator('button:has-text("Sign out"), button:has-text("Logout")');

    if (await signOutButton.isVisible()) {
      await signOutButton.click();

      // Should redirect to login or home
      await expect(page).toHaveURL(/\/(login)?$/);
    }
  });
});

test.describe('Authentication Flow - OAuth Redirect', () => {
  let authHelper: AuthTestHelper;

  test.beforeEach(async ({ page, context }) => {
    authHelper = new AuthTestHelper();
    await authHelper.clearAuth(context, page);
  });

  test('should show Oceanheart OAuth button on login page', async ({ page }) => {
    await page.goto('/login');

    // Look for OAuth button
    const oauthButton = page.locator('button:has-text("Oceanheart"), a:has-text("Oceanheart")');
    await expect(oauthButton).toBeVisible();
  });

  test('should construct correct OAuth redirect URL', async ({ page }) => {
    await page.goto('/login');

    // Track navigation to OAuth provider
    let oauthUrl: string | null = null;

    page.on('request', (request) => {
      if (request.url().includes('passport.lvh.me') || request.url().includes('passport.oceanheart.ai')) {
        oauthUrl = request.url();
      }
    });

    // Click OAuth button
    const oauthButton = page.locator('button:has-text("Oceanheart"), a:has-text("Oceanheart")');

    if (await oauthButton.isVisible()) {
      // Use evaluate to check href instead of clicking (avoids external navigation)
      const href = await oauthButton.evaluate((el) => {
        if (el.tagName === 'A') return (el as HTMLAnchorElement).href;
        // If button, check for onclick handler
        return null;
      });

      if (href) {
        expect(href).toMatch(/passport\.(lvh\.me|oceanheart\.ai)/);
        expect(href).toMatch(/returnTo=/);
      }
    }
  });

  test('should handle OAuth callback with token', async ({ page, context }) => {
    // Simulate OAuth callback with token
    const token = createStubToken();

    // Navigate to app with token parameter (simulating OAuth callback)
    await page.goto(`/app?token=${token}`);

    // The app should extract token from URL and set it
    // Check that we're authenticated after callback
    await page.waitForTimeout(500); // Wait for token processing

    // Verify we stay on /app (not redirected to login)
    const url = page.url();
    expect(url).toMatch(/\/app/);
  });

  test('should handle OAuth callback with error', async ({ page }) => {
    // Simulate OAuth callback with error
    await page.goto('/login?error=access_denied&error_description=User%20denied%20access');

    // Should show error message
    await expect(page.locator('body')).toContainText(/denied|error|failed/i);
  });
});

test.describe('Token Validation and Expiry', () => {
  let authHelper: AuthTestHelper;

  test.beforeEach(async ({ page, context }) => {
    authHelper = new AuthTestHelper();
    await authHelper.clearAuth(context, page);
  });

  test('should redirect to login when token is expired', async ({ page, context }) => {
    // Set up expired token
    await authHelper.setupExpiredAuth(context, page);

    // Try to access protected route
    await page.goto('/app');

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });

  test('should include returnTo parameter when redirecting to login', async ({
    page,
    context,
  }) => {
    // Clear auth
    await authHelper.clearAuth(context, page);

    // Try to access specific protected route
    await page.goto('/app/settings');

    // Should redirect to login with returnTo
    await expect(page).toHaveURL(/\/login/);
    const url = page.url();
    expect(url).toMatch(/returnTo/);
  });

  test('should validate token expiry correctly', async ({ page, context }) => {
    // Set up valid token
    await authHelper.setupStubAuth(context, page);
    await page.goto('/app');

    // Validate token is not expired
    const isValid = await authHelper.validateTokenExpiry(page);
    expect(isValid).toBe(true);
  });

  test('should detect expired token correctly', async ({ page, context }) => {
    // Set up expired token
    const expiredToken = createExpiredStubToken();

    await context.addCookies([
      {
        name: 'oh_session',
        value: expiredToken,
        domain: 'localhost',
        path: '/',
      },
    ]);

    await page.goto('/login');

    // Validate token is expired
    const isValid = await authHelper.validateTokenExpiry(page);
    expect(isValid).toBe(false);
  });
});

test.describe('Session Management', () => {
  let authHelper: AuthTestHelper;

  test.beforeEach(async ({ page, context }) => {
    authHelper = new AuthTestHelper();
  });

  test('should persist auth state across page reloads', async ({ page, context }) => {
    // Set up auth
    await authHelper.setupStubAuth(context, page);
    await page.goto('/app');

    // Verify authenticated
    await expect(page).not.toHaveURL(/\/login/);

    // Reload page
    await page.reload();

    // Should still be authenticated
    await expect(page).not.toHaveURL(/\/login/);
  });

  test('should navigate between protected routes while authenticated', async ({
    page,
    context,
  }) => {
    await authHelper.setupStubAuth(context, page);

    // Navigate to dashboard
    await page.goto('/app');
    await expect(page).toHaveURL('/app');

    // Navigate to profile
    await page.goto('/app/profile');
    await expect(page).toHaveURL('/app/profile');

    // Navigate to settings
    await page.goto('/app/settings');
    await expect(page).toHaveURL('/app/settings');
  });

  test('should clear auth state on sign out', async ({ page, context }) => {
    await authHelper.setupStubAuth(context, page);
    await page.goto('/app');

    // Get initial auth state
    const initialAuth = await authHelper.getAuthState(page);
    expect(initialAuth.isAuthenticated).toBe(true);

    // Clear auth
    await authHelper.clearAuth(context, page);

    // Reload to trigger auth check
    await page.goto('/app');

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Cross-Domain Cookie Handling', () => {
  test('should set cookie with correct attributes', async ({ page, context }) => {
    const authHelper = new AuthTestHelper();
    await authHelper.setupStubAuth(context, page);

    // Get cookies
    const cookies = await context.cookies();
    const sessionCookie = cookies.find((c) => c.name === 'oh_session');

    expect(sessionCookie).toBeDefined();
    expect(sessionCookie!.path).toBe('/');
    expect(sessionCookie!.sameSite).toBe('Lax');
  });

  test('should handle cookie domain for localhost', async ({ context }) => {
    const token = createStubToken();

    // Set cookie for localhost
    await context.addCookies([
      {
        name: 'oh_session',
        value: token,
        domain: 'localhost',
        path: '/',
        sameSite: 'Lax',
      },
    ]);

    const cookies = await context.cookies();
    const sessionCookie = cookies.find((c) => c.name === 'oh_session');

    expect(sessionCookie).toBeDefined();
    expect(sessionCookie!.domain).toBe('localhost');
  });
});
