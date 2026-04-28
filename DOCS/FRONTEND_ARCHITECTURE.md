# Frontend Architecture & Component Plan

## Overview
Cookeasy's frontend is a mobile-first, highly interactive Next.js 15+ application. The architecture prioritizes performance, internationalization (i18n), and a polished UI/UX using Vanilla CSS and Tailwind CSS v4.

## 1. Layout Strategy
We use Next.js **Route Groups** to provide context-specific layouts:

### `(home)` - Landing Layout
*   **Routes**: `/`
*   **Header**: Transparent sticky header with "Login" and "Get Started" buttons.
*   **Footer**: Links to social media, privacy policy, and language switcher.

### `(auth)` - Authentication Layout
*   **Routes**: `/login`, `/register`, `/forgot-password`
*   **Structure**: Centered flex container. Card-based forms. Minimal distraction.

### `(authenticated)` - App Layout
*   **Routes**: `/dashboard`, `/recipes/*`, `/cookbooks/*`, `/u/*`
*   **Mobile (Default)**: 
    *   **Bottom Navigation**: Fixed bar with icons for Feed, Search, Add (+), Cookbooks, and Profile.
    *   **Top Bar**: Contextual title (e.g., "My Cookbooks") and Notification bell.
*   **Desktop (Breakpoint: `lg`)**: 
    *   **Sidebar**: Persistent left-side navigation.
    *   **Top Bar**: Global search input and User profile dropdown.

## 2. Component Library (Atomic Design)

### Base UI (Atoms)
*   `Button`: Variants (Primary, Secondary, Outline, Ghost). Loading states.
*   `Input`/`Textarea`: Floating labels, error states, and icons.
*   `Badge`: For recipe tags (categories, time, dietary).
*   `Avatar`: Circular images with fallback initials.
*   `Skeleton`: Pulsing placeholders for data-heavy components.

### Shared Modules (Molecules)
*   `Card`: Base wrapper for content (Recipe, Cookbook, Group).
*   `Modal` / `Drawer`: Mobile-first overlay system. Drawers used for bottom-sheet actions on mobile.
*   `SearchBar`: Persistent input with "Quick Filter" chips.
*   `ScalingTool`: Utility component for ingredient amount recalculation.

### Feature Blocks (Organisms)
*   `RecipeCard`: Image, title, rating, time badge, and author snippet.
*   `IngredientList`: Checkable list with dynamic scaling support.
*   `StepByStepGuide`: Interactive instructions with "Current Step" highlighting.
*   `MultiStepRecipeForm`: Wizard-style form for recipe creation.
*   `CollaboratorList`: Management UI for cookbook/group members.

## 3. Architecture & Data Flow

### State Management
*   **Auth Context**: Global provider for `user` object and `isLoggedIn` status.
*   **Form State**: `react-hook-form` with `zod` for validation.
*   **Server State**: Next.js Server Components by default; `useSWR` or `fetch` in Client Components for dynamic interactions (e.g., infinite scroll).

### Communication
*   **API Proxy**: All requests routed through `/api/*` (Next.js Rewrites) to avoid CORS and simplify `httpOnly` cookie handling.
*   **Interceptors**: Centralized fetch wrapper to handle `401 Unauthorized` by triggering the Refresh Token flow.

### Design Principles
*   **Mobile-First**: Every feature must be fully functional on a 390px wide screen before desktop optimization.
*   **Interactive Feedback**: Haptic-like feedback using subtle transitions and loading indicators.
*   **Accessibility (A11y)**: Proper ARIA roles, keyboard navigation, and contrast ratios.

## 4. Implementation Priorities
1.  **Phase A**: Layout shells (Bottom Nav, Sidebar).
2.  **Phase B**: Common UI components (Card, Badge, Avatar).
3.  **Phase C**: Recipe-specific logic (Scaling tool, Interactive ingredients).
4.  **Phase D**: Feed & Discovery (Infinite scroll, FTS integration).
