# Subplan: Multi-Theme System (Stage 2.8)

## 1. Objectives
Implement a flexible design system that supports multiple named color palettes (themes) in addition to the standard Light/Dark mode toggle.

## 2. Technical Strategy
We will use **CSS Variables (Custom Properties)** scoped to data-attributes on the `<html>` element. This allows Tailwind to pick up the colors dynamically while maintaining a clean separation between logic and styling.

## 3. Detailed Tasks

### 3.1 CSS Architecture (Semantic Tokens)
- [x] **Refactor `globals.css`**: Define a set of semantic variables that every theme must implement:
    - `--color-background`: Main background color.
    - `--color-foreground`: Main text color.
    - `--color-card`: Surface color for cards/modals.
    - `--color-primary`: Main brand/accent color (e.g., the current orange).
    - `--color-primary-foreground`: Text color on top of primary background.
    - `--color-border`: Standard border color.
    - `--color-muted`: Secondary/muted text.
- [ ] **Default Theme Implementation**: Map current zinc/orange colors to these variables.

### 3.2 Theme Definitions
- [x] **Midnight Theme**: Deep indigo/slate palette for a "developer" feel.
- [x] **Earthy Theme**: Forest green and warm beige palette for a "natural cooking" feel.
- [x] **Ocean Theme**: Teal and cool grey palette for a "fresh/modern" feel.
- [ ] **Theme Config**: Create a TypeScript constant `THEMES` in `src/context/ThemeContext.tsx` to hold theme metadata (id, name, icon).

### 3.3 Persistence & Backend Integration
- [ ] **Backend Schema Update**: Add a `theme` field (string, default: "default") to the `User` model in `backend/internal/models/user.go`.
- [ ] **Settings Endpoint**: Implement a `PATCH /api/users/me/settings` endpoint in the Go backend to allow users to update their preferred theme.
- [ ] **Hybrid Persistence Layer**:
    - **Guest Mode**: Use `localStorage` to persist theme choices for unauthenticated users.
    - **Auth Mode**: On login, synchronize the local theme with the user's saved setting from the database.
    - **Sync Logic**: When a logged-in user changes their theme, trigger an optimistic UI update and a background API call to persist it.

### 3.4 UI Components & Integration
- [ ] **Refactor Components**: Update `Button.tsx`, `Navbar.tsx`, `Card.tsx`, and `EmptyState.tsx` to use semantic CSS variables (e.g., `bg-[var(--color-primary)]`).
- [ ] **Theme Selector**: Create a visually rich selector component that shows a preview of the theme's colors.
- [ ] **Settings Page**: Implement a "Display" or "Appearance" section in the user settings (`frontend/src/app/[locale]/(app)/settings/profile/page.tsx` or a new sibling page) to house the theme selector.

### 3.5 Testing & Validation (Stage 2.9 Integration)
- [ ] **Unit Tests**: Test `ThemeContext` logic (switching, persistence).
- [ ] **Accessibility Check**: Ensure all pre-defined themes meet WCAG contrast ratios.
