# ==============================================================================
# Titah Rakyat: Sovereign of the Living Realm - Backend Production Dockerfile
# Multi-stage lightweight build (Node.js 20 Alpine)
# ==============================================================================

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache openssl

# Copy package descriptors
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies and generate Prisma client
RUN npm ci
RUN npx prisma generate

# Copy source and typescript config
COPY tsconfig.json ./
COPY src ./src/

# Compile TypeScript to JavaScript
RUN npm run build

# Stage 2: Production Runner
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

RUN apk add --no-cache openssl

# Copy package files and production node_modules
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --omit=dev && npm cache clean --force
RUN npx prisma generate

# Copy compiled artifacts from builder
COPY --from=builder /app/dist ./dist

# Non-root secure user
USER node

EXPOSE 3001

CMD ["node", "dist/src/server.js"]
