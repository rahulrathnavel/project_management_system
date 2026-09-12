# Render Production Deployment Guide

This guide details exactly how to deploy the Project Management System to [Render.com](https://render.com) using a modern, scalable architecture.

## Deployment Architecture

You will create three separate services in Render:
1. **PostgreSQL** (Managed Database)
2. **NestJS API** (Web Service)
3. **Next.js Web** (Web Service)

---

## 1. Deploy the Database

1. In Render, click **New +** > **PostgreSQL**.
2. Name it `pms-db`.
3. Select your preferred region and tier.
4. Click **Create Database**.
5. Once created, copy the **Internal Database URL**. You will need this for the API service.

---

## 2. Deploy the NestJS API

1. In Render, click **New +** > **Web Service**.
2. Connect this GitHub repository.
3. **Name:** `pms-api`
4. **Root Directory:** *(leave blank)*
5. **Environment:** `Node`
6. **Build Command:**
   ```bash
   npm install && npm run build --workspace=api
   ```
7. **Start Command:**
   ```bash
   cd apps/api && npx prisma migrate deploy && cd ../.. && npm run start:prod --workspace=api
   ```
   *(This ensures Prisma migrations run against production before booting the server).*

8. **Advanced Settings > Environment Variables:**
   - `NODE_ENV` = `production` *(Crucial: Enables secure `HttpOnly` and `SameSite=none` cookies for cross-origin authentication).*
   - `DATABASE_URL` = *(Paste the Internal Database URL from Step 1)*
   - `JWT_SECRET` = *(Generate a secure random string, e.g., using `openssl rand -base64 32`)*
   - `FRONTEND_URL` = *(You won't have the exact frontend URL yet. Put a placeholder like `https://pms-web.onrender.com` for now. You MUST update this after Step 3 to match the exact Next.js frontend URL to avoid CORS errors).*

9. **Advanced Settings > Health Check Path:**
   - `/api` *(NestJS answers with a 200 OK here).*

10. Click **Create Web Service**. Wait for it to deploy, then copy the live API URL (e.g., `https://pms-api.onrender.com`).

---

## 3. Deploy the Next.js Frontend

1. In Render, click **New +** > **Web Service**.
2. Connect this GitHub repository.
3. **Name:** `pms-web`
4. **Root Directory:** *(leave blank)*
5. **Environment:** `Node`
6. **Build Command:**
   ```bash
   npm install && npm run build --workspace=web
   ```
7. **Start Command:**
   ```bash
   npm run start --workspace=web
   ```

8. **Advanced Settings > Environment Variables:**
   - `NEXT_PUBLIC_API_URL` = *(Paste your API URL from Step 2, appending `/api`. E.g., `https://pms-api.onrender.com/api`)*

9. Click **Create Web Service**.

---

## 4. Finalize Configuration (Crucial)

Render assigns dynamic URLs. Because this app relies on strict CORS and Secure Cookies:

1. Copy the exact live URL of your deployed Next.js service (e.g., `https://pms-web-xy12.onrender.com`).
2. Go back to your **API Web Service** in Render.
3. Open **Environment**, edit `FRONTEND_URL`, and paste the exact Next.js URL.
4. **Save** and wait for the API to redeploy.

## 5. Verify the Live System

1. Navigate to your live Next.js URL.
2. Register a new user.
3. Login and observe the cookies in your browser's DevTools > Application > Cookies. You should see `Authentication` with `HttpOnly`, `Secure`, and `SameSite=None` flags correctly set by the production backend.
4. Create a Project and Task to verify database writes.

## 6. Create the Live Admin User

To test RBAC in production, utilize Render's powerful Shell feature to run your secure server script directly against the production database.

1. Go to your **API Web Service** dashboard in Render.
2. Click the **Shell** tab on the left sidebar.
3. Run the admin creation command:
   ```bash
   npm run create:admin --workspace=api admin@example.com SecurePassword123! "Live Admin"
   ```
4. Return to your frontend, log in as `admin@example.com`, and verify you can see the **Audit Logs**.
