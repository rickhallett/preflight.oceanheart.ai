# Project Architecture

## Last Updated: 2025-09-13
## Version: 0.1.0

## 1. High-Level Overview

### 1.1 System Purpose
OceanHeart Preflight is an AI-powered web application for personal growth and performance optimization. It provides personalized coaching, interactive surveys, feedback collection, and progress tracking through a modern web interface.

### 1.2 Core Technologies
- **Framework**: SvelteKit 2.22.0 with Svelte 5.0.0 (runes mode)
- **Styling**: Tailwind CSS 4.1.13 + Skeleton Labs UI 3.2.0
- **Authentication**: External OAuth with passport.oceanheart.ai + JWT with HttpOnly cookies
- **Runtime**: Bun (preferred over Node.js per project guidelines)
- **Build**: Vite 7.0.4
- **Language**: TypeScript 5.0.0

### 1.3 Architecture Pattern
- **Pattern**: Component-based architecture with server-side rendering
- **Key Decisions**: 
  - Server-side JWT validation for security
  - External OAuth provider for authentication
  - Layout component system for consistent UI
  - Svelte 5 runes for modern reactive programming
- **Design Principles**: 
  - Security-first authentication
  - Component reusability
  - Progressive enhancement
  - Type safety with TypeScript

## 2. Medium-Level Architecture

### 2.1 Directory Structure
```
apps/preflight-web/
├── src/
│   ├── lib/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── MainLayout.svelte
│   │   │   ├── Header.svelte
│   │   │   ├── Footer.svelte
│   │   │   ├── Navbar.svelte
│   │   │   └── LandingPage.svelte
│   │   ├── api/           # API client utilities
│   │   ├── auth.ts        # Authentication utilities (legacy)
│   │   └── index.ts       # Library exports
│   ├── routes/            # SvelteKit file-based routing
│   │   ├── auth/
│   │   │   └── callback/  # OAuth callback handler
│   │   ├── coach/         # Coaching pages
│   │   ├── feedback/      # Feedback collection
│   │   ├── survey/        # Survey pages
│   │   ├── login/         # Login page
│   │   ├── logout/        # Logout handler
│   │   ├── +layout.svelte # Root layout
│   │   ├── +layout.server.ts # Server-side layout data
│   │   └── +page.svelte   # Home page
│   ├── hooks.server.ts    # Server-side request hooks
│   └── app.d.ts          # TypeScript declarations
├── static/               # Static assets
├── package.json         # Dependencies and scripts
├── svelte.config.js     # Svelte configuration
├── tailwind.config.js   # Tailwind configuration
├── tsconfig.json        # TypeScript configuration
└── vite.config.ts       # Vite build configuration
```

### 2.2 Component Hierarchy
- **Layout Components**:
  - `MainLayout.svelte`: Root layout orchestrator
  - `Header.svelte`: Application branding and user menu
  - `Navbar.svelte`: Primary navigation (user-aware)
  - `Footer.svelte`: Site footer
- **Page Components**:
  - `LandingPage.svelte`: Welcome screen for new/returning users
  - Route-based page components in `src/routes/`
- **Utility Components**: Skeleton UI components for consistent theming

### 2.3 Data Flow
- **Authentication Flow**:
  1. User redirects to passport.oceanheart.ai for OAuth
  2. Callback handler (`/auth/callback`) receives JWT token
  3. Token stored as HttpOnly cookie for security
  4. `hooks.server.ts` validates JWT on each request
  5. User data passed to layouts via `+layout.server.ts`
- **State Management**: Server-side state through SvelteKit's load functions
- **Client State**: Svelte 5 runes (`$state`, `$props`) for reactive components

### 2.4 Routing Strategy
- **File-based Routing**: SvelteKit's automatic route generation
- **Server Routes**: API endpoints using `+server.ts` files
- **Layout Inheritance**: Nested layouts with shared user context
- **Protected Routes**: Server-side authentication checks in load functions

## 3. Low-Level Implementation Details

### 3.1 Component Patterns

#### Svelte 5 Runes Mode
```svelte
<script lang="ts">
  // Props using runes syntax
  let { children, user } = $props();
  
  // Reactive state
  let count = $state(0);
</script>

<div>
  <!-- Render props pattern for layout -->
  {@render children?.()}
</div>
```

#### Layout Component Structure
```svelte
<!-- MainLayout.svelte -->
<div class="app min-h-screen flex flex-col">
  <Header />
  <Navbar {user} />
  <main class="flex-1 container mx-auto px-4 py-8">
    {@render children?.()}
  </main>
  <Footer />
</div>
```

### 3.2 Authentication Implementation

#### Server-side JWT Handling
```typescript
// hooks.server.ts
export const handle: Handle = async ({ event, resolve }) => {
  const token = event.cookies.get('jwt');
  if (token) {
    try {
      const user = jwtDecode(token);
      event.locals.user = user;
    } catch (error) {
      event.locals.user = null;
    }
  }
  return resolve(event);
};
```

#### OAuth Callback Handler
```typescript
// routes/auth/callback/+server.ts
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
```

### 3.3 Naming Conventions
- **Files**: PascalCase for components, kebab-case for pages
- **CSS**: Skeleton UI token system with Tailwind utilities
- **TypeScript**: camelCase for variables, PascalCase for types/interfaces

### 3.4 Key Components

#### MainLayout.svelte
- **Purpose**: Root layout orchestrator with header, nav, main, footer
- **Props**: `children` (render prop), `user` (authentication state)
- **Features**: Responsive flex layout, consistent spacing

#### LandingPage.svelte
- **Purpose**: Welcome screen for new users or returning users (7+ days)
- **Props**: `onproceed` callback function
- **Features**: Hero section, feature highlights, release notes, CTA

#### Authentication System
- **External OAuth**: passport.oceanheart.ai integration
- **Token Storage**: HttpOnly cookies for security
- **Validation**: Server-side JWT decoding and verification
- **State Management**: User context passed through layout hierarchy

### 3.5 Styling Architecture
- **Design System**: Skeleton Labs UI 3.2.0
- **Utility Framework**: Tailwind CSS 4.1.13
- **Token System**: Skeleton's semantic color tokens (primary-700-200-token)
- **Theme Support**: Built-in dark/light mode with theme picker
- **Responsive Design**: Container-based layouts with responsive breakpoints

### 3.6 Build Pipeline
- **Development**: `bun run dev` (Vite dev server with HMR)
- **Production**: `bun run build` (SvelteKit static generation)
- **Preview**: `bun run preview` (Preview production build)
- **Type Checking**: `bun run check` (Svelte + TypeScript validation)

## 4. External Integrations

### 4.1 Third-party Services
- **Authentication**: passport.oceanheart.ai (OAuth provider)
- **UI Framework**: Skeleton Labs (component library)

### 4.2 Dependencies
- **Core Framework**: `@sveltejs/kit@^2.22.0`, `svelte@^5.0.0`
- **UI/Styling**: `@skeletonlabs/skeleton@^3.2.0`, `tailwindcss@^4.1.13`
- **Authentication**: `jwt-decode@^4.0.0`
- **Build Tools**: `vite@^7.0.4`, `typescript@^5.0.0`

## 5. Performance Considerations

### 5.1 Optimization Strategies
- **Server-Side Rendering**: SvelteKit's SSR for faster initial page loads
- **Component Splitting**: Automatic code splitting via SvelteKit
- **Progressive Enhancement**: JavaScript-optional functionality
- **Efficient Bundling**: Vite's optimized build process

### 5.2 Bundle Size
- **Minimal Runtime**: Svelte's compile-time optimizations
- **Tree Shaking**: Unused code elimination
- **Lazy Loading**: Route-based code splitting

## 6. Security Considerations

### 6.1 Authentication Security
- **HttpOnly Cookies**: Prevents XSS access to JWT tokens
- **Secure Flag**: HTTPS-only cookie transmission in production
- **SameSite**: CSRF protection with strict same-site policy
- **Token Expiration**: 1-week token lifetime with automatic renewal

### 6.2 Data Protection
- **Server-Side Validation**: JWT verification on every request
- **Type Safety**: TypeScript prevents runtime errors
- **Input Sanitization**: Framework-level XSS protection

## 7. Development Workflow

### 7.1 Local Development
```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Type checking
bun run check
```

### 7.2 Technology Choices
- **Runtime**: Bun preferred over Node.js (per project guidelines)
- **Testing**: `bun test` for unit testing
- **Package Management**: `bun install` instead of npm/yarn

### 7.3 Code Organization
- **Feature-based Structure**: Components organized by functionality
- **Server/Client Separation**: Clear distinction between server and client code
- **Type Definitions**: Comprehensive TypeScript coverage

## 8. Recent Architectural Changes

### 8.1 Layout System Implementation
- **New Components**: MainLayout, Header, Footer, Navbar components
- **Layout Orchestration**: Centralized layout management with user context
- **Responsive Design**: Mobile-first approach with flexible layouts

### 8.2 Authentication System Overhaul
- **External OAuth**: Integration with passport.oceanheart.ai
- **Security Enhancement**: HttpOnly cookie-based JWT storage
- **Server-side Validation**: Request-level authentication checks

### 8.3 UI Framework Migration
- **Skeleton Labs Integration**: Modern component library adoption
- **Theme System**: Built-in dark/light mode support
- **Design Token System**: Semantic color and spacing tokens

### 8.4 Svelte 5 Migration
- **Runes Mode**: Modern reactive programming with `$props()`, `$state()`
- **Performance**: Improved reactivity and smaller bundle sizes
- **Developer Experience**: Better TypeScript integration

## 9. Revision History

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-09-13 | 0.1.0 | Initial architecture documentation: layout system, OAuth authentication, Skeleton UI integration, Svelte 5 runes mode, landing page implementation | Claude |