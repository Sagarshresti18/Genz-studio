# Genz Studio Architecture

## Stack
- Frontend: Angular 20 + Material + SCSS + Signals + Lazy Routing
- Backend: Node.js + Express + TypeScript + JWT + Firebase + Stripe
- Database: MongoDB Atlas via Mongoose
- Storage: Firebase Cloud Storage

## Structure
- `frontend/` Angular enterprise shell and feature modules
- `backend/` REST API with clean modular boundaries
- `shared/` cross-platform contracts
- `docker/` development containers
- `docs/` API and architecture docs

## Clean Architecture Boundaries
- `config/`: infra configuration (env, DB, Firebase)
- `core/`: middleware and shared backend types
- `modules/*`: domain feature modules with controller/service/route slices
