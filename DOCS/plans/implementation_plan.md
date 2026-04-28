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

### Phase 2: Authentication & User Management
- [x] **2.1 Database Schema**: Implement `User` and `RefreshToken` models.
- [x] **2.2 Registration Logic**: Signup with password hashing (bcrypt) and Resend email verification.
- [x] **2.3 Login Logic**: JWT generation and secure cookie placement. Implement Refresh Token rotation.
- [x] **2.4 Auth UI**: Implement Login and Register pages with client-side validation (Zod).
- [x] **2.5 Profile Management**: Backend endpoints and Frontend profile view/edit pages.
- [x] **2.6 Media Integration**: Supabase Storage setup on backend and frontend upload component.

### Phase 3: Social Graph (Friends & Groups)
- [ ] **3.1 Friend System**: Backend logic for send/accept/reject and Frontend "Friends" dashboard.
- [ ] **3.2 Group System**: Backend `Group` models and Frontend "Groups" management UI.
- [ ] **3.3 Invite System**: Backend logic and Frontend notification/invite components.

### Phase 4: Recipe System (The Core)
- [ ] **4.1 Recipe Models**: Implement `Recipe`, `Ingredient`, and `Tag` models.
- [ ] **4.2 Creation Flow**: Multi-step frontend form with structured ingredient input.
- [ ] **4.3 Media**: Cloudinary integration for recipe images with 5MB/WebP constraints.
- [ ] **4.4 Scaling Logic**: Frontend utility and UI to dynamically recalculate ingredient amounts.
- [ ] **4.5 Recipe View**: Detailed recipe page with scaling and printing support.

### Phase 5: Cookbooks & Collaboration
- [ ] **5.1 Cookbook Models**: Implementation of `Cookbook` and join models.
- [ ] **5.2 Cookbook UI**: Gallery view and "Create Cookbook" flow.
- [ ] **5.3 Collaboration**: Invite system logic and Frontend collaborator management.

### Phase 6: Search, Feed & Discovery
- [ ] **6.1 Search Engine**: Postgres Full Text Search backend and Frontend search bar/results page.
- [ ] **6.2 Dashboard Feed**: Recency-based feed logic and Frontend infinite scroll or paginated feed.
- [ ] **6.3 Random Recipe**: Landing page "Discovery" feature UI.

### Phase 7: Interactions & Notifications
- [ ] **7.1 RecipeMaker**: "I Made This" system with visibility controls, ratings, and image uploads.
- [ ] **7.2 Notifications**: Backend notification system and Frontend notification center (bell icon/toast).
- [ ] **7.3 Localization**: Final pass to ensure all UI strings are in `en.json` and `no.json`.

### Phase 8: Deployment & Final Polish
- [ ] **8.1 Swagger Docs**: Generate full OpenAPI documentation using `swag`.
- [ ] **8.2 Testing**: Complete `vitest` suites for frontend and `testify` for backend.
- [ ] **8.3 Deployment**: Set up Vercel (FE), Render (BE), and Supabase (Prod DB).

## Verification & Testing
- **Unit Testing**: 100% coverage for business logic (Recipe scaling, Privacy checks).
- **Integration Testing**: Verify the JWT flow between Next.js and Go.
- **E2E Testing**: Cypress journeys for "Create Recipe" and "Invite Friend to Cookbook."

## Migration & Rollback
- **Database**: GORM Auto-Migrations for development. `golang-migrate` for production to ensure versioned rollbacks.
- **Media**: Cloudinary asset versions will be used to prevent data loss during UI updates.

