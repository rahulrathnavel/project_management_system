# Project Management System

A robust, enterprise-grade project management application featuring secure authentication, full task and project lifecycle management, real-time dashboard metrics, and strict Role-Based Access Control (RBAC).

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)](https://github.com/features/actions)
[![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://render.com/)

---

## Overview

This system provides a strictly authorized, high-performance environment for managing projects and their associated tasks. Users can independently track their workloads via a centralized dashboard, securely manipulate data with advanced filtering and sorting, and rest assured that their data is protected by enterprise-level security boundaries. The system includes an administrative layer (RBAC) backed by robust audit logging.

## Key Features

### Core Features
- **Authentication**: Registration and Login using securely hashed passwords (bcrypt).
- **Project Management**: Full CRUD operations. Projects cascade-delete their child tasks.
- **Task Management**: Full CRUD operations with priority and status enums.
- **Dashboard**: Aggregated tracking of total, completed, pending tasks, and active projects.
- **Search & Filtering**: Search projects by name, filter tasks by priority or status.

### Engineering & Bonus Features
- **Pagination**: Efficient server-side pagination across data sets.
- **Sorting**: Multi-directional column sorting.
- **Audit Logs**: Immutable system event tracking (creations, deletions, updates).
- **RBAC (Role-Based Access Control)**: Strictly enforced `USER` and `ADMIN` boundaries.
- **Automated Testing**: 100% passing E2E security and authorization test suite.
- **Docker Support**: Multi-stage `Dockerfile` and `docker-compose.yml` for isolated containerization.
- **CI/CD**: GitHub Actions workflow that actively guards the `master` branch.
- **Deployment**: Production-ready deployment architecture hosted on Render.

## Tech Stack

- **Frontend**: Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui.
- **Backend**: NestJS + REST API architecture.
- **Database**: PostgreSQL.
- **ORM**: Prisma.
- **Authentication**: JWT encapsulated in HttpOnly cookies to prevent XSS.
- **Testing**: Vitest + Supertest for programmatic E2E endpoint verification.
- **CI/CD**: GitHub Actions.
- **Deployment**: Render Web Services.

## Architecture

```mermaid
flowchart TD
    Browser[Client Browser]
    Browser -->|HTTPS/REST| NextJS[Next.js Frontend]
    NextJS -->|Axios/Cookies| NestJS[NestJS REST API]
    NestJS -->|Prisma Client| Prisma[Prisma ORM]
    Prisma -->|TCP| DB[(PostgreSQL)]
```

### Data Ownership Model
Data normalization guarantees strict boundaries:
**User → Projects → Tasks**

Tasks do not have overlapping owner IDs; their ownership is inherently derived and authenticated through their parent Project.

## Security

Security is established at the framework and database layers:
- **Password Protection**: Hashed and salted using `bcrypt`.
- **Authentication**: JWT (JSON Web Tokens) strictly transferred via `HttpOnly`, `Secure`, `SameSite=none` cookies.
- **IDOR Protection**: All read/write operations rigidly append `userId` checks at the database query layer.
- **Input Validation**: NestJS `ValidationPipe` strictly validates DTOs and drops non-whitelisted payload properties.
- **SQL Injection**: Neutralized completely via Prisma's parameterized queries.
- **Rate Limiting**: `@nestjs/throttler` guards authentication endpoints against brute-force attacks.
- **CORS**: Strictly locked to the verified frontend origin.
- **RBAC**: A dedicated `RolesGuard` rejects any non-admin attempting to access system data.

## User Workflow

### Standard User Flow
1. **Register** a new account securely.
2. **Login** to receive an HttpOnly session cookie.
3. **Create Project** providing a title, description, and timeline.
4. **Create Tasks** assigned to that project with status and priority metadata.
5. **Track Progress** on the real-time Dashboard.
6. **Search/Filter** through large data sets using backend pagination.
7. **Logout** to immediately terminate the session.

### Admin Flow
1. Elevated Admin authenticates.
2. The UI unlocks the **Audit Logs** module.
3. The Admin safely reviews the immutable system-wide audit trail.

## Local Development

### Prerequisites
- Node.js (v20+)
- PostgreSQL (v15+) or Docker

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/rahulrathnavel/project_management_system.git
   cd project_management_system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your local PostgreSQL credentials (e.g., `postgres://postgres:123@localhost:5432/pms`).

4. **Initialize Database**
   ```bash
   npm run db:push --workspace=api
   ```

5. **Start Development Servers**
   ```bash
   npm run dev
   ```
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:3001`
   - API Documentation: `http://localhost:3001/api/docs`

## Environment Variables
Reference the `.env.example` file. 
- `DATABASE_URL`: Connection string for PostgreSQL.
- `JWT_SECRET`: Cryptographically secure random string used to sign session tokens.
- `NODE_ENV`: Determines cookie security boundaries (`development` vs `production`).
*(Never commit real values for these variables).*

## Testing
The application employs an aggressive programmatic E2E testing suite utilizing Vitest and Supertest.

Run the test suite:
```bash
npm run test:e2e --workspace=api
```
**Coverage includes:**
- Complete Auth cycle (Registration, Login, Cookie generation).
- IDOR Protection (User A is explicitly blocked from modifying User B's projects).
- RBAC Enforcement (Normal users receive 403 Forbidden when attempting to read the audit log).
- Payload Tampering (Attempts to inject `role: 'ADMIN'` during registration are explicitly rejected with a 400 error).

## API Documentation
The API is strictly typed and heavily documented.

- **Interactive Swagger API Documentation**: [https://pms-api-eddc.onrender.com/api/docs](https://pms-api-eddc.onrender.com/api/docs)
- **API Documentation — Markdown**: [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md)
- **Local Swagger**: `http://localhost:3001/api/docs`

## Database Schema
The database architecture is fully mapped. View the [Entity-Relationship Diagram](docs/ER_DIAGRAM.md).

## Docker
The project can be containerized instantly using the provided Docker configuration.
```bash
docker-compose up --build -d
```
This spins up PostgreSQL, the NestJS API, and the Next.js Frontend in isolated networks.

## CI/CD
A GitHub Actions workflow (`.github/workflows/ci.yml`) is active. It automatically builds the application and executes the full E2E test suite on every push to the `master` branch.

## Deployment
The application is deployed securely in a production environment via Render.

- **Live Application**: [https://pms-web-8dzr.onrender.com](https://pms-web-8dzr.onrender.com)
- **Live API Endpoint**: [https://pms-api-eddc.onrender.com/api](https://pms-api-eddc.onrender.com/api)

*(See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for full architectural details).*

## Project Structure
```text
project_management_system/
├── apps/
│   ├── api/            # NestJS Backend
│   │   ├── prisma/     # Database Schema & Migrations
│   │   ├── src/        # API Source Code
│   │   └── test/       # E2E Test Suite
│   └── web/            # Next.js Frontend
│       ├── src/app/    # Pages & Routing
│       └── src/components/ # UI Components
├── docs/               # Technical Documentation
└── .github/workflows/  # CI/CD Pipelines
```

## Assessment Coverage

| Requirement | Status |
|---|---|
| Authentication | Complete |
| Project CRUD | Complete |
| Task CRUD | Complete |
| Dashboard | Complete |
| Search/Filtering | Complete |
| Security | Complete |
| API Documentation | Complete |
| ER Diagram | Complete |
| Tests | Complete |
| Docker | Complete |
| Pagination | Complete |
| Sorting | Complete |
| Audit Logs | Complete |
| RBAC | Complete |
| CI/CD | Complete |
| Deployment | Complete |

## Submission Links
- **GitHub Repository**: [https://github.com/rahulrathnavel/project_management_system](https://github.com/rahulrathnavel/project_management_system)
- **Live Application**: [https://pms-web-8dzr.onrender.com](https://pms-web-8dzr.onrender.com)
- **ER Diagram**: [docs/ER_DIAGRAM.md](docs/ER_DIAGRAM.md)
- **API Documentation** — [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md)
