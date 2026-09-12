# Submission Guide

The Project Management System is fully implemented according to the PDF assessment guidelines.

## Quick Start
1. Extract the project and ensure Docker and Node.js (>=20) are installed.
2. Setup environment variables (`cp .env.example .env`). Update `DATABASE_URL` if you want to use a local PostgreSQL instance, or use the provided `docker-compose.yml`.
3. Run `npm install`.
4. Apply Prisma migrations via `npm run db:push`.
5. Run the suite: `npm run dev` to start both the API and Web applications concurrently.

## Verification
- **API Tests**: Validate backend security, IDOR protection, and rate limiting by running `cd apps/api && npm run test:e2e`.
- **UI Testing**: Log into `http://localhost:3000` to interact with the responsive dashboard, manage projects, and oversee tasks.

## Code Quality & Architecture
- **Normalized Schema**: Found in `apps/api/prisma/schema.prisma`. Implements `ON DELETE CASCADE` for Task to Project relation.
- **Data Protection**: Strict user context boundary in API controllers, ensuring `userId` extracted from the JWT limits queries (e.g., in `projects.service.ts` and `tasks.service.ts`).
- **Audit Logging**: An injected `AuditService` passively logs successful data mutations (`CREATE`, `UPDATE`, `DELETE`) across projects and tasks.
- **Frontend Stack**: Next.js App Router providing SSR layouts where appropriate, paired with TanStack Query for caching and instantaneous UI updates upon mutation.

