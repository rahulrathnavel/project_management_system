# Project Management System

A robust, enterprise-grade project management application built with Next.js, NestJS, and PostgreSQL.

## Core Stack

- **Frontend**: Next.js App Router, Tailwind CSS, shadcn/ui, TanStack Query
- **Backend**: NestJS, Prisma ORM, PostgreSQL
- **Security**: JWT Authentication (HttpOnly cookies), bcrypt, Helmet, Throttler
- **Documentation**: Swagger UI (`/api/docs`)

## Getting Started Locally

### 1. Database Setup
Ensure PostgreSQL is running locally on port `5432` with a database named `pms`, or spin it up using Docker:
```bash
docker-compose up -d
```

### 2. Environment Variables
Copy the `.env.example` to `.env` in the root directory.
```bash
cp .env.example .env
```
Ensure `DATABASE_URL` matches your local database credentials.

### 3. Install Dependencies
```bash
npm install
```

### 4. Database Migration
Apply the Prisma schema to your database and generate the Prisma Client:
```bash
npm run db:push
# or
cd apps/api && npx prisma migrate dev
```

### 5. Create an Admin User (RBAC)
Role-Based Access Control is enforced on the `/api/audit` endpoint. Since public registration only creates `USER` accounts, you must create an `ADMIN` securely via the provided server script:
```bash
npm run create:admin --workspace=api <email> <password> "Admin Name"
```

### 6. Run the Application
Start both the frontend and backend in development mode:
```bash
npm run dev
```
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api/docs

## Features Implemented

- **Secure Authentication**: Registration and Login using JWTs securely stored in HttpOnly cookies to prevent XSS.
- **Project & Task Management**: Full CRUD capabilities with enforced validation (e.g., `endDate >= startDate`).
- **Authorization (IDOR Protection)**: Strict ownership checks at the database query level ensure users can never access or modify resources belonging to others.
- **Role-Based Access Control (RBAC)**: Strict `RolesGuard` limits access to sensitive endpoints (e.g., system Audit Logs) to strictly authenticated `ADMIN` users. Registration endpoints automatically drop any role-tampering attempts.
- **Search, Filter & Pagination**: Advanced querying on both projects and tasks.
- **Dashboard Metrics**: Real-time aggregated statistics scoped directly to the authenticated user.
- **Audit Logging**: Successful mutations generate an audit trail mapped to the acting user.
- **Rate Limiting**: Configured to prevent brute-force attacks on the auth endpoints.

## Testing

Integration tests for the backend (including Auth flows and IDOR checks) are provided:
```bash
cd apps/api
npm run test:e2e
```

## Documentation

See the `docs/` folder for:
- [Requirements Mapping](docs/REQUIREMENTS.md)
- [Testing Instructions](docs/TESTING.md)
- [Entity-Relationship Diagram](docs/ER_DIAGRAM.md)

