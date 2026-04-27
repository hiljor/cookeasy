# Cookeasy

## Project abstract
Cookeasy is a web application designed as a cooking and baking social media platform. It allows users to share their recipes, see a feed of other people's recipes, and interact with the community.

## Features
- Friend management
- Creating friend groups (with invite system)
- Recipe creation and editing (with structured ingredients and scaling)
- Recipe search and filtering (Postgres FTS)
- Recipe rating (cached aggregates)
- Recipe sharing
- Cookbook creation, organization, and sharing, collaboration (with invite system)
- Multi-language support (i18n)

## Project organisation
The project will be a monorepo containing both frontend and backend code organised in separate folders.
- `/frontend`: Next.js application
- `/backend`: Go Gin API
- `/DOCS`: Documentation and plans
- `/docker`: Local development configuration

## Tech stack
- Frontend: 
  - Next.js 15+ (App Router, next-intl for i18n)
  - React 19.2
  - TypeScript 6.0
  - Tailwind CSS v4.0
  - Zod v4.3.6
  - vitest for unit and integration tests, Cypress for end-to-end tests.
- Backend: 
  - golang (Gin framework)
  - GORM
  - testify, go-sqlmock
  - go-playground/validator (matching Zod logic)
  - swaggo/swag (for Swagger/OpenAPI)
- Database: PostgreSQL (via Neon)
- Authentication: Custom JWT + Refresh Tokens (Cookie-based).
- API Strategy: Next.js Rewrites (Proxying) to handle same-origin cookie transmission between Vercel and Render.
- Hosting: 
  - Vercel for frontend ($0)
  - Render for backend ($0, free tier)
  - Neon for PostgreSQL database ($0)
- CI/CD: GitHub Actions
- docker for containerization of the backend and database for development and testing
- indexing and recipe search: PostgreSQL Full Text Search (OR logic with relevance ranking).
- saving images: Cloudinary (Free tier).
  - **Constraints**: Max 5MB per upload, automatic conversion to WebP, automatic resizing for mobile performance.
- email service: Resend (Free tier) for account confirmation and password resets.

## Environment Variables (Required)
- `DATABASE_URL` (Neon Postgres)
- `JWT_SECRET` & `REFRESH_SECRET`
- `CLOUDINARY_URL`
- `RESEND_API_KEY`
- `FRONTEND_URL` & `BACKEND_URL`

## Data model
- User
  - id: uuid
  - username: string
  - email: string
  - password: string (hashed, hidden from JSON)
  - bio: string (nullable)
  - profile_picture_url: string (nullable)
  - is_verified: boolean (default: false)
  - verification_token: string (hidden from JSON)
  - created_at: iso 8601 timestamp
- RefreshToken
  - id: uuid
  - user_id: uuid (foreign key to User)
  - token: string (hashed)
  - expires_at: timestamp
- UserSettings
  - id: uuid
  - user_id: uuid (foreign key to User)
  - notify_friend_request: boolean (default: true)
  - notify_request_accepted: boolean (default: true)
  - notify_recipe_made: boolean (default: true)
  - notify_added_to_cookbook: boolean (default: true)
  - theme: string (default: "light")
- FriendRequest
  - id: uuid
  - sender_id: uuid (foreign key to User)
  - receiver_id: uuid (foreign key to User)
  - status: string (pending, accepted, rejected)
  - created_at: iso 8601 timestamp
- Friendship
  - id: given by user1_id and user2_id (composite primary key)
  - user1_id: uuid (foreign key to User)
  - user2_id: uuid (foreign key to User)

- Tag
  - id: incrementing integer
  - name: string
  - is_system: boolean (default: false, for predefined categories)
- CookTime enum: ["less than 15", "15-30", "30-60", "60+"]
- PrivacyLevel enum: ["private", "friends_only", "public"]
- IngredientUnit enum: ["g", "kg", "ml", "l", "tsp", "tbsp", "cup", "pcs", "pinch"]
- Ingredient
  - id: uuid
  - recipe_id: uuid (foreign key to Recipe)
  - name: string
  - amount: float
  - unit: IngredientUnit
- Recipe
  - id: uuid
  - title: string
  - description: string
  - hero_image_url: string (from Cloudinary)
  - instructions: string[]
  - time_to_cook: CookTime
  - privacy_level: PrivacyLevel
  - author_id: uuid (foreign key to User)
  - average_rating: float (cached)
  - rating_count: integer (cached)
  - created_at: iso 8601 timestamp
  - deleted_at: iso 8601 timestamp (optional, for soft delete)
- RecipeTag
  - recipe_id: uuid (foreign key to Recipe)
  - tag_id: integer (foreign key to Tag)
  - primary key: (recipe_id, tag_id)
- RecipeGroup
  - recipe_id: uuid (foreign key to Recipe)
  - group_id: uuid (foreign key to Group)
  - primary key: (recipe_id, group_id)

- Cookbook
  - id: uuid
  - title: string
  - description: string
  - owner_id: uuid (foreign key to User)
  - privacy_level: PrivacyLevel
  - created_at: iso 8601 timestamp
  - deleted_at: iso 8601 timestamp (optional)
- CookbookAuthor
  - cookbook_id: uuid (foreign key to Cookbook)
  - user_id: uuid (foreign key to User)
  - primary key: (cookbook_id, user_id)
- CookbookRecipe
  - cookbook_id: uuid (foreign key to Cookbook)
  - recipe_id: uuid (foreign key to Recipe)
  - primary key: (cookbook_id, recipe_id)
- CookbookInvite
  - id: uuid
  - cookbook_id: uuid (foreign key to Cookbook)
  - sender_id: uuid (foreign key to User)
  - receiver_id: uuid (foreign key to User)
  - status: string (pending, accepted, rejected)
  - created_at: iso 8601 timestamp

- RecipeMaker
  - id: uuid
  - recipe_id: uuid (foreign key to Recipe)
  - user_id: uuid (foreign key to User)
  - photo_url: string, optional
  - visibility: PrivacyLevel
  - display_on_recipe_page: boolean
  - comment: string, optional
  - rating: number out of 10, optional
  - created_at: iso 8601 timestamp
- Group
  - id: uuid
  - name: string
  - description: string
- GroupMembership
  - user_id: uuid (foreign key to User)
  - group_id: uuid (foreign key to Group)
  - primary key: (user_id, group_id)
- GroupInvite
  - id: uuid
  - group_id: uuid (foreign key to Group)
  - sender_id: uuid (foreign key to User)
  - receiver_id: uuid (foreign key to User)
  - status: string (pending, accepted, rejected)
  - created_at: iso 8601 timestamp
- Notification
  - id: uuid
  - user_id: uuid (foreign key to User)
  - type: string (e.g., "friend_request", "recipe_made")
  - content: string
  - is_read: boolean (default: false)
  - related_entity_id: uuid (optional)
  - created_at: iso 8601 timestamp


## page structure and routes
app/
├── (home)/             # Groups pages that don't need a sidebar
│   └── page.tsx             # URL: / (The Random Recipe Landing)
│
├── (authenticated)/         # Groups pages that share a Dashboard Sidebar
│   ├── layout.tsx           # Global Sidebar & Navigation
│   ├── dashboard/
│   │   └── page.tsx         # URL: /dashboard (The Feed)
│   │
│   ├── recipes/
│   │   ├── page.tsx         # URL: /recipes (Gallery)
│   │   ├── new/             # URL: /recipes/new
│   │   └── [id]/            # Dynamic Route for specific recipes
│   │       ├── page.tsx     # URL: /recipes/123 (View)
│   │       ├── edit/        # URL: /recipes/123/edit
│   │       └── made/        # URL: /recipes/123/made (Photo upload)
│   │
│   ├── cookbooks/
│   │   ├── page.tsx         # URL: /cookbooks
│   │   ├── new/             # URL: /cookbooks/new
│   │   └── [id]/            # Dynamic Route for cookbooks
│   │       ├── page.tsx     # URL: /cookbooks/456 (View)
│   │       └── manage/      # URL: /cookbooks/456/manage (Collaborators)
│   │
│   └── u/
│       └── [username]/      # Dynamic Route for profiles
│           └── page.tsx     # URL: /u/chef_john
