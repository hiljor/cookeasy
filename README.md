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

## Deployment

### Backend Security (Gin Proxies)
When deploying the Go backend behind a reverse proxy or load balancer (e.g., Nginx, Cloudflare, AWS ALB), you must configure the trusted proxies to prevent IP spoofing.

The application reads this configuration from the `TRUSTED_PROXIES` environment variable (a comma-separated list of IP addresses).

1. Update your `.env` file (or CI/CD environment variables):
   ```env
   TRUSTED_PROXIES=192.168.1.1,10.0.0.1
   ```
2. If the variable is empty or missing, the backend defaults to "trust no proxies" for security.

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
