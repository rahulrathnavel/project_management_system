# Entity-Relationship Diagram

This system uses a normalized PostgreSQL schema with Prisma ORM.

```mermaid
erDiagram
    User ||--o{ Project : "owns (1:N, ON DELETE CASCADE)"
    User ||--o{ AuditLog : "triggers (1:N, ON DELETE SET NULL)"
    Project ||--o{ Task : "contains (1:N, ON DELETE CASCADE)"

    User {
        String id PK
        String email UK
        String passwordHash
        String fullName
        Enum role "USER | ADMIN"
        DateTime createdAt
        DateTime updatedAt
    }

    Project {
        String id PK
        String userId FK
        String name
        String description
        Enum status "NOT_STARTED | IN_PROGRESS | COMPLETED"
        DateTime startDate
        DateTime endDate
        DateTime createdAt
        DateTime updatedAt
    }

    Task {
        String id PK
        String projectId FK
        String name
        String description
        Enum priority "LOW | MEDIUM | HIGH"
        Enum status "PENDING | IN_PROGRESS | COMPLETED"
        DateTime dueDate
        DateTime createdAt
        DateTime updatedAt
    }

    AuditLog {
        String id PK
        String userId FK "ON DELETE SET NULL"
        String action
        String entityName
        String entityId
        DateTime createdAt
    }
```

## Relationships

1. **User → Project**: A user can create and own multiple projects. A project strictly belongs to exactly one user.
2. **Project → Task**: A project contains multiple tasks. If a project is deleted, its tasks are automatically cascade-deleted.
3. **User → AuditLog**: System actions (Create/Update/Delete) generate audit logs tied to the user performing the action. If a user is deleted, their associated audit logs nullify the `userId` to retain historical context without violating foreign key constraints.

