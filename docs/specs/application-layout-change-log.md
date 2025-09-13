# Change Log: Application Layout & Login Page
## Date: 2025-09-13

## Files Modified

### apps/preflight-web/package.json
- **Change**: Add Skeleton UI and JWT dependencies
- **Rationale**: Required for UI components, theming, and JWT token handling
- **Impact**: Enables Skeleton UI components and secure authentication
- **Commit**: 31317fb

### apps/preflight-web/src/app.css
- **Change**: Add Skeleton UI imports and remove custom body styles
- **Rationale**: Import Skeleton UI core styles and Wintry theme
- **Impact**: Enables Skeleton UI styling throughout application
- **Commit**: 31317fb

### apps/preflight-web/src/app.html
- **Change**: Add data-theme="wintry" attribute to body
- **Rationale**: Enable Skeleton UI theme system
- **Impact**: Applies Wintry theme as default, allows theme switching
- **Commit**: 31317fb

### apps/preflight-web/src/app.d.ts
- **Change**: Add Locals interface with user property
- **Rationale**: Type definition for server-side user data in event.locals
- **Impact**: Provides type safety for authentication data
- **Commit**: 31b1952

### apps/preflight-web/src/routes/+layout.svelte
- **Change**: Complete rewrite to use new layout system and landing page
- **Rationale**: Implement PRD requirements for landing page and layout components
- **Impact**: Replaces simple nav/main with full layout system
- **Commit**: 0f48d3f, 31b1952

## New Files Created

### Layout Components
- **src/lib/components/Header.svelte**: Application header with OceanHeart branding
- **src/lib/components/Footer.svelte**: Footer with theme picker dropdown
- **src/lib/components/Navbar.svelte**: Conditional navigation based on auth state
- **src/lib/components/MainLayout.svelte**: Main layout orchestrator component
- **src/lib/components/LandingPage.svelte**: Welcome page for new/returning users

### Authentication System
- **src/lib/auth.ts**: Stubbed authentication service (legacy, replaced by server-side)
- **src/routes/login/+page.svelte**: Login page with external OAuth redirect
- **src/routes/auth/callback/+server.ts**: OAuth callback handler for JWT processing
- **src/routes/logout/+server.ts**: Logout endpoint to clear authentication cookies
- **src/hooks.server.ts**: Server-side JWT validation hook
- **src/routes/+layout.server.ts**: Server load function to provide user data

### Configuration
- **tailwind.config.js**: Tailwind CSS configuration for Skeleton UI integration

## Dependencies Added/Removed
- Added: @skeletonlabs/skeleton@3.2.0 - Modern UI component library
- Added: jwt-decode@4.0.0 - JWT token decoding utility

## Breaking Changes
- **Authentication system**: Replaced localStorage-based stub with secure OAuth flow
  - Migration required: Users will need to authenticate via passport.oceanheart.ai
  - Impact: Secure, production-ready authentication with HttpOnly cookies
- **Layout structure**: Complete redesign from simple nav to component-based layout
  - Migration required: None for existing pages, they now use MainLayout wrapper
  - Impact: Consistent UI structure, theme support, conditional navigation
- **Svelte 5 compatibility**: Updated all components to use runes mode syntax
  - Migration required: Development workflow unchanged
  - Impact: Future-proof codebase with modern Svelte patterns

## Security Enhancements
- JWT tokens stored in HttpOnly, SameSite=Strict cookies
- Server-side token validation on every request
- Secure cookie configuration for production environments
- CSRF protection via SameSite cookie attribute