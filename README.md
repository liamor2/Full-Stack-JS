# Full Stack JS Monorepo

This repository uses **pnpm workspaces** to manage a monorepo containing:

| Package | Path | Description |
|---------|------|-------------|
| `@full-stack-js/shared` | `packages/shared` | Shared TypeScript utilities reused by backend & frontend |
| `@full-stack-js/backend` | `backend` | Express API server |
| `@full-stack-js/frontend` | `frontend` | React + Vite SPA |

## Structure

```
pnpm-workspace.yaml
tsconfig.base.json
backend/
frontend/
packages/
  shared/
```

## Getting Started

1. Install dependencies (workspace-wide):
	```bash
	pnpm install
	```
2. Run backend & frontend together:
	```bash
	pnpm dev
	```
3. Or run individually:
	```bash
	pnpm dev:backend
	pnpm dev:frontend
	```

The backend runs at http://localhost:3000 and frontend at http://localhost:5173.

## Shared Package Usage

Import from the shared package in either app:

```ts
import { greet } from '@full-stack-js/shared';
```

The path mapping is configured in `tsconfig.base.json` so TypeScript can resolve the source during development.

## TypeScript Project References

Each package has a `tsconfig.json` with `composite: true` and references the shared package. Build all:

```bash
pnpm build
```

## Docker (Dev) with pnpm

`dockercompose.yml` now builds backend and frontend images using workspace-aware Dockerfiles with `corepack` (pnpm). Each service installs only the filtered dependencies plus the shared package.

Quick start (dev hot reload):
```bash
docker compose up --build
```

Key points:
1. Build context is the repository root so pnpm workspace graph is available.
2. We copy only the needed `package.json` files first for layer caching, then run filtered installs:
	- Backend: `pnpm install --filter @full-stack-js/shared --filter @full-stack-js/backend --frozen-lockfile`
	- Frontend: `pnpm install --filter @full-stack-js/shared --filter @full-stack-js/frontend --frozen-lockfile`
3. Source code is bind-mounted (`.:/repo`) for live reload; container runs `pnpm dev`.
4. Node modules kept inside container layers; extra anonymous volumes mounted to avoid host pollution and preserve symlinks.

### Production Hardening (future)
Use multi-stage builds per service:
1. Install with `--frozen-lockfile` and run `pnpm -r build` (or filtered builds) in a builder stage.
2. Copy only built `dist` (backend) and the compiled frontend `dist` into a slim runtime (e.g. `node:alpine` for backend, `nginx:alpine` for static frontend).
3. Add a `.npmrc` pinning `node-linker=pnpm` and enabling `prefer-offline=true` if desired.

Optional improvement: introduce a root `.dockerignore` to exclude local build artifacts, e.g.
```
node_modules
**/dist
.git
.DS_Store
```

## Lint & Format

```bash
pnpm lint
pnpm format
```

## Future Improvements

- Add testing setup (Vitest / Jest) for shared utilities and backend routes.
- Add environment variable typing and validation (e.g. using Zod).
- Split Docker images for production with multi-stage builds.

---
Happy hacking!
