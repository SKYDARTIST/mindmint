---
description: Fixing common mobile layout and Tailwind issues
---

# HWT-UI-01: Responsive Layout Fixes (Mobile-First)

## The Mistake
Building a beautiful desktop UI that "breaks" on Android/iOS (e.g., overlapping menus, buttons cutoff by keyboards, or font sizes being too small).

## The Fix
1.  **Safety Insets:** Use `pb-safe` (Tailwind) or `env(safe-area-inset-bottom)` to account for mobile chin/home indicators.
2.  **Z-Index Hygiene:** Explicitly define Z-levels for Header (1000), Modals (2000), and Background (0).

### Implementation Pattern
```css
/* Layout consistency across projects */
.page-container {
  min-height: 100vh;
  padding-top: 4rem; /* Match header height */
  padding-bottom: env(safe-area-inset-bottom);
}

.mobile-nav-fix {
  z-index: 1000;
  position: sticky;
  top: 0;
}
```

## Audit Questions
- Have I tested this specific component on a 375px wide screen?
- Are interactive elements (buttons) large enough for a thumb? (Minimum 44px x 44px).
- Is the content safe from being obscured by the browser's bottom navigation bar?
