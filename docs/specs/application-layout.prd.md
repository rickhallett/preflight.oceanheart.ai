# PRD: Application Layout

**Date:** 2025-09-13

## 1. Executive Summary

This document outlines the requirements for a new application layout system. The layout will provide a consistent structure with a header, footer, navigation, and main content area. It will feature conditional navigation based on user authentication, a welcome/update landing page for infrequent users, and a user-configurable theme picker using the Skeleton UI library.

## 2. Problem Statement

The application currently lacks a unified and professional user interface structure. This leads to an inconsistent user experience and makes it difficult to introduce global features or branding. A standardized layout is needed to provide a stable foundation for future development, improve usability, and establish a clear visual identity.

## 3. Requirements

### User Requirements

- The application must have a clear and consistent layout with a header, footer, navigation bar, and a main content area.
- Navigation links shown to the user should differ based on their authentication status (logged in vs. logged out).
- A landing page should be displayed to first-time users or users who have not visited the site in the last 7 days. This page will present project information and release updates.
- Users must be able to change the application's color theme through a control in the footer.

### Technical Requirements

- **Framework**: The layout must be implemented using Svelte and the Skeleton UI component library.
- **Component Structure**: The layout will be composed of the following components:
    - `Header`: Top-level banner, may contain branding or user information.
    - `Footer`: Bottom-level bar, will contain the theme picker and other footer links.
    - `Navbar`: Side or top navigation panel containing links.
    - `MainLayout`: The primary container that orchestrates the header, footer, navbar, and the main content slot.
- **Landing Page Logic**:
    - On application load, check `localStorage` for a `last-check-in` value (ISO date string).
    - If `last-check-in` is `null` or its date is more than 7 days in the past, display a `LandingPage` component.
    - Otherwise, display the `MainLayout`.
    - After a user sees the `LandingPage` and proceeds to the main app, the `last-check-in` value in `localStorage` should be updated to the current date.
- **Authentication**:
    - An authentication status will be determined by a JWT.
    - A stubbed interface/service must be created to simulate checking the validity of a JWT and returning the user's authentication state (e.g., `isAuthenticated: true | false`).
    - Navigation links within the `Navbar` will be rendered conditionally based on this authentication state.
- **Theme Picker**:
    - The footer will contain a "stylish but covert" UI element to trigger a theme picker.
    - This picker will allow users to select from a list of pre-configured Skeleton UI color themes.
    - The selected theme should be applied globally and persist across the application.

### Design Requirements

- The overall design should be modern, clean, and responsive, leveraging the components and styles provided by Skeleton UI.
- The theme picker in the footer should be discreet, not drawing significant attention but remaining easily accessible. An icon or a small, subtle button could be used.

## 4. Implementation Phases

### Phase 1: Basic Layout and Skeleton Integration

- Set up Skeleton UI within the SvelteKit project.
- Create the basic layout components: `Header.svelte`, `Footer.svelte`, `Navbar.svelte`, and `MainLayout.svelte`.
- Structure the main `+layout.svelte` to use the `MainLayout` component, establishing the primary visual structure of the app.

### Phase 2: Landing Page

- Create the `LandingPage.svelte` component with placeholder content for project description and release notes.
- Implement the `localStorage` logic in the root `+layout.svelte` or a dedicated script to conditionally show the `LandingPage` or the `MainLayout`.

### Phase 3: Authentication and Conditional Navigation

- Create a stubbed authentication service (e.g., `src/lib/auth.ts`) that provides a readable store indicating the user's authentication status.
- Populate the `Navbar.svelte` component with two sets of navigation links.
- Use the authentication store to conditionally render the appropriate set of links.

### Phase 4: Theme Picker

- Identify a suitable "covert" UI pattern for the theme picker in the footer (e.g., a small palette icon).
- Implement the theme picker using Skeleton's theme utilities.
- Provide a list of selectable themes (e.g., 'skeleton', 'modern', 'vintage', 'seafoam').
- Ensure the selected theme is applied and persists for the user session.

## 5. Implementation Notes

### Layout Structure (`+layout.svelte`)

'''svelte
<script lang="ts">
    import { onMount } from 'svelte';
    import MainLayout from '$lib/components/MainLayout.svelte';
    import LandingPage from '$lib/components/LandingPage.svelte';

    let showLanding = true;

    onMount(() => {
        const lastCheckIn = localStorage.getItem('last-check-in');
        if (lastCheckIn) {
            const lastCheckInDate = new Date(lastCheckIn);
            const now = new Date();
            const sevenDays = 7 * 24 * 60 * 60 * 1000;
            if (now.getTime() - lastCheckInDate.getTime() < sevenDays) {
                showLanding = false;
            }
        }
    });

    function handleProceed() {
        localStorage.setItem('last-check-in', new Date().toISOString());
        showLanding = false;
    }
</script>

{#if showLanding}
    <LandingPage on:proceed={handleProceed} />
{:else}
    <MainLayout />
{/if}
'''

### Stubbed Authentication Service (`src/lib/auth.ts`)

'''typescript
import { readable } from 'svelte/store';

// Stubbed authentication. In a real app, this would involve
// decoding a JWT from localStorage or a cookie.
export const authState = readable({ isAuthenticated: false }, (set) => {
    // Simulate checking for a token
    const token = typeof window !== 'undefined' ? localStorage.getItem('jwt') : null;
    if (token) {
        // In a real app, you'd verify the token. Here we just assume it's valid.
        set({ isAuthenticated: true });
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
'''

### Theme Picker (in `Footer.svelte`)

'''svelte
<script lang="ts">
    import { getDrawerStore } from '@skeletonlabs/skeleton';
    import type { DrawerSettings } from '@skeletonlabs/skeleton';

    const drawerStore = getDrawerStore();

    function openThemeDrawer() {
        const drawerSettings: DrawerSettings = {
            id: 'theme-drawer',
            position: 'bottom',
            // You would create a ThemePicker.svelte component
            // to be loaded here via a component registry or dynamic import.
        };
        drawerStore.open(drawerSettings);
    }
</script>

<footer>
    <div class="p-4 text-center">
        <p>&copy; 2025 OceanHeart AI</p>
        <button class="btn btn-sm variant-ghost-surface" on:click={openThemeDrawer}>
            🎨
        </button>
    </div>
</footer>
'''

## 6. Security Considerations

- **JWT Handling**: The stubbed authentication service must be replaced with a robust implementation that securely validates JWTs. Sensitive information should not be stored in the JWT payload.
- **localStorage**: `localStorage` is vulnerable to XSS attacks. The JWT should be stored in a secure, HTTP-only cookie where possible. For the purpose of this PRD, `localStorage` is acceptable for the stub, but this must be addressed in a production implementation.

## 7. Success Metrics

- A fully responsive and visually consistent layout is implemented across the application.
- The landing page is correctly displayed to new and infrequent users.
- Authenticated and unauthenticated navigation states work as expected.
- The theme picker is functional and correctly applies different Skeleton UI themes.

## 8. Future Enhancements

- Persist user theme preferences to a backend database.
- Fetch landing page content (e.g., release notes) from a CMS or API.
- Implement role-based navigation for different user types (e.g., admin, user).
