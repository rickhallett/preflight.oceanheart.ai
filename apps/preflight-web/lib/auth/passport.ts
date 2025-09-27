/**
 * Passport authentication service for JWT verification and user management
 * Supports both stub tokens (for testing) and real Passport JWTs
 */

export interface PassportUser {
  userId: string;
  email: string;
  role?: string;
}

export interface AuthResponse {
  valid: boolean;
  user?: PassportUser;
  error?: string;
  message?: string;
}

export interface RefreshResponse {
  success: boolean;
  token?: string;
  user?: PassportUser;
  error?: string;
}

/**
 * Check if a token is a stub token (for testing)
 */
export function isStubToken(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    const signature = atob(parts[2]);
    return signature === 'stub-signature';
  } catch {
    return false;
  }
}

/**
 * Get the Passport API URL based on environment
 */
function getPassportUrl(): string {
  if (typeof window !== 'undefined') {
    // Client-side
    const isDev = window.location.hostname === 'localhost' || window.location.hostname.includes('lvh.me');
    return isDev ? 'http://passport.lvh.me:8004' : 'https://passport.oceanheart.ai';
  } else {
    // Server-side
    const isDev = process.env.NODE_ENV === 'development';
    return isDev ? 'http://passport.lvh.me:8004' : 'https://passport.oceanheart.ai';
  }
}

/**
 * Verify a JWT token with Passport
 */
export async function verifyToken(token: string): Promise<AuthResponse> {
  // Check if it's a stub token first
  if (isStubToken(token)) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000;
      
      if (Date.now() > exp) {
        return { valid: false, error: 'Token expired' };
      }
      
      return {
        valid: true,
        user: {
          userId: payload.userId,
          email: payload.email,
          role: 'user'
        }
      };
    } catch {
      return { valid: false, error: 'Invalid stub token' };
    }
  }
  
  // Verify real token with Passport API
  try {
    const response = await fetch(`${getPassportUrl()}/api/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
      credentials: 'include'
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to verify token with Passport:', error);
    return {
      valid: false,
      error: 'Failed to verify token',
      message: 'Could not connect to authentication service'
    };
  }
}

/**
 * Refresh a JWT token
 */
export async function refreshToken(token: string): Promise<RefreshResponse> {
  // Don't refresh stub tokens
  if (isStubToken(token)) {
    return { success: true, token: token };
  }
  
  try {
    const response = await fetch(`${getPassportUrl()}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
      credentials: 'include'
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    return {
      success: false,
      error: 'Failed to refresh token'
    };
  }
}

/**
 * Sign in with email and password
 */
export async function signInWithPassport(email: string, password: string): Promise<RefreshResponse> {
  try {
    const response = await fetch(`${getPassportUrl()}/api/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include'
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to sign in:', error);
    return {
      success: false,
      error: 'Failed to sign in'
    };
  }
}

/**
 * Sign out from Passport
 */
export async function signOutFromPassport(token: string): Promise<{ success: boolean }> {
  // Don't call API for stub tokens
  if (isStubToken(token)) {
    return { success: true };
  }
  
  try {
    const response = await fetch(`${getPassportUrl()}/api/auth/signout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to sign out:', error);
    return { success: false };
  }
}

/**
 * Extract token from cookies (client-side)
 */
export function getTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'oh_session') {
      return value;
    }
  }
  return null;
}

/**
 * Set token in cookie (client-side)
 */
export function setTokenInCookie(token: string): void {
  if (typeof document === 'undefined') return;
  
  const isDev = window.location.hostname === 'localhost' || window.location.hostname.includes('lvh.me');
  const domain = isDev ? '.lvh.me' : '.oceanheart.ai';
  
  // Set cookie for 7 days (matching Passport)
  const expires = new Date();
  expires.setDate(expires.getDate() + 7);
  
  document.cookie = `oh_session=${token}; path=/; expires=${expires.toUTCString()}; domain=${domain}; SameSite=Lax`;
}