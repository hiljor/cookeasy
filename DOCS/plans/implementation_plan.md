# Cookeasy Implementation Plan

## Background & Motivation
Cookeasy is a cooking-focused social media platform designed to bridge the gap between static recipe storage and active community sharing. The goal is to provide a seamless, mobile-first experience that allows users to collaborate on cookbooks, scale recipes dynamically, and discover new dishes through their social circles.

## Scope & Impact
This project is a full-stack monorepo implementation consisting of:
- **Frontend**: A Next.js 15+ App Router application focused on mobile responsiveness and internationalization.
- **Backend**: A Go Gin-based REST API designed for high performance and secure session management.
- **Data**: A PostgreSQL database with advanced relational mapping and Full Text Search.
- **Integrations**: Cloudinary (Media), Resend (Email), and Neon (Serverless Database).

## Proposed Solution
We will implement the project using a **vertically sliced approach** after the core infrastructure is established. This ensures that features (like Recipes or Friends) are fully functional from database to UI before moving to the next.

### Key Architectural Decisions:
- **Monorepo**: Shared documentation and synchronized development.
- **API Strategy**: Next.js Rewrites to bypass CORS and simplify cookie handling for Auth.
- **Auth**: JWT + Refresh Tokens in secure `httpOnly` cookies for a "stay-logged-in" experience.
- **Search**: PostgreSQL Full Text Search to maintain a $0 budget while providing relevance-based ranking.

## Alternatives Considered
- **Meilisearch**: Rejected for the MVP to maintain a $0 hosting cost, but the data model is ready for future integration.
- **Clerk/Auth0**: Rejected in favor of custom JWT to maintain total control over user data and avoid third-party pricing tiers at scale.
- **Kubernetes**: Rejected for the initial phase to avoid infrastructure complexity and costs; Docker Compose will be used for local development.

## Phased Implementation Plan

### Phase 1: Core Infrastructure & Monorepo Setup
- [x] **1.1 Workspace Init**: Create `/frontend` and `/backend` directories. Initialize `go.mod` and `package.json`.
- [x] **1.2 Docker Config**: Create a `docker-compose.yml` for local PostgreSQL.
- [x] **1.3 Backend Boilerplate**: Set up Gin with middleware (Logger, Recovery) and GORM connection.
- [x] **1.4 Frontend Boilerplate**: Initialize Next.js with Tailwind CSS v4, TypeScript 6, and `next-intl` (i18n).
- [x] **1.5 API Proxy**: Configure `next.config.js` rewrites to map `/api/*` to the Go backend.
- [x] **1.6 Infrastructure Testing**: Write relevant tests for API proxy and core middleware.

### Phase 2: Authentication & User Management
- [x] **2.1 Database Schema**: Implement `User` and `RefreshToken` models.
- [x] **2.2 Registration Logic**: Signup with password hashing (bcrypt) and Resend email verification.
- [x] **2.3 Login Logic**: JWT generation and secure cookie placement. Implement Refresh Token rotation.
- [x] **2.4 Auth UI**: Implement Login and Register pages with client-side validation (Zod).
- [x] **2.5 Profile Management**: Backend endpoints and Frontend profile view/edit pages.
- [x] **2.6 Media Integration**: Supabase Storage setup on backend and frontend upload component.
- [x] **2.7 UI/UX Polishing**:
    - [x] **Landing Page**: Add "Get Started" (Register) and "Login" call-to-action buttons.
    - [x] **Navigation**: Implement a mobile-first Navbar with active state indicators and locale switcher.
    - [x] **Auth Flow Polish**: Add loading states to buttons and toast notifications for success/error.
    - [x] **Empty States**: Design "No Friends Yet" or "No Recipes Found" placeholder illustrations.
- [x] **2.8 Multi-Theme System**: See detailed subplan in `DOCS/plans/multi_theme_subplan.md`.
    - [x] **Theme Foundation**: Define a set of base CSS variables for colors (primary, background, surface, text) in `globals.css`.
    - [x] **Custom Theme Definitions**: Implement multiple theme palettes (e.g., "Default", "Midnight", "Earthy") using data-attributes.
    - [x] **Theme Provider**: Set up a context provider to manage the active theme state.
    - [x] **Theme Selector**: Add a UI component in Settings to switch between the pre-defined themes.
- [x] **2.9 Auth & User Testing**: Write relevant tests for registration, login, profile management, and theme switching.

### Phase 3: Social Graph & Collaboration
- [ ] **3.1 Friend System Completion**:
    - [x] **3.1.1 User Search API**: Implement `GET /api/users/search?q=...` to find users by username.
    - [x] **3.1.2 User Search UI**: Implement a "Find Users" search component.
    - [x] **3.1.3 Profile Integration**: Add Friend/Remove Friend action buttons to public profile pages (`/u/[username]`).
    - [x] **3.1.4 Friends Popup**: Replace the "Friends" counter on the profile page with a button that opens a popup modal listing friends and providing an "Add Friend" interface.
- [ ] **3.2 Social Polish & Notifications**:
    - [ ] **3.2.1 Notification Center**: Navbar indicator for pending social actions that acts as a button to open a detailed modal, supporting future extensions like "post liked" notifications.
    - [ ] **3.2.2 Optimistic UI**: Implement React state updates for social actions.
    - [ ] **3.2.3 Toast Feedback**: Standardize notifications for social interactions.
- [ ] **3.3 Social Testing**:
    - [ ] **3.3.1 Backend Handlers**: Write comprehensive unit tests for `social.go` handlers.
    - [ ] **3.3.2 Frontend Components**: Write Vitest tests for the Friends popup, Search, and Profile interaction.

### Phase 4: Recipe System (The Core)
- [ ] **4.1 Recipe Models**: Implement `Recipe`, `Ingredient`, and `Tag` models.
- [ ] **4.2 Creation Flow**: Multi-step frontend form with structured ingredient input.
- [ ] **4.3 Media**: Cloudinary integration for recipe images with 5MB/WebP constraints.
- [ ] **4.4 Scaling Logic**: Frontend utility and UI to dynamically recalculate ingredient amounts.
- [ ] **4.5 Recipe View**: Detailed recipe page with scaling and printing support.
- [ ] **4.6 Recipe Polish**: Skeleton loaders for images and interactive "Cook Mode" (stay-awake screen logic).
- [ ] **4.7 Recipe Testing**: Write relevant tests for recipe creation, scaling logic, and image uploads.

### Phase 5: Cookbooks & Collaboration
- [ ] **5.1 Cookbook Models**: Implementation of `Cookbook` and join models.
- [ ] **5.2 Cookbook UI**: Gallery view, "Create Cookbook" flow, and **Collaborative Editor** for friends/family.
- [ ] **5.3 Collaboration**: Invite system for friends to join specific Cookbooks for collective creation.
- [ ] **5.4 Cookbook Testing**: Write relevant tests for cookbook creation and collaborator permissions.

### Phase 6: Search, Feed & Discovery
- [ ] **6.1 Search Engine**: Postgres Full Text Search backend and Frontend search bar/results page.
- [ ] **6.2 Dashboard Feed**: Recency-based feed logic and Frontend infinite scroll or paginated feed.
- [ ] **6.3 Random Recipe**: Landing page "Discovery" feature UI.
- [ ] **6.4 Search & Feed Testing**: Write relevant tests for search accuracy and feed pagination.

### Phase 7: Interactions & Notifications
- [ ] **7.1 RecipeMaker**: "I Made This" system with visibility controls, ratings, and image uploads.
- [ ] **7.2 Notifications**: Backend notification system and Frontend notification center (bell icon/toast).
- [ ] **7.3 Localization**: Final pass to ensure all UI strings are in `en.json` and `no.json`.
- [ ] **7.4 Interaction Testing**: Write relevant tests for ratings, notification delivery, and i18n coverage.

### Phase 9: Compliance & Legal
- [ ] **9.1 User Agreements**:
    - [ ] **9.1.1 Terms of Service**: Create a static page detailing platform usage rules.
    - [ ] **9.1.2 Privacy Policy**: Create a static page detailing data collection, processing, and storage practices.
- [ ] **9.2 Cookie Consent**:
    - [ ] **9.2.1 Compliance Component**: Implement a non-intrusive cookie consent banner/popup that blocks non-essential cookies until accepted.
    - [ ] **9.2.2 Policy Linking**: Link the banner to the newly created Terms of Service and Privacy Policy.
- [ ] **9.3 Compliance Testing**:
    - [ ] **9.3.1 Cookie Verification**: Test that non-essential scripts/cookies are not loaded before consent.

### Phase 10: Deployment & Final Polish
- [ ] **10.1 Swagger Docs**: Generate full OpenAPI documentation using `swag`.
- [ ] **10.2 Testing**: Complete `vitest` suites for frontend and `testify` for backend.
- [ ] **10.3 Deployment**: Set up Vercel (FE), Render (BE), and Supabase (Prod DB).

## Verification & Testing
- **Unit Testing**: 100% coverage for business logic (Recipe scaling, Privacy checks).
- **Integration Testing**: Verify the JWT flow between Next.js and Go.
- **E2E Testing**: Cypress journeys for "Create Recipe" and "Invite Friend to Cookbook."

## Migration & Rollback
- **Database**: GORM Auto-Migrations for development. `golang-migrate` for production to ensure versioned rollbacks.
- **Media**: Cloudinary asset versions will be used to prevent data loss during UI updates.

