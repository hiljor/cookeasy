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
- [ ] **1.1 Workspace Init**: Create `/frontend` and `/backend` directories. Initialize `go.mod` and `package.json`.
- [ ] **1.2 Docker Config**: Create a `docker-compose.yml` for local PostgreSQL.
- [ ] **1.3 Backend Boilerplate**: Set up Gin with middleware (Logger, Recovery) and GORM connection.
- [ ] **1.4 Frontend Boilerplate**: Initialize Next.js with Tailwind CSS v4, TypeScript 6, and `next-intl` (i18n).
- [ ] **1.5 API Proxy**: Configure `next.config.js` rewrites to map `/api/*` to the Go backend.

### Phase 2: Authentication & User Management
- [ ] **2.1 Database Schema**: Implement `User` and `RefreshToken` models.
- [ ] **2.2 Registration Logic**: Signup with password hashing (bcrypt) and Resend email verification.
- [ ] **2.3 Login Logic**: JWT generation and secure cookie placement. Implement Refresh Token rotation.
- [ ] **2.4 Profile Management**: User profile view/edit and Cloudinary integration for profile pictures.

### Phase 3: Social Graph (Friends & Groups)
- [ ] **3.1 Friend System**: `FriendRequest` and `Friendship` models with logic for send/accept/reject.
- [ ] **3.2 Group System**: `Group` and `GroupMembership` models.
- [ ] **3.3 Invite System**: `GroupInvite` logic (invite friends to groups).

### Phase 4: Recipe System (The Core)
- [ ] **4.1 Recipe Models**: Implement `Recipe`, `Ingredient`, and `Tag` (with `is_system` flag).
- [ ] **4.2 Creation Flow**: Multi-step or optimized single-page form with structured ingredient input.
- [ ] **4.3 Media**: Cloudinary upload integration with the 5MB/WebP constraints.
- [ ] **4.4 Scaling Logic**: Frontend utility to dynamically recalculate ingredient amounts based on scale factor.

### Phase 5: Cookbooks & Collaboration
- [ ] **5.1 Cookbook Models**: `Cookbook`, `CookbookAuthor` (join), and `CookbookRecipe` (join).
- [ ] **5.2 Invite System**: `CookbookInvite` logic to add collaborators.
- [ ] **5.3 Permission Enforcement**: Logic ensuring only owners can edit details, while authors can manage the recipe list.

### Phase 6: Search, Feed & Discovery
- [ ] **6.1 Search Engine**: Implement GORM-based Postgres Full Text Search with OR-logic and ranking.
- [ ] **6.2 Dashboard Feed**: Logic to aggregate friend-public and group-shared recipes, sorted by recency.
- [ ] **6.3 Random Recipe**: Landing page "Discovery" feature.

### Phase 7: Interactions & Notifications
- [ ] **7.1 RecipeMaker**: Implement the "I Made This" post system with visibility controls and ratings.
- [ ] **7.2 Notifications**: Real-time or polled system based on `Notification` model + UserSettings toggles.
- [ ] **7.3 Localization**: Populate `en.json` and `no.json` with all UI strings.

### Phase 8: Deployment & Final Polish
- [ ] **8.1 Swagger Docs**: Generate full OpenAPI documentation using `swag`.
- [ ] **8.2 Testing**: Complete `vitest` suites for frontend and `testify` for backend.
- [ ] **8.3 Deployment**: Set up Vercel (FE), Render (BE), and Neon (Prod DB).

## Verification & Testing
- **Unit Testing**: 100% coverage for business logic (Recipe scaling, Privacy checks).
- **Integration Testing**: Verify the JWT flow between Next.js and Go.
- **E2E Testing**: Cypress journeys for "Create Recipe" and "Invite Friend to Cookbook."

## Migration & Rollback
- **Database**: GORM Auto-Migrations for development. `golang-migrate` for production to ensure versioned rollbacks.
- **Media**: Cloudinary asset versions will be used to prevent data loss during UI updates.
