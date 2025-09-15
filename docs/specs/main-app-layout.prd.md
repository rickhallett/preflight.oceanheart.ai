# Main App Layout - Product Requirements Document

**Date:** December 2024  
**Version:** 1.0

## Executive Summary

This document defines the requirements for transforming the current Preflight AI application from a single landing page into a full-featured application with authenticated user experiences. The main app layout will provide a responsive, modern interface with navigation, user management, and integration with Oceanheart Passport authentication system.

## Problem Statement

### Current State
- Single page application showing only a hero banner with sparkles animation
- No user authentication or protected routes
- No navigation structure or app layout
- No distinction between public landing page and authenticated app experience

### Pain Points
- Users cannot access application features
- No user session management
- No navigation between different app sections
- No responsive layout for different screen sizes
- Authentication not integrated with centralized Oceanheart Passport system

## Requirements

### User Requirements

1. **Landing Page Access**
   - Public landing page accessible at root route (`/`)
   - Hero banner with product branding
   - Call-to-action to login/signup

2. **Authentication Flow**
   - Login form with redirect to Oceanheart Passport
   - Seamless return after authentication
   - Logout functionality from profile section
   - Session persistence across page refreshes

3. **Navigation Experience**
   - Clear navigation between landing page, profile, and settings
   - Visual indication of current active section
   - Responsive mobile navigation menu
   - Consistent header/footer across all pages

4. **Protected App Area**
   - Main app accessible at `/app` route
   - Profile management section
   - Settings configuration area
   - Dynamic content switching in main panel

### Technical Requirements

1. **Routing Structure**
   ```
   / - Public landing page (current sparkles hero)
   /login - Login form page
   /app - Protected main application
   /app/profile - User profile section
   /app/settings - Settings section
   ```

2. **Authentication Integration**
   - JWT token verification from `oh_session` cookie
   - Redirect to Oceanheart Passport for authentication
   - Environment-aware redirect URLs:
     - Development: `http://localhost:3000` → `passport.oceanheart.ai/auth?returnTo=http://localhost:3000/app`
     - Production: `watson.oceanheart.ai` → `passport.oceanheart.ai/auth?returnTo=https://watson.oceanheart.ai/app`

3. **Component Architecture**
   - Reusable layout components
   - Client-side navigation state management
   - Dynamic content rendering based on route
   - TypeScript type safety throughout

### Design Requirements

1. **Visual Hierarchy**
   - Consistent spacing and typography
   - Clear visual separation between header, main, and footer
   - Appropriate use of existing UI components from Aceternity library

2. **Responsive Design**
   - Mobile-first approach
   - Breakpoints: 640px (sm), 768px (md), 1024px (lg), 1280px (xl)
   - Collapsible mobile navigation menu
   - Touch-friendly interface elements

3. **Component Selection**
   - Use `floating-navbar` or `navbar-menu` for navigation
   - Implement `sidebar` for mobile navigation drawer
   - Apply `background-gradient` or `aurora-background` for visual appeal
   - Utilize `card-hover-effect` for interactive sections

## Implementation Phases

### Phase 1: Core Layout Structure

1. **Create Layout Components**
   ```typescript
   // app/components/layout/AppLayout.tsx
   - Header with navigation
   - Main content area
   - Footer
   - Responsive container
   ```

2. **Implement Navigation**
   ```typescript
   // app/components/navigation/MainNav.tsx
   - Desktop navigation bar
   - Mobile hamburger menu
   - Active route highlighting
   ```

3. **Setup Route Structure**
   ```typescript
   // app/(public)/page.tsx - Landing page
   // app/(public)/login/page.tsx - Login form
   // app/(protected)/app/layout.tsx - Protected layout
   // app/(protected)/app/page.tsx - Main app dashboard
   // app/(protected)/app/profile/page.tsx - Profile
   // app/(protected)/app/settings/page.tsx - Settings
   ```

### Phase 2: Authentication Integration

1. **Create Auth Utilities**
   ```typescript
   // lib/auth/utils.ts
   export function getAuthUrl(returnPath: string) {
     const isDev = process.env.NODE_ENV === 'development'
     const baseUrl = isDev ? 'http://localhost:3000' : 'https://watson.oceanheart.ai'
     const returnTo = `${baseUrl}${returnPath}`
     return `https://passport.oceanheart.ai/auth?returnTo=${encodeURIComponent(returnTo)}`
   }
   ```

2. **Implement Auth Middleware**
   ```typescript
   // middleware.ts
   - Check for oh_session cookie
   - Verify JWT token
   - Redirect unauthenticated users
   - Pass user context to protected routes
   ```

3. **Create Login Form**
   ```typescript
   // app/(public)/login/page.tsx
   - Email/password fields (optional)
   - "Sign in with Oceanheart" button
   - Redirect handling
   ```

### Phase 3: User Interface Components

1. **Profile Section**
   ```typescript
   // app/(protected)/app/profile/page.tsx
   - User information display
   - Avatar placeholder
   - Sign out button
   - Basic user preferences
   ```

2. **Settings Section**
   ```typescript
   // app/(protected)/app/settings/page.tsx
   - Application preferences
   - Theme selection (if applicable)
   - Notification settings placeholder
   - Account management links
   ```

3. **Main Dashboard**
   ```typescript
   // app/(protected)/app/page.tsx
   - Welcome message
   - Quick actions
   - Recent activity placeholder
   - Feature cards
   ```

## Implementation Notes

### Layout Component Example
```typescript
// app/components/layout/AppLayout.tsx
import { FloatingNavbar } from "@/components/ui/floating-navbar"
import { AuroraBackground } from "@/components/ui/aurora-background"

export function AppLayout({ children }: { children: React.ReactNode }) {
  const navItems = [
    { name: "Home", link: "/" },
    { name: "Profile", link: "/app/profile" },
    { name: "Settings", link: "/app/settings" }
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <FloatingNavbar navItems={navItems} />
      <main className="flex-1 container mx-auto px-4 py-8">
        <AuroraBackground>
          {children}
        </AuroraBackground>
      </main>
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        © 2024 Preflight AI
      </footer>
    </div>
  )
}
```

### Authentication Flow Example
```typescript
// app/(public)/login/page.tsx
'use client'

import { Button } from "@/components/ui/button"
import { getAuthUrl } from "@/lib/auth/utils"

export default function LoginPage() {
  const handleLogin = () => {
    window.location.href = getAuthUrl('/app')
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Sign in to Preflight AI</h2>
          <p className="mt-2 text-sm text-gray-600">
            Access your AI preflight dashboard
          </p>
        </div>
        <Button onClick={handleLogin} className="w-full">
          Sign in with Oceanheart
        </Button>
      </div>
    </div>
  )
}
```

### Mobile Navigation Example
```typescript
// app/components/navigation/MobileNav.tsx
'use client'

import { useState } from 'react'
import { Sidebar } from "@/components/ui/sidebar"
import { Menu, X } from "lucide-react"

export function MobileNav({ items }: { items: NavItem[] }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        className="md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X /> : <Menu />}
      </button>
      
      <Sidebar 
        open={isOpen} 
        setOpen={setIsOpen}
      >
        {/* Navigation items */}
      </Sidebar>
    </>
  )
}
```

## Security Considerations

1. **Authentication**
   - All protected routes must verify JWT token
   - Tokens should be validated on every request
   - Implement proper session timeout handling

2. **Authorization**
   - User roles/permissions check (if applicable)
   - Prevent unauthorized access to user-specific data

3. **Data Validation**
   - Sanitize all user inputs
   - Validate redirect URLs to prevent open redirects
   - Implement CSRF protection for state-changing operations

## Success Metrics

1. **User Experience**
   - Successful authentication flow completion rate > 95%
   - Page load time < 3 seconds
   - Mobile responsiveness score > 90

2. **Technical Performance**
   - Zero authentication-related errors in production
   - JWT verification time < 100ms
   - Successful redirect rate = 100%

3. **Adoption Metrics**
   - User login success rate
   - Average session duration
   - Navigation interaction patterns

## Future Enhancements

1. **Extended User Features**
   - User avatar upload
   - Detailed profile customization
   - Advanced settings management

2. **Navigation Improvements**
   - Breadcrumb navigation
   - Quick search functionality
   - Keyboard navigation shortcuts

3. **Authentication Enhancements**
   - Remember me functionality
   - Session management dashboard
   - Multi-factor authentication support

4. **UI/UX Refinements**
   - Dark/light theme toggle
   - Customizable dashboard layouts
   - Animated page transitions

## Technical Debt Considerations

- Keep authentication logic modular for easy updates
- Minimize dependencies on specific UI component implementations
- Maintain clear separation between layout and business logic
- Document all environment-specific configurations

## Notes

- Use existing Aceternity UI components wherever possible
- Maintain consistency with Oceanheart design system
- Prioritize mobile experience given modern usage patterns
- Ensure all text is accessible and follows WCAG guidelines

---

**Document Status:** Ready for Implementation  
**Next Steps:** Begin Phase 1 implementation with core layout structure