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

### Backend (Node.js + Express)

```bash
cd server
npm run dev
```

The API listens on `http://localhost:${PORT}` (default: 5000).

### Frontend (Angular)

In another terminal:

```bash
cd client
ng serve
```

The app loads at `http://localhost:4200`.

## Verify

**Backend API:**
- `GET /health` - API status
- `GET /health/db` - Database connection status

**Frontend Routes:**
- `/` or `/home` - Landing page
- `/login` - User authentication
- `/register` - Account creation
- `/workspace/dashboard` - Main dashboard (requires login)
- `/workspace/projects` - Project management
- `/workspace/ai-tools` - AI tools gallery
