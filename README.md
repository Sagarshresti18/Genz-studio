# Genz Studio

Enterprise-grade SaaS foundation for an AI-powered creator platform inspired by Canva, Adobe Express, Figma, and Notion.

## Tech Stack
- **Frontend:** Angular 20, Angular Material, SCSS, TypeScript, Angular Signals, Angular Router
- **Backend:** Node.js, Express.js, TypeScript, JWT auth, Firebase auth hooks, Stripe-ready billing
- **Database:** MongoDB Atlas with Mongoose
- **Storage:** Firebase Cloud Storage
- **DevOps:** Docker development containers

## Project Structure
- `frontend/` Angular app with lazy-loaded feature modules, shared UI, route guards, and dark/light theme
- `backend/` REST API architecture with modular controller/service/route slices
- `shared/` cross-layer contracts
- `docker/` development Dockerfiles and compose setup
- `docs/` architecture and OpenAPI docs
- `.github/` repository automation/configuration space

## Run Locally
### Frontend
```bash
cd frontend
npm install
npm start
```

### Backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### Docker (Development)
```bash
docker compose -f docker/docker-compose.dev.yml up --build
```
