FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="${PNPM_HOME}:${PATH}"
RUN corepack enable

FROM base AS deps
WORKDIR /app
# Copy all workspace manifests so pnpm resolves the monorepo correctly
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/ui/package.json ./packages/ui/
COPY packages/notifications/package.json ./packages/notifications/
RUN pnpm install --frozen-lockfile

FROM deps AS build
WORKDIR /app
COPY . .
# DATABASE_URL: required by prisma generate at build time; overridden at runtime via docker-compose
ARG DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mallhub?schema=public"
ENV DATABASE_URL=$DATABASE_URL
# VITE_ vars are baked into the bundle by Vite at build time; .env is excluded by .dockerignore
ARG VITE_APP_API_URL="http://localhost:3000"
ENV VITE_APP_API_URL=$VITE_APP_API_URL
RUN pnpm build

RUN chmod +x docker-entrypoint.sh
EXPOSE 3000
ENTRYPOINT ["./docker-entrypoint.sh"]
