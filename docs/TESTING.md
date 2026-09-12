# Testing Methodology

This document explicitly outlines the testing coverage implemented to guarantee application integrity, security, and functional completeness. 

The strategy consists of a robust automated programmatic suite (E2E) and structured manual verification flows.

---

## 1. Automated Testing Suite (E2E)

The backend (`apps/api`) utilizes Vitest and Supertest to programmatically execute integration tests against a live (isolated) database instance. 

**Execution Command:**
```bash
npm run test:e2e --workspace=api
```
*(Tests must be executed sequentially with `--fileParallelism false` to prevent database race conditions).*

### Automated Coverage Highlights
- **Authentication & Validation:** 
  - Validates successful registration and login. 
  - Asserts that missing or malformed payload fields (`class-validator`) are dropped or rejected with `400 Bad Request`.
  - Asserts that JWT tokens are correctly attached to `HttpOnly` headers (`res.headers['set-cookie']`).
- **Authorization & IDOR (Insecure Direct Object Reference):**
  - Explicitly creates `User A` and `User B`. 
  - Attempts to have `User B` read, update, or delete `User A`'s project by injecting their UUID into the endpoint. 
  - Asserts that the system successfully rejects the attack with `404 Not Found` or `403 Forbidden`.
- **Role-Based Access Control (RBAC):**
  - Asserts that normal `USER` accounts receive `403 Forbidden` when attempting to hit `GET /api/audit`.
  - Asserts that malicious attempts to tamper with the registration payload (e.g., `{"email": "...", "password": "...", "role": "ADMIN"}`) are safely intercepted and stripped by the validation layer.

---

## 2. Manual Verification Workflow

Automated tests prove security boundaries; manual tests prove UX and feature completeness. Follow this workflow on the live deployment or local environment.

### A. Authentication & UI Validation
1. Navigate to `/auth/register`. Input an invalid email. Observe the frontend Zod validation block submission.
2. Complete registration and redirect to login.
3. Rapidly submit the login form >10 times. Observe the backend rate limiter (`@nestjs/throttler`) respond with `429 Too Many Requests`.

### B. Project & Task Lifecycle
1. Navigate to the **Projects** page. Click **New Project**.
2. Create a project. Ensure `EndDate` is validated to be after `StartDate`.
3. Create several tasks underneath this project with varying priorities (`HIGH`, `MEDIUM`, `LOW`) and statuses (`PENDING`, `COMPLETED`).
4. Navigate to the **Dashboard** and confirm the statistics (e.g., "Completed Tasks") update instantly.

### C. Advanced Queries (Filtering, Sorting, Pagination)
1. On the **Projects** page, use the Search bar to query a specific project string.
2. Sort projects dynamically using the column headers.
3. On the **Tasks** page, utilize the drop-down filters to filter exclusively by `Priority: HIGH`.

### D. Cascade Integrity
1. Delete the created Project.
2. Navigate to the **Tasks** page and verify that all associated tasks were instantly and safely cascade-deleted by Prisma.

### E. Admin & Audit Logs
1. Ensure you have an Admin account (created via `npm run create:admin`).
2. Login as the Admin.
3. Verify the **Audit Logs** navigation link appears in the sidebar.
4. Click Audit Logs and review the immutable historical tracking of your Project and Task creations/deletions.
