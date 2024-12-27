# Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Enable pnpm using corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files and install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy application source files and data directory
COPY . .
COPY data/ /app/data/

# Define build-time arguments
ARG NEXT_PUBLIC_MEMASTATS_URL=http://memastats:8118
ARG NEXT_PUBLIC_SPARQL_URL=http://mema_fuseki:3030

# Set environment variables for build phase
ENV NEXT_PUBLIC_MEMASTATS_URL=${NEXT_PUBLIC_MEMASTATS_URL}
ENV NEXT_PUBLIC_SPARQL_URL=${NEXT_PUBLIC_SPARQL_URL}

# Debug: Verify variables are passed
RUN echo "Build ENV - MEMASTATS: $NEXT_PUBLIC_MEMASTATS_URL, SPARQL: $NEXT_PUBLIC_SPARQL_URL"

# Build the application
RUN pnpm build

# Production image
FROM node:20-alpine AS runner

WORKDIR /app

# Copy necessary files from builder
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/data ./data

EXPOSE 3000

# Set runtime environment variables
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"
ENV NEXT_PUBLIC_MEMASTATS_URL=http://memastats:8118
ENV NEXT_PUBLIC_SPARQL_URL=http://mema_fuseki:3030

CMD ["node", "server.js"]
