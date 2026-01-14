# Ralph Loop: Performance Optimization

You are running an iterative performance optimization loop for Preflight.

## Your Mission

Improve Core Web Vitals until all metrics are in the "Good" range.

## Target Metrics

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| FCP (First Contentful Paint) | < 1.8s | 1.8s - 3.0s | > 3.0s |
| LCP (Largest Contentful Paint) | < 2.5s | 2.5s - 4.0s | > 4.0s |
| FID (First Input Delay) | < 100ms | 100ms - 300ms | > 300ms |
| CLS (Cumulative Layout Shift) | < 0.1 | 0.1 - 0.25 | > 0.25 |
| TTI (Time to Interactive) | < 3.9s | 3.9s - 7.3s | > 7.3s |

## Iteration Protocol

1. **Measure Current Performance**
   ```bash
   cd apps/preflight-web
   bunx playwright test -g "Performance" --reporter=list
   ```

   Or run simulation with metrics:
   ```bash
   bun run test:simulate landing
   ```

2. **Analyze Bundle Size**
   ```bash
   bun run build
   # Check .next/analyze if available, or:
   du -sh .next/static/chunks/*.js | sort -h | tail -20
   ```

3. **Identify Bottlenecks**
   - Large JavaScript bundles (> 100KB per chunk)
   - Unoptimized images
   - Render-blocking resources
   - Unnecessary client-side JavaScript
   - Layout shifts from dynamic content

4. **Apply Optimizations**
   Priority order:
   1. Critical rendering path
   2. JavaScript bundle size
   3. Image optimization
   4. Font loading
   5. Third-party scripts

5. **Re-measure and Compare**
   ```bash
   bun run test:simulate landing
   ```

6. **Update State**
   Update `tests/ralph-prompts/.ralph-perf-state.json`:
   ```json
   {
     "iteration": <number>,
     "metrics": {
       "fcp": <ms>,
       "lcp": <ms>,
       "cls": <score>,
       "bundleSize": "<KB>"
     },
     "optimizationsApplied": ["<description>", ...],
     "remainingIssues": ["<description>", ...]
   }
   ```

## Completion Criteria

Output promise when ALL metrics are in "Good" range:
- FCP < 1.8s
- LCP < 2.5s
- CLS < 0.1
- Total JS bundle < 300KB gzipped

```
<promise>PERFORMANCE OPTIMIZED</promise>
```

## Common Optimizations

### 1. Dynamic Imports for Heavy Components
```tsx
// Before
import { HeavyChart } from '@/components/HeavyChart';

// After
import dynamic from 'next/dynamic';
const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <Skeleton />,
  ssr: false, // If not needed for SEO
});
```

### 2. Image Optimization
```tsx
// Before
<img src="/hero.png" />

// After
import Image from 'next/image';
<Image
  src="/hero.png"
  width={1200}
  height={600}
  priority // For LCP images
  placeholder="blur"
/>
```

### 3. Font Optimization
```tsx
// In layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // Prevents FOIT
  preload: true,
});
```

### 4. Reduce Client-Side JS
```tsx
// Add to components that don't need interactivity
// (Remove 'use client' where possible)

// Use React Server Components for static content
export default function StaticSection() {
  return <div>This renders on server only</div>;
}
```

### 5. Prevent Layout Shift
```tsx
// Reserve space for dynamic content
<div style={{ minHeight: '200px' }}>
  {isLoading ? <Skeleton /> : <Content />}
</div>

// Set dimensions on images
<Image width={100} height={100} />
```

### 6. Code Splitting by Route
```tsx
// next.config.ts
export default {
  // Already automatic in Next.js App Router
  experimental: {
    optimizePackageImports: ['lucide-react', '@tabler/icons-react'],
  },
};
```

## Files to Check

- `app/layout.tsx` - Root layout, fonts, global imports
- `components/ui/*.tsx` - Heavy UI components
- `next.config.ts` - Build optimization settings
- Any component with large dependencies (three.js, charts, etc.)

Begin your performance optimization iteration now.
