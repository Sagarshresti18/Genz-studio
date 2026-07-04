# Tech Stack

GenZ Studio is organized as a two-package workspace with an Angular frontend and a Node.js backend.

## Frontend

- Angular 20 for the client application.
- TypeScript for all application code.
- SCSS for component and global styling.

## Backend

- Node.js 22+ runtime.
- Express.js for HTTP APIs.
- JavaScript (ES6+) for server code.
- `pg` for PostgreSQL connectivity.
- `dotenv` and `zod` for environment loading and validation.

## Database

- PostgreSQL hosted on Neon.
- Connection string supplied through `DATABASE_URL`.

## Cross-cutting Libraries

- `cors` for browser access.
- `helmet` for security headers.
- `compression` for response compression.
- `cookie-parser` for cookie handling.
- `morgan` for request logging.
- `jsonwebtoken` and `bcrypt` for auth-related work.
