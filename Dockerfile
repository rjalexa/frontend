# Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Enable pnpm using corepack
RUN corepack enable \
    && corepack prepare pnpm@latest --activate

# Copy package files and install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy application source files and data directory
COPY . .
COPY data/ /app/data/

# Set build-time argument and environment variable
ARG NEXT_PUBLIC_MEMASTATS_URL=http://memastats:8118
ENV NEXT_PUBLIC_MEMASTATS_URL=${NEXT_PUBLIC_MEMASTATS_URL}

# Build the application
RUN echo "NEXT_PUBLIC_MEMASTATS_URL=${NEXT_PUBLIC_MEMASTATS_URL}" && pnpm build

# Production image, copy build output
FROM node:20-alpine AS runner

WORKDIR /app

# Copy necessary files from builder
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/data ./data

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"
ENV NEXT_PUBLIC_MEMASTATS_URL=http://memastats:8118

CMD ["node", "server.js"]
