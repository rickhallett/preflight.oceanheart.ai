# PRD: External Authentication Login Page

**Date:** 2025-09-13

## 1. Executive Summary

This document specifies the requirements for a login page that integrates with an external OpenID Connect (OIDC) / OAuth 2.0 provider, `passport.oceanheart.ai`, for JWT-based authentication. This feature will replace the stubbed authentication mechanism defined in the `application-layout.prd.md` with a production-ready solution.

## 2. Problem Statement

The application currently relies on a non-functional, stubbed authentication service that uses `localStorage`, which is insecure and for demonstration purposes only. To properly secure the application and manage user sessions, a real authentication flow is needed. This involves redirecting users to a trusted identity provider and handling the JWT returned upon successful login.

## 3. Requirements

### User Requirements

- Users needing to authenticate will be directed to a dedicated `/login` page.
- The login page must clearly inform the user that they will be redirected to `passport.oceanheart.ai` for authentication.
- The user must explicitly consent to the redirection by clicking a button (e.g., "Proceed to Login").
- After authenticating successfully at `passport.oceanheart.ai`, the user should be automatically redirected back to the application.
- The application should recognize the user as logged in after the redirect.

### Technical Requirements

- **Login Route**: A new page must be created at the `/login` route.
- **User Consent**: The `/login` page will display a message and a button. It will not automatically redirect.
- **Redirect Mechanism**:
    - Clicking the login button will trigger a client-side redirect to `https://passport.oceanheart.ai/auth`.
    - The redirect URL must include a `redirect_uri` query parameter that points to a callback endpoint within our application (e.g., `https://<our-app-domain>/auth/callback`).
- **Callback Endpoint**:
    - A server-side endpoint must be created at `/auth/callback` to handle the return from the identity provider.
    - This endpoint will be responsible for extracting the JWT from the request (e.g., from a URL query parameter).
    - The extracted JWT must be set in a secure, `HttpOnly`, `SameSite=Strict` cookie.
    - After setting the cookie, the endpoint should redirect the user to the homepage or their intended destination.
- **Auth Service Refactor**:
    - The existing authentication service (`src/lib/auth.ts`) must be refactored.
    - The client-side `authState` store should be removed or adapted.
    - Authentication state should be determined on the server-side by reading the JWT from the cookie in a SvelteKit `hooks.server.ts` file. The user's authentication status and data can be passed to the client via `event.locals`.
- **Logout**: A logout mechanism must be implemented that clears the authentication cookie.

### Design Requirements

- The `/login` page should be clean, simple, and consistent with the Skeleton UI theme.
- The message on the page should be unambiguous, building trust with the user regarding the redirect.

## 4. Implementation Phases

### Phase 1: Login Page and Redirect

- Create the Svelte component for the `/routes/login/+page.svelte`.
- Add the informational text and a button styled with Skeleton UI.
- Implement the `on:click` handler for the button to perform a `window.location.href` change to the external authentication provider, including the `redirect_uri`.

### Phase 2: Authentication Callback Endpoint

- Create a SvelteKit server endpoint at `/src/routes/auth/callback/+server.ts`.
- Implement the `GET` handler to read the JWT from the incoming request's URL.
- Use the `cookies.set()` API to store the JWT in a secure `HttpOnly` cookie.
- Redirect the user back to the application's home page (`/`).

### Phase 3: Server-Side Auth Hook

- Create a `src/hooks.server.ts` file.
- Implement the `handle` hook to read the JWT from the request's cookies on every server-side request.
- If the token exists, validate it (or for now, decode it) and attach the user's information and authentication status to the `event.locals` object.
- This makes the user's auth state available to all server-side load functions and endpoints.

### Phase 4: Refactor Application Code

- Update the root `+layout.server.ts` to read the authentication state from `event.locals` and pass it to the page data.
- Refactor the `Navbar.svelte` component to use the page data store (`$page.data.user`) to conditionally render navigation links, removing the dependency on the old client-side `auth.ts` store.
- Create a `/logout` endpoint that clears the auth cookie and redirects to the homepage.

## 5. Implementation Notes

### Login Page (`/routes/login/+page.svelte`)

'''svelte
<script lang="ts">
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';

    function redirectToLogin() {
        const redirectUri = `${window.location.origin}/auth/callback`;
        const authUrl = `https://passport.oceanheart.ai/auth?redirect_uri=${encodeURIComponent(redirectUri)}`;
        window.location.href = authUrl;
    }
</script>

<div class="container h-full mx-auto flex justify-center items-center">
    <div class="card p-8 text-center">
        <h2 class="h2 mb-4">Authentication Required</h2>
        <p class="mb-6">To continue, you will be redirected to our secure identity provider, OceanHeart Passport, to log in.</p>
        <button class="btn variant-filled-primary" on:click={redirectToLogin}>
            Proceed to Login
        </button>
    </div>
</div>
'''

### Callback Endpoint (`/routes/auth/callback/+server.ts`)

'''typescript
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, cookies }) => {
    const token = url.searchParams.get('token');

    if (token) {
        cookies.set('jwt', token, {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 7 // 1 week
        });
    }

    throw redirect(303, '/');
};
'''

### Server Hook (`/src/hooks.server.ts`)

'''typescript
import type { Handle } from '@sveltejs/kit';
import { jwtDecode } from 'jwt-decode'; // Using a library to decode

export const handle: Handle = async ({ event, resolve }) => {
    const token = event.cookies.get('jwt');

    if (token) {
        try {
            // In a real app, you would VERIFY the token signature here.
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
'''

## 6. Security Considerations

- **CSRF Protection**: While `SameSite=Strict` cookies provide good protection, consider adding state-based CSRF tokens to the OAuth flow for enhanced security.
- **JWT Validation**: The server hook **must** be updated to cryptographically verify the JWT signature using the public key from `passport.oceanheart.ai`. Decoding without verification is insecure.
- **Open Redirect**: The callback endpoint should ideally validate the origin of the request or use a fixed, non-configurable redirect target after login to prevent misuse.
- **Cookie Security**: The `secure` flag for the cookie must be correctly tied to the production environment to ensure it's only sent over HTTPS.

## 7. Success Metrics

- Users are successfully redirected to and from the external login page.
- The `jwt` cookie is correctly set after authentication.
- The application UI correctly reflects the user's authenticated state based on the server-side session.
- The logout function successfully clears the user's session.

## 8. Future Enhancements

- Implement a token refresh flow to maintain the user's session without requiring a full re-login.
- Create a global `[error].svelte` page to handle authentication errors gracefully.
- Implement a full logout flow that invalidates the session on the `passport.oceanheart.ai` provider as well.
