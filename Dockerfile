# ============================================================================
# Build Stage: Compile TypeScript to JavaScript
# ============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY backend/package*.json ./
COPY backend/tsconfig.json ./

# Install dependencies (including devDependencies for compilation)
RUN npm ci

# Copy source code
COPY backend/src ./src
COPY backend/prisma ./prisma

# Compile TypeScript to JavaScript
RUN npm run build

# Generate Prisma client
RUN npm run generate

# ============================================================================
# Runtime Stage: Minimal production image
# ============================================================================
FROM node:20-alpine AS runtime

WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy compiled code from builder
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

# Switch to non-root user
USER nodejs

# Expose port (default 3000, overridable via -e PORT=xxxx)
ARG PORT=3000
EXPOSE $PORT

# Health check for container orchestrators (Kubernetes, ECS, etc.)
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:${PORT}/health/live', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start server
CMD ["node", "dist/server.js"]
