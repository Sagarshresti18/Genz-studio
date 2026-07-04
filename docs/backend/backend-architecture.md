# Backend Architecture

The backend is a JavaScript Express API that starts small and grows by layering routes, services, and database helpers around a shared HTTP application.

## Architecture Goals

- Keep the API easy to run locally and easy to deploy later.
- Separate startup, Express configuration, validation, and database access.
- Make the Neon PostgreSQL connection a plug-in concern rather than something that blocks the server from starting.
- Keep future features isolated so the codebase can grow without turning `app.ts` into a monolith.

## Runtime Flow

1. `src/server.js` loads the configured port and creates the HTTP server.
2. `src/app.js` creates the Express instance, installs middleware, and mounts routes.
3. `src/config/env.js` loads environment variables from the repo root `.env` first, then `server/.env` if present, and validates them with `zod`.
4. `src/config/database.js` creates a lazy `pg` pool only when `DATABASE_URL` exists.
5. `src/routes/health.js` exposes API and database health checks so the deployment can verify readiness.
6. `src/middleware/errorHandler.js` handles 404 and unexpected errors in one place.

## Current Backend Layers

- `src/server.js` owns process startup, shutdown, and signal handling.
- `src/app.js` owns Express middleware, route mounting, and response formatting.
- `src/config/env.js` owns environment parsing and validation.
- `src/config/database.js` owns the PostgreSQL pool and connection probing.
- `src/routes/health.js` owns the current health endpoints under `/health`.
- `src/middleware/errorHandler.js` owns the fallback HTTP responses.

## Request Pipeline

The current request pipeline is intentionally simple:

- Security and HTTP hardening are applied first with `helmet`.
- Cross-origin access is enabled with `cors`.
- Response compression is enabled with `compression`.
- Cookies and request payloads are parsed before route handlers run.
- Request logging is handled by `morgan`.
- Routes are mounted at the root level.
- Unknown routes fall through to a shared 404 handler.
- Unexpected failures are returned through a single error handler.

## Database Strategy

- The backend uses the `pg` package rather than a heavyweight ORM.
- The PostgreSQL pool is created lazily so the server can start even if the database is not yet configured.
- `DATABASE_URL` is the only database connection value required for Neon.
- In production, SSL is enabled with `rejectUnauthorized: false` so Neon-compatible TLS connections work correctly.
- The `/health/db` endpoint performs a lightweight `SELECT 1` check to confirm connectivity.
- Startup is decoupled from database readiness, which keeps local development and deployment more flexible.

## Environment Variables

The backend currently expects these values:

- `PORT` for the HTTP listener.
- `NODE_ENV` to switch logging and production SSL behavior.
- `DATABASE_URL` for the Neon PostgreSQL connection string.

The repo-level `.env` is the preferred place to store shared values during development.

## Growth Path

- Add feature routes under `src/routes/` and keep one domain per file or folder.
- Move business rules into `src/services/` as soon as a route becomes more than a thin controller.
- Keep database access in small helper modules or repository files instead of embedding SQL directly in routes.
- Add `zod` schemas next to the feature that uses them so request validation stays close to the route.
- Add migrations and seed scripts before introducing core application tables.
