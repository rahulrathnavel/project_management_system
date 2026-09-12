# Project Requirements Matrix

This document explicitly verifies that **every single requirement** from the original assessment PDF has been implemented and successfully verified.

## 1. Authentication
- [x] User Registration endpoint (`POST /api/auth/register`).
- [x] User Login endpoint (`POST /api/auth/login`).
- [x] User Logout endpoint (`POST /api/auth/logout`).
- [x] Passwords securely hashed using `bcrypt` prior to database insertion.
- [x] JSON Web Tokens (JWT) generated upon successful authentication.
- [x] JWT strictly encapsulated in `HttpOnly`, `Secure`, `SameSite=none` cookies.
- [x] User Fields: `id`, `fullName`, `email` (unique constraint), `passwordHash`.
- [x] Protected APIs utilizing a global `JwtAuthGuard`.

## 2. Project Management
- [x] Create Project (`POST /api/projects`).
- [x] View Projects (`GET /api/projects`).
- [x] Edit Project (`PUT /api/projects/:id`).
- [x] Delete Project (`DELETE /api/projects/:id`).
- [x] Project Fields: `id`, `name`, `description`, `status` (Enum), `startDate`, `endDate`.
- [x] Enum values strictly validated: `NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`.
- [x] Cascade deletion: Deleting a project automatically deletes all related tasks.

## 3. Task Management
- [x] Create Task (`POST /api/tasks`).
- [x] Edit Task (`PUT /api/tasks/:id`).
- [x] Delete Task (`DELETE /api/tasks/:id`).
- [x] View Tasks (`GET /api/tasks`).
- [x] Task Fields: `id`, `projectId`, `name`, `description`, `status`, `priority`, `dueDate`.
- [x] Priority Enum: `LOW`, `MEDIUM`, `HIGH`.
- [x] Status Enum: `PENDING`, `IN_PROGRESS`, `COMPLETED`.

## 4. Dashboard
- [x] Interactive UI rendering aggregated user statistics.
- [x] Total Projects metric.
- [x] Total Tasks metric.
- [x] Completed Tasks metric.
- [x] Pending Tasks metric.
- [x] Projects in Progress metric.

## 5. Security & Authorization
- [x] **IDOR Protection**: Verified that User A absolutely cannot read, edit, or delete User B's projects or tasks.
- [x] **Relational Integrity**: Fully normalized DB schema via Prisma.
- [x] **SQL Injection**: Neutralized using Prisma's parameterized queries.
- [x] **Rate Limiting**: Applied strictly to authentication endpoints to prevent brute-force attacks.
- [x] **Input Validation**: DTOs validated using `class-validator`, stripping any injected non-whitelisted payload properties.

## 6. Frontend UI / UX
- [x] Responsive layout adapting to mobile and desktop screens.
- [x] State handled seamlessly with TanStack Query.
- [x] Loading states represented by Skeleton components.
- [x] Graceful error handling (Toast notifications).
- [x] Clear data tables with interactive functionality.

## 7. Submission Artifacts
- [x] GitHub Repository.
- [x] Database Schema / ER Diagram.
- [x] API Documentation (Swagger).
- [x] Professional README.
- [x] Deployment URL.
- [x] Setup Documentation.

---

## 8. Bonus Features Implemented

The assessment listed optional bonus features. **All** of them have been successfully implemented and tested.

- [x] **Search & Filtering**: Search projects by name; filter tasks by priority and status.
- [x] **Pagination**: Server-side pagination supported across API endpoints.
- [x] **Sorting**: Multi-column ascending/descending sorting support.
- [x] **Audit Logs**: Successful mutations tracked in the `AuditLog` table.
- [x] **Role-Based Access Control (RBAC)**: Strict `RolesGuard` added. Admins can view audit logs; normal users are forcefully rejected with `403 Forbidden`.
- [x] **Docker Support**: Provided `docker-compose.yml` and `Dockerfile`.
- [x] **Automated Tests**: Vitest/Supertest E2E suite covering authentication, RBAC, and IDOR protection.
- [x] **CI/CD Pipeline**: GitHub Actions configured to verify types and test success on every commit to `master`.
- [x] **Cloud Deployment**: Deployed production-ready architecture natively to Render.
