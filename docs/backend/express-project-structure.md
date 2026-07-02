# Express Project Structure

The server is organized so the Express framework setup stays separate from business logic and data access.

```text
server/
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── config/
│   │   ├── env.ts
│   │   └── database.ts
│   ├── middleware/
│   │   └── errorHandler.ts
│   └── routes/
│       └── health.ts
├── dist/
├── package.json
└── tsconfig.json
```

## What Each File Does

- `src/server.ts` bootstraps the HTTP server, listens on `PORT`, and closes the database pool on shutdown.
- `src/app.ts` creates the Express app, applies middleware, mounts the API routes, and attaches error handlers.
- `src/config/env.ts` reads environment variables from the repo root `.env` first and validates them with `zod`.
- `src/config/database.ts` creates the PostgreSQL pool, checks the connection, and closes the pool when the process exits.
- `src/routes/health.ts` contains the current public endpoints for uptime and database readiness checks.
- `src/middleware/errorHandler.ts` keeps 404 and generic error responses consistent.

## Current Folder Intent

- `config/` holds app-wide configuration that should be shared across routes.
- `middleware/` holds cross-cutting Express logic that is not tied to a specific feature.
- `routes/` holds HTTP endpoint definitions grouped by domain.
- `dist/` is the compiled output produced by `npm run build`.

## Current HTTP Surface

- `GET /api` returns a basic API welcome response.
- `GET /api/health` confirms the API is running.
- `GET /api/health/status` shows whether `DATABASE_URL` is configured.
- `GET /api/health/db` checks whether the PostgreSQL connection works.

## Recommended Growth Pattern

1. Create a feature folder in `src/routes/` for each domain such as auth, users, uploads, or billing.
2. Add request validation beside the route before touching database logic.
3. Move business logic into `src/services/` so controllers stay thin.
4. Keep SQL in repository-style helpers or a `src/db/` layer if the project grows.
5. Reuse the shared error handler instead of duplicating fallback responses across routes.

## Suggested Future Folders

These folders do not exist yet, but they are the natural next step once the API gains features:

- `src/services/` for business rules.
- `src/validators/` for reusable `zod` schemas.
- `src/repositories/` for database access helpers.
- `src/types/` for shared TypeScript types.
- `src/utils/` for small pure helpers.
