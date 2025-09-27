/**
 * Token refresh management for automatic JWT renewal
 * Refreshes tokens every 15 minutes for Passport auth
 */

import { refreshToken, getTokenFromCookie, setTokenInCookie, isStubToken } from './passport';

let refreshInterval: NodeJS.Timeout | null = null;

/**
 * Start automatic token refresh
 * Refreshes the token every 15 minutes
 */
export function startTokenRefresh(): void {
  // Clear any existing interval
  stopTokenRefresh();
  
  // Set up refresh every 15 minutes
  refreshInterval = setInterval(async () => {
    await performTokenRefresh();
  }, 15 * 60 * 1000); // 15 minutes
  
  // Also refresh immediately if the token is older than 15 minutes
  checkAndRefreshIfNeeded();
}

/**
 * Stop automatic token refresh
 */
export function stopTokenRefresh(): void {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
}

/**
 * Perform a single token refresh
 */
export async function performTokenRefresh(): Promise<boolean> {
  const token = getTokenFromCookie();
  
  if (!token) {
    console.log('No token found for refresh');
    return false;
  }
  
  // Don't refresh stub tokens
  if (isStubToken(token)) {
    console.log('Skipping refresh for stub token');
    return true;
  }
  
  try {
    const response = await refreshToken(token);
    
    if (response.success && response.token) {
      // Update the cookie with the new token
      setTokenInCookie(response.token);
      console.log('Token refreshed successfully');
      return true;
    } else {
      console.error('Failed to refresh token:', response.error);
      // If refresh fails, user might need to re-login
      if (response.error === 'Unauthorized' || response.error === 'Invalid or expired token') {
        // Clear the invalid token and redirect to login
        document.cookie = 'oh_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
        window.location.href = '/login?error=session_expired';
      }
      return false;
    }
  } catch (error) {
    console.error('Error refreshing token:', error);
    return false;
  }
}

/**
 * Check token age and refresh if needed
 */
async function checkAndRefreshIfNeeded(): Promise<void> {
  const token = getTokenFromCookie();
  
  if (!token || isStubToken(token)) {
    return;
  }
  
  try {
    // Decode the token to check its issued time
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      const iat = payload.iat * 1000; // Convert to milliseconds
      const now = Date.now();
      const age = now - iat;
      
      // If token is older than 15 minutes, refresh it
      if (age > 15 * 60 * 1000) {
        console.log('Token is older than 15 minutes, refreshing...');
        await performTokenRefresh();
      }
    }
  } catch (error) {
    console.error('Error checking token age:', error);
  }
}

/**
 * Hook to use in React components
 */
export function useTokenRefresh(): {
  startRefresh: () => void;
  stopRefresh: () => void;
  refreshNow: () => Promise<boolean>;
} {
  return {
    startRefresh: startTokenRefresh,
    stopRefresh: stopTokenRefresh,
    refreshNow: performTokenRefresh
  };
}