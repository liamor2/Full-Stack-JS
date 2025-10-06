# Error types and usage

This file documents the typed HTTP error system used by the backend.

## Overview

- `HttpError` is the base class for HTTP-focused exceptions. It includes a `status` property and optional `details`.
- Subclasses provided:
  - `BadRequestError` (400)
  - `UnauthorizedError` (401)
  - `ForbiddenError` (403)
  - `NotFoundError` (404)
  - `ConflictError` (409)

Use these classes inside services/controllers instead of returning `res.status(...).json(...)`. This centralizes formatting and ensures consistent HTTP responses.

## Example usage

Throw an error in a controller or service:

```ts
import { NotFoundError } from "../errors/http.error.js";

if (!resource) throw new NotFoundError("Resource not found");
```

The application mounts a centralized error handler at `app.use(errorHandler)` which maps these errors to JSON responses of the shape `{ error: string, details?: any }`.

## Logger

A small logger wrapper is available at `backend/src/utils/logger.ts`. It currently wraps `console` but can later be replaced with a structured logger.
