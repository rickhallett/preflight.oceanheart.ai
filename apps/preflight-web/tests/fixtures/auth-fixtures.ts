/**
 * Authentication test fixtures and helpers
 */
import type { BrowserContext, Page } from '@playwright/test';

export interface TestCredentials {
  email: string;
  password: string;
}

export interface AuthConfig {
  mode: 'stub' | 'mock';
  passportUrl: string;
}

export const AUTH_CONFIGS: Record<string, AuthConfig> = {
  ci: { mode: 'mock', passportUrl: 'http://localhost:3001' },
  local: { mode: 'stub', passportUrl: '' },
};

// Stub user for testing
export const STUB_USER = {
  id: 'stub-user-123',
  email: 'john.doe@example.com',
  name: 'John Doe',
};

// Create a valid stub JWT token
export function createStubToken(expiresInMs: number = 3600000): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      userId: STUB_USER.id,
      email: STUB_USER.email,
      exp: Math.floor((Date.now() + expiresInMs) / 1000),
      iat: Math.floor(Date.now() / 1000),
    })
  );
  const signature = btoa('stub-signature');
  return `${header}.${payload}.${signature}`;
}

// Create an expired stub token
export function createExpiredStubToken(): string {
  return createStubToken(-3600000); // Expired 1 hour ago
}

// Create a near-expiry token (expires in 5 minutes)
export function createNearExpiryToken(): string {
  return createStubToken(5 * 60 * 1000);
}

/**
 * Authentication test helper class
 */
export class AuthTestHelper {
  private config: AuthConfig;

  constructor(config: AuthConfig = AUTH_CONFIGS.local) {
    this.config = config;
  }

  /**
   * Set up stub authentication (localStorage + cookie)
   */
  async setupStubAuth(context: BrowserContext, page: Page): Promise<void> {
    const token = createStubToken();

    // Set cookie for middleware
    await context.addCookies([
      {
        name: 'oh_session',
        value: token,
        domain: 'localhost',
        path: '/',
        httpOnly: false,
        secure: false,
        sameSite: 'Lax',
      },
    ]);

    // Set localStorage for client-side auth
    await page.addInitScript((user) => {
      localStorage.setItem('preflight_auth', JSON.stringify({
        isAuthenticated: true,
        user: user,
      }));
    }, STUB_USER);
  }

  /**
   * Set up mock Passport authentication (for MSW-mocked OAuth flow)
   */
  async setupMockPassportAuth(
    context: BrowserContext,
    page: Page,
    token?: string
  ): Promise<void> {
    const authToken = token || createStubToken();

    await context.addCookies([
      {
        name: 'oh_session',
        value: authToken,
        domain: 'localhost',
        path: '/',
        httpOnly: false,
        secure: false,
        sameSite: 'Lax',
      },
    ]);
  }

  /**
   * Clear all authentication state
   */
  async clearAuth(context: BrowserContext, page: Page): Promise<void> {
    // Clear cookies
    await context.clearCookies();

    // Clear localStorage
    await page.evaluate(() => {
      localStorage.removeItem('preflight_auth');
    });
  }

  /**
   * Set up an expired session for testing session expiry
   */
  async setupExpiredAuth(context: BrowserContext, page: Page): Promise<void> {
    const expiredToken = createExpiredStubToken();

    await context.addCookies([
      {
        name: 'oh_session',
        value: expiredToken,
        domain: 'localhost',
        path: '/',
        httpOnly: false,
        secure: false,
        sameSite: 'Lax',
      },
    ]);
  }

  /**
   * Set up a near-expiry session for testing token refresh
   */
  async setupNearExpiryAuth(context: BrowserContext, page: Page): Promise<void> {
    const nearExpiryToken = createNearExpiryToken();

    await context.addCookies([
      {
        name: 'oh_session',
        value: nearExpiryToken,
        domain: 'localhost',
        path: '/',
        httpOnly: false,
        secure: false,
        sameSite: 'Lax',
      },
    ]);

    await page.addInitScript((user) => {
      localStorage.setItem('preflight_auth', JSON.stringify({
        isAuthenticated: true,
        user: user,
      }));
    }, STUB_USER);
  }

  /**
   * Validate that token is not expired
   */
  async validateTokenExpiry(page: Page): Promise<boolean> {
    return page.evaluate(() => {
      const cookies = document.cookie.split(';');
      const sessionCookie = cookies.find((c) => c.trim().startsWith('oh_session='));
      if (!sessionCookie) return false;

      const token = sessionCookie.split('=')[1];
      const parts = token.split('.');
      if (parts.length !== 3) return false;

      try {
        const payload = JSON.parse(atob(parts[1]));
        return Date.now() < payload.exp * 1000;
      } catch {
        return false;
      }
    });
  }

  /**
   * Get current auth state from page
   */
  async getAuthState(page: Page): Promise<{ isAuthenticated: boolean; user: typeof STUB_USER | null }> {
    return page.evaluate(() => {
      const stored = localStorage.getItem('preflight_auth');
      if (!stored) return { isAuthenticated: false, user: null };
      try {
        return JSON.parse(stored);
      } catch {
        return { isAuthenticated: false, user: null };
      }
    });
  }
}

export const authHelper = new AuthTestHelper();
