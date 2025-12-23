# syntax=docker/dockerfile:1

# ========================================
# FourthChat Dockerfile
# Multi-stage build for production
# ========================================

# Stage 1: Builder
FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

# Copy source code and build
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build

# Prune dev dependencies to save space 
RUN npm prune --production

# Stage 2: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built assets
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy production node_modules
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

# Copy database & migration files
COPY --from=builder --chown=nextjs:nodejs /app/drizzle ./drizzle
COPY --from=builder --chown=nextjs:nodejs /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder --chown=nextjs:nodejs /app/lib ./lib
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

# Copy scripts for admin operations & entrypoint
COPY --from=builder --chown=nextjs:nodejs /app/scripts ./scripts
COPY --from=builder --chown=nextjs:nodejs /app/tsconfig.json ./tsconfig.json

# Set permissions
RUN chmod +x ./scripts/docker-entrypoint.sh

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV AUTH_TRUST_HOST=true

ENTRYPOINT ["./scripts/docker-entrypoint.sh"]
CMD ["node", "server.js"]
