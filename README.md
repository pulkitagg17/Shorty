# Shorty

A scalable URL shortening service with analytics, caching, and asynchronous processing.

## Architecture

```
Client -> API (Express) -> Redis Cache -> PostgreSQL
                    -> BullMQ Queue -> Worker -> PostgreSQL
```

## Tech Stack

- **Backend**: Node.js, TypeScript, Express, PostgreSQL, Redis, BullMQ
- **Frontend**: React, Vite, TypeScript, Tailwind CSS

## Key Features

- URL shortening and redirection with custom aliases
- User authentication via JWT
- Asynchronous analytics processing using BullMQ queues
- Redis caching for sub-10ms redirects
- Rate limiting and health checks
- Prometheus metrics for observability

## Run Locally

```bash
# Backend
cd backend && npm install && npm run migrate:up && npm run dev

# Frontend
cd frontend && npm install && npm run dev
```

## Project Structure

```
backend/
  src/
    auth/         # Authentication routes and services
    url/          # URL creation and management
    redirect/     # Redirection logic
    analytics/    # Queue-based analytics processing
    infra/        # Database and Redis clients
    middleware/   # Auth, validation, error handling
frontend/
  src/
    pages/        # Dashboard, login, analytics
    components/   # UI components
    api/          # API clients and queries
```
