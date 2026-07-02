# Folder Structure

The repository is split into a frontend client, a backend server, and a docs area.

```text
Genz-studio/
├── client/                  # Angular frontend
├── server/                  # Express + TypeScript backend
├── docs/                    # Engineering and product documentation
├── .env                     # Root environment variables
├── .env.example             # Example environment variables
└── README.md                # Project overview
```

## Client

- `client/src/main.ts` bootstraps the Angular app.
- `client/src/app/` contains the root app component, routes, styles, and config.

## Server

- `server/src/server.ts` starts the HTTP server.
- `server/src/app.ts` configures middleware and routes.
- `server/src/config/` holds environment and database setup.
- `server/src/routes/` contains route modules such as health checks.
- `server/src/middleware/` contains shared request handlers.

## Docs

- `docs/architecture/` describes the platform-level design.
- `docs/backend/` explains the server architecture.
- `docs/database/` documents the schema and design plan.
- `docs/development/` contains setup and contribution guidance.
- `docs/frontend/` captures frontend conventions.
- `docs/product/` tracks feature direction and roadmap.
