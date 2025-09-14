/**
 * Aceternity UI Adapter Utilities
 * Helper functions for converting React/Framer Motion components to Svelte
 */

import { writable, derived } from 'svelte/store';
import { tweened, spring } from 'svelte/motion';
import { cubicOut } from 'svelte/easing';

// Animation configuration types
export interface AnimationConfig {
  duration?: number;
  delay?: number;
  easing?: (t: number) => number;
}

export interface SpringConfig {
  stiffness?: number;
  damping?: number;
  precision?: number;
}

/**
 * Convert Framer Motion variants to Svelte animation config
 */
export function createAnimationVariants<T>(variants: Record<string, T>) {
  return variants;
}

/**
 * Create animated value equivalent to Framer Motion's useAnimation
 * Returns a tweened store that can be used for smooth value transitions
 */
export function createAnimatedValue(initialValue: number, config: AnimationConfig = {}) {
  return tweened(initialValue, {
    duration: config.duration || 300,
    delay: config.delay || 0,
    easing: config.easing || cubicOut
  });
}

/**
 * Create spring animation equivalent to Framer Motion's useSpringValue
 */
export function createSpringValue(initialValue: number, config: SpringConfig = {}) {
  return spring(initialValue, {
    stiffness: config.stiffness || 0.1,
    damping: config.damping || 0.8,
    precision: config.precision || 0.01
  });
}

/**
 * React useState equivalent for Svelte
 */
export function createState<T>(initialValue: T) {
  return writable(initialValue);
}

/**
 * React useEffect equivalent - returns cleanup function
 */
export function createEffect(fn: () => void | (() => void), deps?: any[]) {
  // In Svelte, effects are handled differently
  // This is a simplified adapter - actual implementation depends on component context
  return {
    run: fn,
    dependencies: deps
  };
}

/**
 * Convert React ref pattern to Svelte bind:this pattern
 */
export function createRef<T extends HTMLElement = HTMLElement>() {
  return writable<T | null>(null);
}

/**
 * Mouse position tracker (common in Aceternity components)
 */
export function createMousePosition() {
  const mouseX = writable(0);
  const mouseY = writable(0);
  
  const updateMousePosition = (event: MouseEvent) => {
    mouseX.set(event.clientX);
    mouseY.set(event.clientY);
  };

  const startTracking = () => {
    if (typeof window !== 'undefined') {
      window.addEventListener('mousemove', updateMousePosition);
    }
  };

  const stopTracking = () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('mousemove', updateMousePosition);
    }
  };

  return {
    mouseX,
    mouseY,
    startTracking,
    stopTracking
  };
}

/**
 * Scroll position tracker for scroll-based animations
 */
export function createScrollPosition() {
  const scrollY = writable(0);
  
  const updateScrollPosition = () => {
    if (typeof window !== 'undefined') {
      scrollY.set(window.scrollY);
    }
  };

  const startTracking = () => {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', updateScrollPosition);
    }
  };

  const stopTracking = () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('scroll', updateScrollPosition);
    }
  };

  return {
    scrollY,
    startTracking,
    stopTracking
  };
}

/**
 * Intersection Observer wrapper for viewport-based animations
 */
export function createIntersectionObserver(options: IntersectionObserverInit = {}) {
  const isIntersecting = writable(false);
  
  const observe = (element: Element) => {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          isIntersecting.set(entry.isIntersecting);
        });
      }, {
        threshold: 0.1,
        ...options
      });
      
      observer.observe(element);
      
      return () => observer.disconnect();
    }
    return () => {};
  };

  return {
    isIntersecting,
    observe
  };
}

/**
 * Convert className prop pattern to Svelte class pattern
 */
export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Debounce utility for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle utility for performance optimization
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Random number utilities for particle effects
 */
export const random = {
  between: (min: number, max: number) => Math.random() * (max - min) + min,
  choice: <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)],
  boolean: () => Math.random() > 0.5
};

/**
 * CSS-in-JS style converter for Tailwind
 */
export function createStyleVariables(styles: Record<string, string | number>) {
  return Object.entries(styles)
    .map(([key, value]) => `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
    .join('; ');
}

/**
 * Animation preset configurations matching common Aceternity patterns
 */
export const animationPresets = {
  fadeIn: {
    duration: 300,
    easing: cubicOut
  },
  slideIn: {
    duration: 400,
    easing: cubicOut
  },
  spring: {
    stiffness: 0.3,
    damping: 0.8
  },
  bounce: {
    stiffness: 0.6,
    damping: 0.4
  }
};

/**
 * Common Aceternity color schemes
 */
export const colorSchemes = {
  primary: 'oklch(0.84 0.18 117.33)',
  surface: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a'
  }
};