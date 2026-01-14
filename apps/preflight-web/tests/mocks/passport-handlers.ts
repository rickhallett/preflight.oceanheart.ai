/**
 * MSW handlers for Passport OAuth API mocking
 */
import { http, HttpResponse } from 'msw';
import { createStubToken, STUB_USER } from '../fixtures/auth-fixtures';

const PASSPORT_BASE = 'http://passport.lvh.me:8004';

// Track issued tokens for validation
const issuedTokens = new Set<string>();

/**
 * Mock JWT token generation
 */
function generateMockToken(email: string): string {
  const token = createStubToken();
  issuedTokens.add(token);
  return token;
}

/**
 * Validate a mock token
 */
function validateMockToken(token: string): { valid: boolean; user?: typeof STUB_USER } {
  // Check if it's a stub token (has stub-signature)
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return { valid: false };

    const signature = atob(parts[2]);
    if (signature === 'stub-signature') {
      const payload = JSON.parse(atob(parts[1]));

      // Check expiration
      if (Date.now() > payload.exp * 1000) {
        return { valid: false };
      }

      return {
        valid: true,
        user: {
          id: payload.userId,
          email: payload.email,
          name: 'John Doe',
        },
      };
    }
    return { valid: false };
  } catch {
    return { valid: false };
  }
}

export const passportHandlers = [
  /**
   * POST /api/auth/signin - Sign in with email/password
   */
  http.post(`${PASSPORT_BASE}/api/auth/signin`, async ({ request }) => {
    const body = await request.json() as { email: string; password: string };

    // Accept any valid email format for testing
    if (!body.email || !body.email.includes('@')) {
      return HttpResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Generate mock token
    const token = generateMockToken(body.email);

    return HttpResponse.json({
      success: true,
      token,
      user: {
        userId: STUB_USER.id,
        email: body.email,
        name: STUB_USER.name,
      },
    });
  }),

  /**
   * POST /api/auth/verify - Verify token validity
   */
  http.post(`${PASSPORT_BASE}/api/auth/verify`, async ({ request }) => {
    const body = await request.json() as { token: string };

    if (!body.token) {
      return HttpResponse.json(
        { valid: false, error: 'Token required' },
        { status: 400 }
      );
    }

    const result = validateMockToken(body.token);

    if (!result.valid) {
      return HttpResponse.json({ valid: false, error: 'Invalid or expired token' });
    }

    return HttpResponse.json({
      valid: true,
      user: result.user,
    });
  }),

  /**
   * POST /api/auth/refresh - Refresh token
   */
  http.post(`${PASSPORT_BASE}/api/auth/refresh`, async ({ request }) => {
    const body = await request.json() as { token: string };

    if (!body.token) {
      return HttpResponse.json(
        { success: false, error: 'Token required' },
        { status: 400 }
      );
    }

    const result = validateMockToken(body.token);

    if (!result.valid) {
      return HttpResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Generate new token
    const newToken = generateMockToken(result.user!.email);

    return HttpResponse.json({
      success: true,
      token: newToken,
    });
  }),

  /**
   * POST /api/auth/signout - Sign out
   */
  http.post(`${PASSPORT_BASE}/api/auth/signout`, async ({ request }) => {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { success: false, error: 'Authorization required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    issuedTokens.delete(token);

    return HttpResponse.json({ success: true });
  }),

  /**
   * GET /auth - OAuth redirect endpoint (simulates redirect back with token)
   */
  http.get(`${PASSPORT_BASE}/auth`, ({ request }) => {
    const url = new URL(request.url);
    const returnTo = url.searchParams.get('returnTo');

    if (!returnTo) {
      return HttpResponse.json(
        { error: 'returnTo parameter required' },
        { status: 400 }
      );
    }

    // In mock mode, simulate successful OAuth by redirecting with token
    const token = generateMockToken(STUB_USER.email);
    const redirectUrl = new URL(returnTo);
    redirectUrl.searchParams.set('token', token);

    return HttpResponse.redirect(redirectUrl.toString(), 302);
  }),
];

/**
 * Handlers for error scenarios
 */
export const passportErrorHandlers = {
  /**
   * Simulate authentication failure
   */
  authFailed: http.post(`${PASSPORT_BASE}/api/auth/signin`, () => {
    return HttpResponse.json(
      { success: false, error: 'Invalid credentials' },
      { status: 401 }
    );
  }),

  /**
   * Simulate server error
   */
  serverError: http.post(`${PASSPORT_BASE}/api/auth/signin`, () => {
    return HttpResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }),

  /**
   * Simulate rate limit
   */
  rateLimited: http.post(`${PASSPORT_BASE}/api/auth/signin`, () => {
    return HttpResponse.json(
      { error: 'Too many requests' },
      {
        status: 429,
        headers: { 'Retry-After': '60' },
      }
    );
  }),

  /**
   * Simulate OAuth callback with error
   */
  oauthError: http.get(`${PASSPORT_BASE}/auth`, ({ request }) => {
    const url = new URL(request.url);
    const returnTo = url.searchParams.get('returnTo');

    if (!returnTo) {
      return HttpResponse.json({ error: 'returnTo required' }, { status: 400 });
    }

    const redirectUrl = new URL(returnTo);
    redirectUrl.searchParams.set('error', 'access_denied');
    redirectUrl.searchParams.set('error_description', 'User denied access');

    return HttpResponse.redirect(redirectUrl.toString(), 302);
  }),
};
