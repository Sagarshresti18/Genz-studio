# Database Design

GenZ Studio uses PostgreSQL on Neon as the persistent data store.

## Design Goals

- Keep the schema easy to evolve.
- Use clear primary keys and timestamps.
- Prepare for auth, projects, assets, and generated content.

## Initial Concepts

- Users and authentication sessions.
- User projects or workspaces.
- Generated media assets.
- Saved prompts or generation history.

## Implementation Notes

- Store the Neon connection string in `DATABASE_URL`.
- Use SSL in production.
- Add migrations before introducing application tables.
- Keep database access behind a small repository layer.
