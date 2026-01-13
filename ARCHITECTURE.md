# Project Architecture

## Last Updated: 2025-09-14
## Version: 0.2.0

## 1. High-Level Overview

### 1.1 System Purpose
OceanHeart Preflight is an AI-powered web application for personal growth and performance optimization. It provides personalized coaching, interactive surveys, feedback collection, and progress tracking through a modern web interface.

### 1.2 Core Technologies
- **Framework**: Next.js 15.5.3 with React 19.1.0
- **Styling**: Tailwind CSS 4.1.13 + Aceternity UI components
- **Authentication**: External OAuth with passport.oceanheart.ai + JWT with HttpOnly cookies
- **Runtime**: Bun (preferred over Node.js per project guidelines)
- **Build**: Next.js with Turbopack
- **Language**: TypeScript 5.0.0

### 1.3 Architecture Pattern
- **Pattern**: Component-based architecture with server-side rendering and client-side hydration
- **Key Decisions**: 
  - Server-side JWT validation for security
  - External OAuth provider for authentication
  - App Router architecture for modern routing
  - React Server Components for performance
  - Turbopack for fast development builds
- **Design Principles**: 
  - Security-first authentication
  - Component reusability
  - Progressive enhancement
  - Type safety with TypeScript

## 2. Medium-Level Architecture

### 2.1 Directory Structure
```
apps/preflight-web/
├── app/                  # Next.js App Router
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout component
│   ├── page.tsx         # Home page
│   ├── auth/
│   │   └── callback/    # OAuth callback handler
│   ├── coach/           # Coaching pages
│   ├── feedback/        # Feedback collection
│   ├── survey/          # Survey pages
│   └── login/           # Login page
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (shadcn/ui style)
│   └── aceternity/     # Aceternity UI components
├── lib/                # Utility functions and configurations
│   ├── utils.ts        # General utilities
│   └── auth.ts         # Authentication utilities
├── hooks/              # Custom React hooks
├── public/             # Static assets
├── package.json        # Dependencies and scripts
├── next.config.ts      # Next.js configuration
├── tailwind.config.js  # Tailwind configuration
├── tsconfig.json       # TypeScript configuration
├── biome.json          # Biome linting/formatting config
└── components.json     # UI components configuration
```

### 2.2 Component Hierarchy
- **Layout Components**:
  - `app/layout.tsx`: Root layout orchestrator
  - Custom layout components in `components/` directory
  - Header, Footer, Navigation components as React components
- **Page Components**:
  - `app/page.tsx`: Home page component
  - Route-based page components in `app/` directory
  - Landing page and feature components in `components/`
- **UI Components**: 
  - Aceternity UI components for advanced animations
  - Base UI components following shadcn/ui patterns
  - Custom hooks in `hooks/` directory

### 2.3 Data Flow
- **Authentication Flow**:
  1. User redirects to passport.oceanheart.ai for OAuth
  2. Callback handler (`/auth/callback`) receives JWT token
  3. Token stored as HttpOnly cookie for security
  4. Middleware validates JWT on each request
  5. User data passed through React context or server components
- **State Management**: 
  - Server state through React Server Components
  - Client state through React hooks and context
  - Data fetching via Next.js data fetching patterns

### 2.4 Routing Strategy
- **App Router**: Next.js 13+ App Router with file-based routing
- **API Routes**: Server endpoints using `route.ts` files
- **Layout Inheritance**: Nested layouts with React component composition
- **Protected Routes**: Middleware-based authentication checks

## 3. Low-Level Implementation Details

### 3.1 Component Patterns

#### React Server Components
```tsx
// Server Component (default in app directory)
import { getUserFromToken } from '@/lib/auth';

export default async function Layout({
  children
}: {
  children: React.ReactNode;
}) {
  const user = await getUserFromToken();
  
  return (
    <div className="app min-h-screen flex flex-col">
      <Header />
      <Navbar user={user} />
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}
```

#### Client Components
```tsx
'use client';

import { useState } from 'react';

export default function InteractiveComponent() {
  const [count, setCount] = useState(0);
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

### 3.2 Authentication Implementation

#### Server-side JWT Handling
```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('jwt');
  
  if (token) {
    try {
      const user = jwtDecode(token.value);
      // Add user info to headers for server components
      const response = NextResponse.next();
      response.headers.set('x-user-data', JSON.stringify(user));
      return response;
    } catch (error) {
      // Invalid token, clear it
      const response = NextResponse.next();
      response.cookies.delete('jwt');
      return response;
    }
  }
  
  return NextResponse.next();
}
```

#### OAuth Callback Handler
```typescript
// app/auth/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  
  if (token) {
    cookies().set('jwt', token, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });
  }
  
  return NextResponse.redirect(new URL('/', request.url));
}
```

### 3.3 Naming Conventions
- **Files**: PascalCase for components, kebab-case for pages
- **CSS**: Tailwind utilities with CSS-in-JS patterns
- **TypeScript**: camelCase for variables, PascalCase for types/interfaces

### 3.4 Key Components

#### app/layout.tsx
- **Purpose**: Root layout orchestrator with global providers
- **Props**: `children` (React.ReactNode), metadata configuration
- **Features**: Global styles, font loading, metadata management

#### Landing Page Components
- **Purpose**: Welcome screen with animated hero sections
- **Location**: `components/` directory with modular structure
- **Features**: Aceternity animations, interactive elements, responsive design

#### Authentication System
- **External OAuth**: passport.oceanheart.ai integration
- **Token Storage**: HttpOnly cookies for security
- **Validation**: Middleware-based JWT validation
- **State Management**: Server components and React context

### 3.5 Styling Architecture
- **Design System**: Aceternity UI components + custom components
- **Utility Framework**: Tailwind CSS 4.1.13
- **Component Library**: shadcn/ui patterns for base components
- **Animation Library**: Motion (Framer Motion) for advanced animations
- **Theme Support**: CSS variables with dark/light mode
- **Responsive Design**: Container-based layouts with responsive breakpoints

### 3.6 Build Pipeline
- **Development**: `bun run dev` (Next.js dev server with Turbopack)
- **Production**: `bun run build` (Next.js optimized build)
- **Start**: `bun run start` (Production server)
- **Linting**: `bun run lint` (Biome linting)
- **Formatting**: `bun run format` (Biome formatting)

## 4. External Integrations

### 4.1 Third-party Services
- **Authentication**: passport.oceanheart.ai (OAuth provider)
- **UI Framework**: Aceternity UI (advanced component library)
- **Animation**: Motion (Framer Motion) for complex animations

### 4.2 Dependencies
- **Core Framework**: `next@15.5.3`, `react@19.1.0`, `react-dom@19.1.0`
- **UI/Styling**: `tailwindcss@^4.1.13`, Aceternity UI components
- **Animation**: `motion@^12.23.12`, `@react-three/fiber@^9.0.0-alpha.8`
- **Icons**: `@tabler/icons-react@^3.34.1`, `lucide-react@^0.544.0`
- **Development**: `@biomejs/biome@2.2.0`, `typescript@^5`

## 5. Performance Considerations

### 5.1 Optimization Strategies
- **Server-Side Rendering**: React Server Components for faster initial loads
- **Static Generation**: Next.js static optimization where possible
- **Code Splitting**: Automatic route-based and dynamic imports
- **Turbopack**: Fast development builds and HMR
- **Image Optimization**: Next.js built-in image optimization

### 5.2 Bundle Size
- **Tree Shaking**: Unused code elimination via Next.js bundler
- **Dynamic Imports**: Lazy loading of components and libraries
- **Server Components**: Reduced client-side JavaScript bundle

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

# Build for production
bun run build

# Start production server
bun run start

# Linting and formatting
bun run lint
bun run format
```

### 7.2 Technology Choices
- **Runtime**: Bun preferred over Node.js (per project guidelines)
- **Testing**: `bun test` for unit testing
- **Package Management**: `bun install` instead of npm/yarn
- **Linting**: Biome instead of ESLint/Prettier

### 7.3 Code Organization
- **Feature-based Structure**: Components organized by functionality
- **Server/Client Separation**: Server Components vs Client Components
- **Hook Organization**: Custom hooks in dedicated `hooks/` directory
- **Type Definitions**: Comprehensive TypeScript coverage

## 8. Recent Architectural Changes

### 8.1 Framework Migration (SvelteKit → Next.js)
- **Complete Framework Migration**: Migrated from SvelteKit to Next.js 15.5.3
- **App Router**: Adopted Next.js App Router for modern routing patterns
- **React Server Components**: Leveraging RSCs for improved performance
- **Turbopack Integration**: Fast development builds and HMR

### 8.2 UI Framework Migration
- **Aceternity UI Integration**: Advanced animation components and modern design
- **Component Architecture**: shadcn/ui patterns for base components
- **Animation System**: Motion (Framer Motion) for complex animations
- **3D Graphics**: Three.js integration for advanced visualizations

### 8.3 Development Tooling
- **Biome Integration**: Modern linting and formatting replacing ESLint/Prettier
- **TypeScript 5**: Latest TypeScript features and improved DX
- **Build System**: Next.js + Turbopack for optimized builds

### 8.4 Authentication System Continuity
- **External OAuth**: Maintained integration with passport.oceanheart.ai
- **Security Enhancement**: HttpOnly cookie-based JWT storage (unchanged)
- **Middleware-based Validation**: Next.js middleware for authentication

## 9. Revision History

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-09-14 | 0.2.0 | Major framework migration from SvelteKit to Next.js: App Router, React Server Components, Aceternity UI, Turbopack, Biome tooling | Claude |
| 2025-09-13 | 0.1.0 | Initial architecture documentation: layout system, OAuth authentication, Skeleton UI integration, Svelte 5 runes mode, landing page implementation | Claude |