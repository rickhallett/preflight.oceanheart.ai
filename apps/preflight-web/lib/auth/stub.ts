/**
 * Temporary auth stub using localStorage for testing
 * TODO: Replace with actual Oceanheart Passport integration
 */

const AUTH_KEY = "preflight_auth_stub";
const USER_KEY = "preflight_user_stub";

export interface StubUser {
  id: string;
  email: string;
  name: string;
}

/**
 * Check if user is authenticated (client-side only)
 */
export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(AUTH_KEY) === "true";
}

/**
 * Sign in user (stub)
 */
export function signIn(email: string = "john.doe@example.com"): void {
  if (typeof window === "undefined") return;
  
  localStorage.setItem(AUTH_KEY, "true");
  localStorage.setItem(USER_KEY, JSON.stringify({
    id: "stub-user-123",
    email: email,
    name: "John Doe"
  }));
}

/**
 * Sign out user (stub)
 */
export function signOut(): void {
  if (typeof window === "undefined") return;
  
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(USER_KEY);
}

/**
 * Get current user (stub)
 */
export function getCurrentUser(): StubUser | null {
  if (typeof window === "undefined") return null;
  
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

/**
 * Create a fake JWT token for testing
 */
export function createStubToken(): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(JSON.stringify({
    userId: "stub-user-123",
    email: "john.doe@example.com",
    exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
  }));
  const signature = btoa("stub-signature");
  
  return `${header}.${payload}.${signature}`;
}

/**
 * Set stub auth cookie for middleware
 * Uses secure cookie settings (SameSite=Strict, Secure in production)
 */
export function setStubCookie(): void {
  if (typeof document === "undefined") return;

  const token = createStubToken();
  const isSecure = window.location.protocol === 'https:';

  // Build cookie with security attributes
  // - SameSite=Strict prevents CSRF
  // - Secure flag for HTTPS contexts
  const securePart = isSecure ? 'Secure;' : '';

  document.cookie = `oh_session=${token}; path=/; max-age=3600; SameSite=Strict; ${securePart}`.trim();
}

/**
 * Clear stub auth cookie
 */
export function clearStubCookie(): void {
  if (typeof document === "undefined") return;

  document.cookie = "oh_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Strict;";
}