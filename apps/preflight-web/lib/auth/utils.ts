/**
 * Authentication utilities for Oceanheart Passport integration
 */

export interface AuthConfig {
  authUrl: string;
  domain: string;
  protocol: string;
  jwtSecret: string;
  subdomainName: string;
}

export interface User {
  id: string;
  email: string;
}

/**
 * Get authentication configuration based on environment
 */
export function getAuthConfig(): AuthConfig {
  const isDev = process.env.NODE_ENV === "development";
  
  return {
    authUrl: isDev ? "http://oceanheart.lvh.me:3000" : "https://www.oceanheart.ai",
    domain: isDev ? ".lvh.me" : ".oceanheart.ai",
    protocol: isDev ? "http" : "https",
    jwtSecret: process.env.JWT_SECRET || "",
    subdomainName: process.env.SUBDOMAIN_NAME || "preflight",
  };
}

/**
 * Build authentication redirect URL
 */
export function getAuthUrl(returnPath: string): string {
  const isDev = process.env.NODE_ENV === "development";
  const baseUrl = isDev 
    ? "http://localhost:3000" 
    : "https://watson.oceanheart.ai";
  const returnTo = `${baseUrl}${returnPath}`;
  
  return `https://passport.oceanheart.ai/auth?returnTo=${encodeURIComponent(returnTo)}`;
}

/**
 * Build sign out URL
 */
export function getSignOutUrl(): string {
  const config = getAuthConfig();
  return `${config.authUrl}/api/auth/signout`;
}

/**
 * Verify JWT token (client-side check only)
 * Note: Actual verification should happen server-side
 */
export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // Convert to milliseconds
    return Date.now() > exp;
  } catch {
    return true;
  }
}

/**
 * Extract user from JWT token (client-side only)
 * Note: This does not verify the token signature
 */
export function getUserFromToken(token: string): User | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: payload.userId || payload.sub,
      email: payload.email,
    };
  } catch {
    return null;
  }
}

/**
 * Get cookie value by name
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  
  return null;
}

/**
 * Clear authentication cookie
 */
export function clearAuthCookie(): void {
  if (typeof document === 'undefined') return;
  
  // Clear for all possible domains
  const domains = [
    "",
    ".localhost",
    ".lvh.me",
    ".oceanheart.ai",
    ".watson.oceanheart.ai",
  ];
  
  domains.forEach(domain => {
    document.cookie = `oh_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain};`;
  });
}