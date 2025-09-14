import { readable } from 'svelte/store';

export interface AuthState {
  isAuthenticated: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

// Stubbed authentication. In a real app, this would involve
// decoding a JWT from localStorage or a cookie.
export const authState = readable<AuthState>({ isAuthenticated: false }, (set) => {
  // Simulate checking for a token
  const token = typeof window !== 'undefined' ? localStorage.getItem('jwt') : null;
  if (token) {
    // In a real app, you'd verify the token. Here we just assume it's valid.
    set({ 
      isAuthenticated: true,
      user: {
        id: '1',
        name: 'Test User',
        email: 'test@example.com'
      }
    });
  }
  return () => {};
});

// Helper functions to simulate login/logout for testing
export const login = () => {
  localStorage.setItem('jwt', 'fake-jwt-token');
  window.location.reload(); // Reload to update auth state
};

export const logout = () => {
  localStorage.removeItem('jwt');
  window.location.reload(); // Reload to update auth state
};