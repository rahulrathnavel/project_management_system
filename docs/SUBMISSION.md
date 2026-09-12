# Project Management System — Final Submission

This document formally presents the final deliverables for the Project Management System assessment. The application has been developed strictly adhering to the requirements provided in the assessment PDF.

## 1. GitHub Repository
[https://github.com/rahulrathnavel/project_management_system](https://github.com/rahulrathnavel/project_management_system)

## 2. Database Schema / ER Diagram
[ER Diagram](ER_DIAGRAM.md)

## 3. API Documentation
- [Interactive Swagger](https://pms-api-eddc.onrender.com/api/docs)
- [API Documentation Markdown](API_DOCUMENTATION.md)

## 4. README
[README](../README.md)

## 5. Deployment URL
[https://pms-web-8dzr.onrender.com](https://pms-web-8dzr.onrender.com)

---

## Technical Summary

### Core Requirements Successfully Implemented
- **Full-Stack Architecture**: Next.js App Router (Frontend) + NestJS REST API (Backend).
- **Authentication**: JWT encapsulated securely in `HttpOnly` cookies. Passwords hashed via `bcrypt`.
- **Database Model**: Strictly normalized PostgreSQL architecture driven by Prisma ORM.
- **Project/Task Workflows**: Complete CRUD support, enforcing strict Cascade deletions.
- **Dashboard Statistics**: Dynamic aggregation of active, completed, and pending records.
- **Security Protocols**: Broad application of IDOR protection, guaranteeing users can strictly read/write solely their own authenticated data sets.

### Bonus / Engineering Enhancements Successfully Implemented
1. **Search, Filtering, and Pagination**: Deeply integrated into the REST API endpoints and surfaced cleanly on the UI.
2. **Multi-Directional Sorting**: Sort project and task lists dynamically.
3. **Audit Log System**: Immutable background tracking of system creation/deletion/update events.
4. **Role-Based Access Control (RBAC)**: A strict separation between `USER` and `ADMIN`. Admins unlock access to the restricted Audit Log UI and API routes.
5. **Programmatic Automated Tests**: Vitest/Supertest E2E security suite that runs headless to prove data isolation barriers.
6. **Docker Orchestration**: Complete containerization setup for simplified deployment reproducibility.
7. **CI/CD Pipeline**: GitHub Actions workflows validating testing status on every code commit.

## Final Verification Checklist
- [x] All functional requirements from the PDF are present.
- [x] Application successfully deploys.
- [x] Database is fully relational.
- [x] `node_modules`, `.env`, and secret keys are securely ignored from version control.
- [x] Application behaves responsively on mobile and desktop viewports.
- [x] Inputs are strictly validated on both frontend and backend to prevent injection and tampering.

### Conclusion
The project has been aggressively tested and finalized. Thank you for your review.
