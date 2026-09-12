FROM node:20-alpine AS builder

WORKDIR /app

# Copy root configurations
COPY package.json package-lock.json ./
COPY tsconfig.json ./

# Copy API app
COPY apps/api/package.json apps/api/
COPY apps/api/prisma apps/api/prisma/

# Install all dependencies using legacy-peer-deps
RUN npm ci --legacy-peer-deps

# Generate Prisma client
RUN cd apps/api && npx prisma generate

# Copy source
COPY apps/api/ apps/api/

# Build
RUN cd apps/api && npm run build

# Production image
FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/

WORKDIR /app/apps/api

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["npm", "run", "start:prod"]

