# GenZ Studio

An AI-powered creator platform for designing YouTube banners, thumbnails, profile pictures, editing images and videos, and generating AI-powered content—all in one place.

## Architecture

**Backend**: Node.js + Express API (JavaScript, no TypeScript)  
**Frontend**: Angular 18+ standalone components with white/light UI theme  
**Database**: PostgreSQL (Neon optional)

## What This Repo Contains

- `client/` - Angular 18+ frontend with standalone components
- `server/` - Express.js backend in plain JavaScript
- `docs/` - Architecture and development guides

## Prerequisites

- Git
- Node.js `22.23.1`
- npm
- Optional but recommended: `nvm` so contributors can switch Node versions quickly

## Recommended Contributor Flow

### 1. Fork the repository

Create your own fork on GitHub first, then clone your fork locally.

### 2. Clone your fork

```bash
git clone <your-fork-url>
cd Genz-studio
```

### 3. Open the project in your editor

Open the `Genz-studio` folder in VS Code or your preferred IDE.

### 4. Use the correct Node version

This project expects Node `22.23.1`, which is also defined in [.nvmrc](.nvmrc).

If you use `nvm`:

```bash
nvm use
```

If you do not have that version installed, install Node `22.23.1` first, then confirm it with:

```bash
node -v
```

## Install Dependencies

Install the frontend and backend dependencies separately.

### Frontend

```bash
cd client
npm install
```

### Backend

```bash
cd ..
cd server
npm install
```

## Environment Setup

Create a root `.env` file from [.env.example](.env.example) and fill in the values you need.

```env
API_URL=http://localhost:5000/api
APP_NAME=GenZ Studio

PORT=5000
NODE_ENV=development
DATABASE_URL=your_neon_postgres_connection_string
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
```

Notes:

- The backend reads the repo root `.env` file by default.
- `DATABASE_URL` should point to your Neon PostgreSQL instance.
- You can keep separate local secrets out of Git because `.env` is ignored.

## Run the Frontend

From the `client/` folder:

```bash
npm start
```

The Angular app runs at:

```text
http://localhost:4200
```

## Run the Backend

From the `server/` folder:

```bash
npm run dev
```

The Express API runs at:

```text
http://localhost:5000
```

Useful backend endpoints:

- `GET /api`
- `GET /api/health`
- `GET /api/health/status`
- `GET /api/health/db`

## Start Both Apps Together

Open two terminals:

1. Terminal 1: `cd client && npm start`
2. Terminal 2: `cd server && npm run dev`

## Quick Verification

After both apps are running:

- Open `http://localhost:4200` to verify the frontend.
- Open `http://localhost:5000/api` to verify the backend.
- Open `http://localhost:5000/api/health` to verify the API health route.
- Open `http://localhost:5000/api/health/db` after configuring Neon to verify database connectivity.

## Build Commands

Frontend production build:

```bash
cd client
npm run build
```

Backend production build:

```bash
cd server
npm run build
```

## Notes for Contributors

- Do not commit `node_modules`, `dist`, or `.env` files.
- Keep frontend changes inside `client/`.
- Keep backend changes inside `server/`.
- Update the docs when you change setup, ports, or environment variables.
