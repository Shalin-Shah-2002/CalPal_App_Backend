# ============================================
# Stage 1: Dependencies
# ============================================
FROM node:20-alpine AS dependencies

# Install build dependencies for native modules
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    postgresql-client

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
    
# Install all dependencies (including dev dependencies for potential build steps)
RUN npm install --production=false

# ============================================
# Stage 2: Builder
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy node_modules from dependencies stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy application source
COPY . .

# Remove development dependencies
RUN npm prune --production

# ============================================
# Stage 3: Production
# ============================================
FROM node:20-alpine

# Install runtime dependencies
RUN apk add --no-cache \
    curl \
    postgresql-client \
    tini

# Create app directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

# Copy production dependencies from builder
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copy application files
COPY --chown=nodejs:nodejs package*.json ./
COPY --chown=nodejs:nodejs server.js ./
COPY --chown=nodejs:nodejs config ./config
COPY --chown=nodejs:nodejs routes ./routes

# Create necessary directories
RUN mkdir -p logs && \
    chown -R nodejs:nodejs logs

# Switch to non-root user
USER nodejs

# Expose application port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production \
    PORT=3000

# Add labels for better image management
LABEL maintainer="Shalin Shah" \
      version="1.0" \
      description="Calorie Tracking Backend API" \
      project="CalPal_App_Backend"

# Health check - verify server is responding
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

# Use tini to handle signals properly
ENTRYPOINT ["/sbin/tini", "--"]

# Start the application
CMD ["node", "server.js"]
