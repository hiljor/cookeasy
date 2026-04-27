# Cookeasy

## Project abstract
Cookeasy is a web application designed as a cooking and baking social media platform. It allows users to share their recipes, see a feed of other people's recipes, and interact with the community.

## Features
- Friend management
- Creating friend groups
- Recipe creation and editing
- Recipe search and filtering
- Recipe rating
- Recipe sharing
- Cookbook creation, organization, and sharing, collaboration

## Project organisation
The project will be a monorepo containing both frontend and backend code organised in separate folders.

## Tech stack
- Frontend: 
  - Next.js, newest version 
  - React, 19.2
  - TypeScript, 6.0
  - Tailwind CSS v4.0
  - Zod v4.3.6, for schema validation of incoming data
  - vitest for unit and integration tests, Cypress for end-to-end tests.
- Backend: 
  - golang
  - Gin
  - GORM
  - saving images: suggest and ask me to choose.
- Database: PostgreSQL
- Authentication: Suggest based on the project specification and user stories and ask me to choose.
- Hosting: 
  - Vercel for frontend
  - Suggest and let me choose for backend
  - Suggest and let me choose for database
- CI/CD: GitHub Actions
- docker for containerization of the backend and database for development and testing
- kubernetes for orchestration of the backend and database in production with service and deployment manifests
- indexing and recipe search: suggest and ask me to choose.

## Project management
- Project specification and user stories will be documented in the DOCS folder in the root of the project.
- git will be used for version control, with a main branch and feature branches for each new feature or bug fix.

## Data model
- User
  - id: uuid
  - username: string
  - email: string
  - password: string (hashed)
  - bio: string
  - profile_picture_url: string
  - created_at: iso 8601 timestamp
- Recipe
  - id: uuid
  - title: string
  - description: string
  - ingredients: string[]
  - instructions: string[]
  - author_id: uuid (foreign key to User)
  - public: boolean
  - created_at: iso 8601 timestamp
- Tag
  - id: incrementing integer
  - name: string
- RecipeTag
  - id: given by recipe_id and tag_name (composite primary key)
  - recipe_id: uuid (foreign key to Recipe)
  - tag_id: integer (foreign key to Tag)
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
- Cookbook
  - id: uuid
  - title: string
  - description: string
  - authors: uuid[] (foreign keys to User)
  - recipes: uuid[] (foreign keys to Recipe)
  - public: boolean
  - created_at: iso 8601 timestamp
- RecipeMaker
  - id: uuid
  - recipe_id: uuid (foreign key to Recipe)
  - user_id: uuid (foreign key to User)
  - photo_url: string, optional
  - display_on_recipe_page: boolean
  - comment: string, optional
  - rating: number out of 10, optional
  - created_at: iso 8601 timestamp
- Group
  - id: uuid
  - name: string
  - description: string
- GroupMembership
  - id: given by user_id and group_id (composite primary key)
  - user_id: uuid (foreign key to User)
  - group_id: uuid (foreign key to Group)


## page structure and routes
app/
├── (marketing)/             # Groups pages that don't need a sidebar
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
│