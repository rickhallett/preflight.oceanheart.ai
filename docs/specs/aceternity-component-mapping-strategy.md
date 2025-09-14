# Aceternity UI Component Mapping Strategy

**Document Version**: 1.0  
**Date**: September 14, 2025  
**Purpose**: Systematic conversion guide for Aceternity UI React components to Svelte

## Overview

This document provides a comprehensive strategy for converting Aceternity UI components from React/Next.js to Svelte, ensuring consistency, maintainability, and optimal performance.

## Core Mapping Principles

### 1. Component Structure Conversion

#### React Pattern:
```tsx
// React Aceternity Component
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface FloatingNavProps {
  navItems: Array<{name: string, link: string, icon?: JSX.Element}>;
  className?: string;
}

export const FloatingNav = ({ navItems, className }: FloatingNavProps) => {
  const [visible, setVisible] = useState(true);
  
  useEffect(() => {
    // scroll logic
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -100 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("fixed top-4 inset-x-0 max-w-2xl mx-auto z-50", className)}
    >
      {/* component content */}
    </motion.div>
  );
};
```

#### Svelte Equivalent:
```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { createAnimatedValue, cn } from '$lib/utils/aceternity-adapter.js';
  
  interface NavItem {
    name: string;
    link: string;
    icon?: string; // Svelte handles icons differently
  }
  
  export let navItems: NavItem[];
  export let className: string = '';
  
  let visible = $state(true);
  
  onMount(() => {
    // scroll logic implementation
    return () => {
      // cleanup
    };
  });
</script>

<div
  class={cn("fixed top-4 inset-x-0 max-w-2xl mx-auto z-50", className)}
  in:fly={{ y: -100, duration: 300 }}
  out:fade={{ duration: 200 }}
>
  <!-- component content -->
</div>
```

### 2. State Management Patterns

| React Pattern | Svelte Equivalent | Notes |
|---------------|-------------------|--------|
| `useState(value)` | `let value = $state(initial)` | Svelte 5 $state rune |
| `useEffect(() => {}, [])` | `onMount(() => {})` | Component lifecycle |
| `useEffect(() => {}, [dep])` | `$effect(() => {})` | Reactive effects |
| `useRef()` | `let element; bind:this={element}` | DOM references |
| `useMemo()` | `let computed = $derived()` | Computed values |
| `useCallback()` | Direct function definition | No memoization needed |

### 3. Animation Mapping Strategy

#### Framer Motion to Svelte Transitions

| Framer Motion | Svelte Equivalent | Implementation |
|---------------|-------------------|----------------|
| `motion.div` | `<div transition:fly>` | Built-in transitions |
| `initial/animate` | `in:transition` | Entry animations |
| `exit` | `out:transition` | Exit animations |
| `whileHover` | `:hover` CSS + transition | CSS hover states |
| `whileTap` | `on:click` + tweened store | Click animations |
| `variants` | Custom transition functions | Pre-configured transitions |

#### Animation Utility Usage:
```svelte
<script>
  import { createAnimatedValue, createSpringValue } from '$lib/utils/aceternity-adapter.js';
  
  // For smooth value animations
  const opacity = createAnimatedValue(0);
  const scale = createSpringValue(1);
  
  // Trigger animations
  function handleHover() {
    $opacity = 1;
    $scale = 1.1;
  }
</script>

<div 
  style="opacity: {$opacity}; transform: scale({$scale})"
  on:mouseenter={handleHover}
>
  Content
</div>
```

### 4. Event Handling Patterns

#### React to Svelte Event Mapping:

| React | Svelte | Notes |
|-------|---------|--------|
| `onClick` | `on:click` | Standard click events |
| `onMouseEnter` | `on:mouseenter` | Mouse enter events |
| `onMouseLeave` | `on:mouseleave` | Mouse leave events |
| `onScroll` | `on:scroll` | Scroll events |
| Custom events | `dispatch('custom')` | Custom event dispatch |

### 5. Props and Slots Conversion

#### Props Pattern:
```tsx
// React
interface ComponentProps {
  title: string;
  children: React.ReactNode;
  variant?: "default" | "outline";
}

export const Component = ({ title, children, variant = "default" }: ComponentProps) => {
  return (
    <div className={`component component--${variant}`}>
      <h2>{title}</h2>
      {children}
    </div>
  );
};
```

#### Svelte Equivalent:
```svelte
<script lang="ts">
  interface Props {
    title: string;
    variant?: "default" | "outline";
    children?: any;
  }
  
  let { title, variant = "default", children }: Props = $props();
</script>

<div class="component component--{variant}">
  <h2>{title}</h2>
  {@render children?.()}
</div>
```

### 6. CSS and Styling Patterns

#### Tailwind Class Handling:
```svelte
<script>
  import { cn } from '$lib/utils/aceternity-adapter.js';
  
  let { className = '' }: { className?: string } = $props();
  
  // Dynamic classes
  let isActive = $state(false);
  let dynamicClasses = $derived(cn(
    'base-classes',
    isActive && 'active-classes',
    className
  ));
</script>

<div class={dynamicClasses}>
  Content
</div>
```

## Common Aceternity Component Types

### 1. Background Effects Components

#### Sparkles Component
- **React Pattern**: Canvas-based particle system with useEffect
- **Svelte Approach**: Use onMount + canvas API + animation frame loop
- **Key Utilities**: `random` utilities from adapter, `createAnimatedValue`

#### Aurora Background
- **React Pattern**: CSS variables + Framer Motion
- **Svelte Approach**: CSS custom properties + tweened stores
- **Implementation**: Dynamic CSS variable updates

### 2. Interactive Components

#### Floating Navigation
- **React Pattern**: Scroll listener + useState + motion.div
- **Svelte Approach**: onMount scroll listener + $state + transitions
- **Key Features**: Hide/show on scroll, smooth transitions

#### 3D Card Effect
- **React Pattern**: Mouse tracking + transform3d
- **Svelte Approach**: `createMousePosition` utility + CSS transforms
- **Implementation**: Real-time transform updates

### 3. Text Effects Components

#### Text Generate Effect
- **React Pattern**: Character-by-character animation
- **Svelte Approach**: Text splitting + staggered transitions
- **Utilities**: Custom transition functions

#### Typewriter Effect
- **React Pattern**: setTimeout-based character reveal
- **Svelte Approach**: Interval-based + tweened store
- **Implementation**: Progressive text reveal

## Implementation Workflow

### Step 1: Component Analysis
1. Identify React hooks used
2. Map component props interface
3. Identify animation requirements
4. Note any third-party dependencies

### Step 2: Structure Conversion
1. Create Svelte component file
2. Convert interface to Props type
3. Map React hooks to Svelte equivalents
4. Implement component logic

### Step 3: Animation Implementation
1. Replace Framer Motion with Svelte transitions
2. Use aceternity-adapter utilities for complex animations
3. Implement mouse/scroll tracking if needed
4. Add CSS custom properties for dynamic styles

### Step 4: Testing & Refinement
1. Test component functionality
2. Verify animations work smoothly
3. Check responsive behavior
4. Optimize performance if needed

## Performance Considerations

### Animation Optimization
- Use CSS transforms over position changes
- Implement will-change property for animated elements
- Use requestAnimationFrame for smooth animations
- Debounce scroll and resize events

### Bundle Size Management
- Tree-shake unused utility functions
- Use dynamic imports for heavy components
- Optimize SVG icons and assets

## Common Pitfalls and Solutions

### 1. SSR Compatibility
**Issue**: Client-only animations break SSR
**Solution**: Use `browser` check from `$app/environment`

```svelte
<script>
  import { browser } from '$app/environment';
  
  onMount(() => {
    if (browser) {
      // Client-only animation logic
    }
  });
</script>
```

### 2. Event Listener Cleanup
**Issue**: Memory leaks from uncleaned event listeners
**Solution**: Return cleanup function from onMount

```svelte
<script>
  onMount(() => {
    function handleEvent() { /* */ }
    window.addEventListener('event', handleEvent);
    
    return () => {
      window.removeEventListener('event', handleEvent);
    };
  });
</script>
```

### 3. TypeScript Integration
**Issue**: Type errors during conversion
**Solution**: Use proper interface definitions and type assertions

```svelte
<script lang="ts">
  interface Props {
    items: Array<{ id: string; name: string }>;
  }
  
  let { items }: Props = $props();
</script>
```

## Testing Strategy

### Component Testing
1. **Functionality**: All props work as expected
2. **Animations**: Smooth and performant
3. **Accessibility**: Keyboard navigation and screen readers
4. **Responsiveness**: Works across device sizes

### Integration Testing  
1. **SSR**: Components render on server
2. **Hydration**: Client-side enhancement works
3. **Performance**: No significant bundle size increase

## Future Enhancements

### Automated Conversion Tools
- Script to auto-generate Svelte components from React patterns
- TypeScript interface conversion utilities
- Animation mapping automation

### Component Library
- Build reusable Aceternity-style component library
- Documentation with interactive examples  
- npm package for easy distribution

## Conclusion

This mapping strategy ensures systematic, consistent conversion of Aceternity UI components to Svelte while maintaining their visual appeal and functionality. The aceternity-adapter utilities provide the foundation for efficient conversions, and the documented patterns ensure maintainable, performant results.