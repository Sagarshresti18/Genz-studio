# Setup

## Prerequisites

- Node.js 22.x
- npm
- Git
- A Neon PostgreSQL database for backend persistence

## Install

```bash
git clone <repo-url>
cd Genz-studio

cd client
npm install

cd ../server
npm install
```

## Environment Variables

Create or update the root `.env` file with:

```env
PORT=8080
NODE_ENV=development
DATABASE_URL=<your-neon-postgres-connection-string>
```

The server also accepts a local `server/.env`, but the root `.env` is the primary source.

## Run Locally

```bash
cd server
npm run dev
```

The API will be available at `http://localhost:8080`.

## Verify

- `GET /api` checks that the API is alive.
- `GET /api/health` checks the service response.
- `GET /api/health/db` checks the Neon connection once `DATABASE_URL` is set.
