# Dev Dockerfile for backend using pnpm workspaces
ARG NODE_VERSION=22
FROM node:${NODE_VERSION}-alpine AS base
WORKDIR /repo
ENV PNPM_HOME=/root/.local/share/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable

ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

# Copy lock & workspace files first for caching
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/package.json
COPY backend/package.json backend/package.json

# Install only backend + shared (filter)
RUN pnpm install --filter @full-stack-js/shared --filter @full-stack-js/backend --frozen-lockfile

# Copy source
COPY packages/shared ./packages/shared
COPY backend ./backend

WORKDIR /repo/backend
RUN pnpm -w -F @full-stack-js/shared build
EXPOSE 3000
CMD ["pnpm", "dev"]
