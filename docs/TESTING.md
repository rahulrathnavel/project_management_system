# Testing Workflow

This document outlines how to manually verify the Project Management System locally.

## Prerequisites

1. Ensure PostgreSQL is running on `localhost:5432` and the `pms` database exists (or update `.env` to match your local config).
2. Start the backend: `cd apps/api && npm run start:dev` (runs on `http://localhost:3001`).
3. Start the frontend: `cd apps/web && npm run dev` (runs on `http://localhost:3000`).

## 1. Authentication & Security
- **Registration**: Navigate to `http://localhost:3000/auth/register`. Create an account.
- **Login**: Navigate to `/auth/login`. You should receive an `HttpOnly` cookie for security.
- **Rate Limiting**: Refresh the login endpoint >10 times rapidly (or use Postman) to trigger the `429 Too Many Requests` response.

## 2. Dashboard
- View aggregate metrics: Total Projects, Total Tasks, Pending Tasks, Completed Tasks.
- Create projects/tasks and observe the numbers update dynamically (TanStack Query handles the caching and revalidation).

## 3. Project Management (CRUD & IDOR)
- **Create**: Navigate to `Projects > Create Project`. Validate the "End Date must be greater than or equal to Start Date" logic.
- **Listing**: Search for projects by name, and sort/paginate them.
- **Update**: Edit the project details.
- **Delete**: Deleting a project will cascade-delete all its associated tasks.
- **IDOR Check**: Create a second account. Try to edit/view the first account's project using its UUID in the URL. The system will throw a 403/404.

## 4. Task Management
- Navigate to the Tasks listing.
- Test the drop-down filter by selecting specific projects to view their tasks.
- Create tasks linked to your existing projects.
- Verify that attempting to create a task for a project ID owned by another user fails.

## 5. Automated Tests
- You can run the backend integration suite via:
  ```bash
  cd apps/api
  npm run test:e2e
  ```
- This suite automatically checks:
  1. Auth paths and rate-limit bounds.
  2. IDOR prevention (`User B cannot access User A's projects`).

