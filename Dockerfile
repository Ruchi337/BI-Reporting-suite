# Multi-stage Dockerfile for ShopSense AI Platform
# Stage 1: Build and compile frontend and backend bundle
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies first for optimal layer caching
COPY package*.json tsconfig.json ./
RUN npm ci

# Copy all source files
COPY . .

# Compile frontend with Vite and bundle backend with esbuild
RUN npm run build

# Stage 2: Minimal production container
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled production artifacts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/metadata.json ./

# Run as non-root user for container security
USER node

# Expose internal application port
EXPOSE 3000

# Container healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Launch compiled CommonJS server
CMD ["node", "dist/server.cjs"]
