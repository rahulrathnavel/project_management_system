# Project Requirements Checklist

All requirements from the provided PDF assessment have been implemented.

## Core Setup & Architecture
- [x] Use specified stack: Next.js (App Router), NestJS, PostgreSQL, Prisma.
- [x] Clear architectural split between frontend (`apps/web`) and backend (`apps/api`).
- [x] Dockerization support (`docker-compose.yml` and `Dockerfile`).

## Backend Features
- [x] RESTful API matching exact paths (`/api/auth/*`, `/api/projects/*`, `/api/tasks/*`).
- [x] Global exception handling and DTO validation.
- [x] Authentication using `passport-jwt` with `HttpOnly` cookies.
- [x] Role-Based Access Control setup (Admin/User).
- [x] IDOR protection at the DB level ensuring users can only read/write their own data.
- [x] Rate limiting applied to `/api/auth/*` endpoints (`@nestjs/throttler`).
- [x] Swagger API Documentation (`/api/docs`).

## Frontend Features
- [x] Client-side state managed by TanStack Query.
- [x] Responsive UI built with Tailwind CSS and shadcn/ui.
- [x] Interactive Dashboard rendering project/task statistics.
- [x] Pagination, filtering, and sorting applied to project and task lists.
- [x] Authentication flows (Login/Register/Logout) without exposing JWTs to JS.

## Advanced & Bonus Features (Implemented)
- [x] Audit Logs capturing successful data mutations.
- [x] Global rate-limiting constraints configured.
- [x] Automated Integration Tests covering RBAC, IDOR, and auth flows.
- [x] Deployment-ready CI/CD scaffolding (GitHub Actions).

## Documentation
- [x] Clean architecture documented in `AGENTS.md`.
- [x] Visual Data Model via `ER_DIAGRAM.md`.
- [x] Clear Testing and Submission steps.

