# Performance Optimization Guide

## Purpose

Define performance optimization patterns focusing on Next.js App Router optimizations, code splitting, and bundle size management.

## Core Strategies

- **Code Splitting**: Dynamic imports for non-critical components
- **Lazy Loading**: Load components only when needed
- **Image Optimization**: Next.js Image component with proper sizing
- **Bundle Analysis**: Monitor and reduce bundle size
- **SSR Optimization**: Minimize server-side work, parallelize operations

---

## Dynamic Imports (Code Splitting)

### Pattern

Use `next/dynamic` for components not needed on initial load:

```typescript
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(
  () => import('@/app/components/organisms/HeavyComponent'),
  {
    ssr: false,
    loading: () => <CircularProgress />,
  },
);
```

### When to Use

- Third-party widgets (analytics, chat)
- Heavy components (charts, editors, data grids)
- Conditional features (feature-flagged, role-gated)
- Below-the-fold content

---

## Image Optimization

Always use Next.js `Image` component:

```typescript
import Image from 'next/image';

<Image
  src="/image.jpg"
  alt="Description"
  width={800}
  height={600}
  priority={false}
/>
```

- Provide explicit `width` and `height` to prevent layout shift
- Use `priority` for above-the-fold images (LCP optimization)
- Optimize image formats (WebP when possible)

---

## Bundle Size

- **Tree shaking**: Use named imports, avoid default imports from large libraries
- **Dynamic imports**: Split large dependencies into separate chunks
- **Remove unused deps**: Regularly audit `package.json`
- **Lighter alternatives**: Prefer smaller libraries when possible

---

## SSR Performance

Resolve independent async operations in parallel:

```typescript
const [auth, userData] = await Promise.all([
  getAuthFromCookies(cookieStore),
  fetchUserData(cookieStore),
]);
```

- Cache expensive computations
- Use streaming when appropriate (React Server Components)
- Defer non-critical data fetching to client

---

## Client-Side Performance

### Memoization

Use `useMemo` and `useCallback` judiciously:

```typescript
const expensiveValue = useMemo(() => computeExpensiveValue(data), [data]);
```

### Virtualization

Use virtualization for long lists:

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';
```

---

## Web Vitals

- **LCP**: Optimize above-the-fold images, minimize render-blocking resources
- **CLS**: Provide explicit image dimensions, reserve space for dynamic content
- **INP**: Minimize JavaScript execution time, use code splitting

---

## Performance Checklist

- [ ] Heavy components use dynamic imports
- [ ] Images use Next.js Image component with dimensions
- [ ] Above-the-fold images have `priority`
- [ ] Bundle size analyzed and optimized
- [ ] SSR operations parallelized where possible
- [ ] Long lists use virtualization
- [ ] Core Web Vitals meet targets
