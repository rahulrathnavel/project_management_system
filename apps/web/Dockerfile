FROM node:20-alpine AS builder

WORKDIR /app

# Copy root configurations
COPY package.json package-lock.json ./
COPY tsconfig.json ./

# Copy WEB app
COPY apps/web/package.json apps/web/

# Install all dependencies using legacy-peer-deps
RUN npm ci --legacy-peer-deps

# Copy source
COPY apps/web/ apps/web/

# Build
RUN cd apps/web && npm run build

# Production image
FROM node:20-alpine AS runner

WORKDIR /app/apps/web

COPY --from=builder /app/apps/web/public ./public
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./.next/static

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "server.js"]

