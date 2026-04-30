# Cookeasy

A cooking-focused social media platform designed to bridge the gap between static recipe storage and active community sharing. Built with Next.js 15+ and Go (Gin).

## Local dev setup:

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v20+)
- [pnpm](https://pnpm.io/)
- [Go](https://go.dev/) (v1.23+)
- [Docker](https://www.docker.com/) (for PostgreSQL)

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Setup Database
Start the local PostgreSQL instance using Docker:
```bash
pnpm db:up
```

### 4. Build the Project
Build both the frontend and backend:
```bash
pnpm build
```
Or build them individually:
- `pnpm build:frontend`
- `pnpm build:backend`

### 5. Run Development Server
Start both servers concurrently:
```bash
pnpm dev
```
Access the app at `http://localhost:3000`.

### 6. Testing
Run frontend unit tests:
```bash
pnpm test:frontend
```

Run backend integration tests:
```bash
pnpm test:backend
```



## Planned features:

- Friend management
- Creating friend groups
- Recipe creation and editing
- Recipe search and filtering
- Recipe rating and reviews
- Recipe sharing
- Cookbook creation, organization, and sharing, collaboration


## Keep in mind:
- NICE data
