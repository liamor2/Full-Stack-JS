# Dev Dockerfile for frontend using pnpm workspaces
ARG NODE_VERSION=22
FROM node:${NODE_VERSION}-alpine AS base
WORKDIR /repo
ENV PNPM_HOME=/root/.local/share/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable

# Copy lock & workspace files first for caching
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/package.json
COPY frontend/package.json frontend/package.json

# Install frontend + shared
RUN pnpm install --filter @full-stack-js/shared --filter @full-stack-js/frontend --frozen-lockfile

# Copy sources
COPY packages/shared ./packages/shared
COPY frontend ./frontend

WORKDIR /repo/frontend
EXPOSE 5173
CMD ["pnpm", "dev", "--host", "0.0.0.0"]
