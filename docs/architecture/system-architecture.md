# System Architecture

GenZ Studio uses a simple client-server architecture.

## Request Flow

1. The Angular client sends HTTP requests to the backend API.
2. The Express server validates and routes each request.
3. Shared middleware applies security, compression, logging, and parsing.
4. Route handlers call service or database code.
5. PostgreSQL stores persistent application data.

## Runtime Boundaries

- The client runs separately from the server in development and production.
- The server reads configuration from environment variables.
- The database is external and will be hosted on Neon.

## Current Backend Behavior

- `GET /api` returns a basic service message.
- `GET /api/health` returns service health and a timestamp.
- `GET /api/health/db` checks the database connection when `DATABASE_URL` is available.
- `GET /api/health/status` reports whether the database is configured.

## Operational Notes

- Production connections should use SSL when connecting to Neon.
- The server can start even if the database is not configured yet.
- Shutdown handlers close the PostgreSQL pool before exiting.
