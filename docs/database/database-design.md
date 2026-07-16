# Database Design

GenZ Studio uses PostgreSQL on Neon as the persistent data store. 

## Design Goals

- Keep the schema easy to evolve.
- Maintain strict modularity by breaking tables down by application feature.
- Avoid storing raw BLOBs or large binaries in the database; only store paths or URLs.
- Ensure strict ownership tracking via foreign keys linking to the `users` table.

## Modularity via Feature-Based SQL

The database design actively matches the Express.js feature-folder structure. Each domain (e.g., `ai-audio`, `youtube-banner`) contains a local `schema.sql` defining only the exact tables needed for that domain. This ensures that features remain totally self-contained (from their routes and controllers all the way down to their database migrations).

## Implementation Notes

- Store the Neon connection string in `DATABASE_URL`.
- Use SSL in production.
- Database bootstrapping is automated via `npm run db:init`, which correctly enforces the creation order so that core tables (users, projects) are initialized before child tables (assets, features).
- Use `UUID` extensions combined with `pgcrypto` for modern, scalable primary keys (`gen_random_uuid()`).
