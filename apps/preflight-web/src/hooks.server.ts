import type { Handle } from '@sveltejs/kit';
import { jwtDecode } from 'jwt-decode';

export const handle: Handle = async ({ event, resolve }) => {
  const token = event.cookies.get('jwt');

  if (token) {
    try {
      // In a real app, you would VERIFY the token signature here.
      // For now, we just decode it to get user info
      const user = jwtDecode(token);
      event.locals.user = user;
    } catch (error) {
      // Invalid token
      event.locals.user = null;
    }
  } else {
    event.locals.user = null;
  }

  return resolve(event);
};