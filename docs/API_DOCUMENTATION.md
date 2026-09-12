# API Documentation

The Project Management System exposes a strictly validated REST API built with NestJS.

**Base URL**: `/api`
**Live Production API**: `https://pms-api-eddc.onrender.com/api`

## Authentication

All authentication endpoints use `@nestjs/throttler` to prevent brute-force attacks. Successful login issues an `HttpOnly` JWT cookie.

### Register a User
- **Method**: `POST /auth/register`
- **Auth Required**: No
- **Body Request**:
  ```json
  {
    "fullName": "John Doe",
    "email": "john@example.com",
    "password": "SecurePassword123!"
  }
  ```
- **Response** (`201 Created`):
  ```json
  {
    "id": "uuid",
    "fullName": "John Doe",
    "email": "john@example.com",
    "role": "USER"
  }
  ```

### Login
- **Method**: `POST /auth/login`
- **Auth Required**: No
- **Body Request**:
  ```json
  {
    "email": "john@example.com",
    "password": "SecurePassword123!"
  }
  ```
- **Response** (`200 OK`): Returns user object and sets `Authentication` HttpOnly cookie.

### Logout
- **Method**: `POST /auth/logout`
- **Auth Required**: No (but typically called when authenticated)
- **Response** (`200 OK`): Clears the `Authentication` cookie.

### Get Current User
- **Method**: `GET /auth/me`
- **Auth Required**: Yes (JWT)
- **Response** (`200 OK`): Returns the currently authenticated user's profile.

---

## Projects

All project endpoints require authentication and automatically scope data to the currently authenticated user (IDOR protection).

### List Projects
- **Method**: `GET /projects`
- **Auth Required**: Yes
- **Query Parameters**:
  - `page` (number, default: 1)
  - `limit` (number, default: 10)
  - `search` (string, optional)
  - `sortBy` (string, optional - e.g., 'createdAt')
  - `sortDir` ('asc' | 'desc', default: 'desc')
- **Response** (`200 OK`):
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "name": "Project Alpha",
        "description": "Important project",
        "status": "IN_PROGRESS",
        "startDate": "2026-09-01T00:00:00Z",
        "endDate": "2026-10-01T00:00:00Z"
      }
    ],
    "meta": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
  ```

### Create Project
- **Method**: `POST /projects`
- **Auth Required**: Yes
- **Body Request**:
  - `name` (string, required)
  - `description` (string, optional)
  - `status` (Enum: `NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`, optional)
  - `startDate` (ISO Date, optional)
  - `endDate` (ISO Date, optional, must be after startDate)
- **Response** (`201 Created`): Returns the created project.

### Get Project Details
- **Method**: `GET /projects/:id`
- **Auth Required**: Yes (Must be the owner)
- **Response** (`200 OK`): Returns project details.
- **Error**: `404 Not Found` if the project doesn't exist or is owned by another user.

### Update Project
- **Method**: `PUT /projects/:id`
- **Auth Required**: Yes (Must be the owner)
- **Body Request**: Same as Create (all fields optional).
- **Response** (`200 OK`): Returns updated project.

### Delete Project
- **Method**: `DELETE /projects/:id`
- **Auth Required**: Yes (Must be the owner)
- **Response** (`200 OK`): Deletes project and cascade-deletes all associated tasks.

---

## Tasks

Tasks are inherently tied to projects. A user can only manage tasks associated with their own projects.

### List Tasks
- **Method**: `GET /tasks`
- **Auth Required**: Yes
- **Query Parameters**:
  - `projectId` (string, optional)
  - `status` (Enum: `PENDING`, `IN_PROGRESS`, `COMPLETED`, optional)
  - `priority` (Enum: `LOW`, `MEDIUM`, `HIGH`, optional)
  - `page`, `limit`, `sortBy`, `sortDir` (Standard pagination/sorting)
- **Response** (`200 OK`): Paginated list of tasks.

### Create Task
- **Method**: `POST /tasks`
- **Auth Required**: Yes (Must own the parent project)
- **Body Request**:
  - `projectId` (uuid, required)
  - `name` (string, required)
  - `description` (string, optional)
  - `priority` (Enum, optional)
  - `status` (Enum, optional)
  - `dueDate` (ISO Date, optional)
- **Response** (`201 Created`): Returns the created task.

### Get / Update / Delete Task
- **Method**: `GET /tasks/:id` | `PUT /tasks/:id` | `DELETE /tasks/:id`
- **Auth Required**: Yes (Must own the parent project)

---

## Dashboard

### Get Statistics
- **Method**: `GET /dashboard`
- **Auth Required**: Yes
- **Response** (`200 OK`):
  ```json
  {
    "totalProjects": 5,
    "activeProjects": 2,
    "totalTasks": 24,
    "pendingTasks": 10,
    "completedTasks": 14
  }
  ```

---

## Administration

### Get Audit Logs
- **Method**: `GET /audit`
- **Auth Required**: Yes (**Must have `ADMIN` role**)
- **Query Parameters**: Standard pagination constraints.
- **Response** (`200 OK`): Paginated immutable system logs tracking creation/deletion events.
- **Error**: `403 Forbidden` if a standard `USER` attempts to access the route.
