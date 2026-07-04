# Frontend Architecture

The frontend is an Angular 18+ standalone component application that serves as the user interface for GenZ Studio.

## Current Entry Points

- `client/src/main.ts` bootstraps the app.
- `client/src/app/app.ts` is the root component with routing configuration.
- `client/src/app/app.routes.ts` defines the application routes.

## Architecture Goals

- Keep feature pages isolated by route.
- Use standalone components for better tree-shaking.
- Share CSS variables for consistent theming.
- Keep API access behind service layers.

## UI Theme

- **Color Palette**: White/light theme with blue primary brand color (#2563eb).
- **Typography**: Manrope + Inter system font family.
- **Spacing**: CSS custom properties (--gz-spacing-*).
- **Components**: Card-based layouts with soft shadows and light borders.

## Current Pages

- **Home** (`/` or `/home`) - Public landing page.
- **Login** (`/login`) - Authentication entry point.
- **Register** (`/register`) - Account creation.
- **Workspace** (`/workspace`) - Protected authenticated area:
  - Dashboard - Main entry point with stats and tools.
  - Projects - Visual asset project management.
  - AI Tools - Gallery of available AI tools.
# Frontend Architecture

## Overview

The GenZ Studio frontend is built using Angular 20 and serves as the primary user interface for the platform.

It provides a modern, scalable, and maintainable architecture using Angular Standalone Components, SCSS, and TypeScript.

The frontend communicates with the backend through REST APIs and is responsible only for presentation, user interaction, routing, and client-side validation.

---

# Current Status

Current Phase:

✅ Project Bootstrap

Completed:

- Angular 20 Setup
- Standalone Components
- Angular Router
- SCSS Configuration
- Node.js 22 LTS
- NVM Support
- Git Workflow
- Feature Branch Workflow

Upcoming:

- Angular Material
- Authentication
- Dashboard
- Shared Components
- API Integration

---

# Technology Stack

| Technology | Version |
|------------|---------|
| Angular | 20 |
| TypeScript | Latest |
| SCSS | Enabled |
| Angular Router | Enabled |
| Node.js | 22.23.1 LTS |
| npm | 10.x |

---

# Goals

The frontend is responsible for:

- Authentication UI
- Dashboard
- AI Studio
- Image Generation UI
- Video Generation UI
- Profile Management
- Project Management
- Template Library
- Settings
- Billing Interface

Business logic remains in the backend.

---

# Current Folder Structure

client/

├── src/
│
├── public/
│
├── angular.json
│
├── package.json
│
└── tsconfig.json

---

# Planned Folder Structure

src/

app/

core/

shared/

features/

assets/

styles/

---

# Core Module

The Core module will contain application-wide functionality.

Examples:

- Authentication Service
- API Service
- HTTP Interceptors
- Route Guards
- Constants
- Models

---

# Shared Module

Contains reusable UI components.

Examples:

- Navbar
- Sidebar
- Footer
- Button
- Card
- Dialog
- Loader
- Toast

---

# Feature Modules

Each business feature should be isolated.

Examples:

features/

auth/

dashboard/

editor/

projects/

templates/

profile/

settings/

---

# Styling

The project uses SCSS.

Future structure:

styles/

_variables.scss

_mixins.scss

_theme.scss

_utilities.scss

---

# Routing

Angular Router is enabled.

Future routes:

/

/login

/register

/dashboard

/editor

/projects

/profile

/settings

---

# API Communication

Frontend

↓

REST API

↓

Express Backend

↓

PostgreSQL

All API communication will use Angular HttpClient.

---

# State Management

Current:

Angular Signals where appropriate and component-local state.

Future:

Evaluate the need for a dedicated state management library only if application complexity requires it.

---

# Development Principles

- Keep components small
- Prefer reusable components
- Avoid duplicated code
- Follow Angular Style Guide
- Keep presentation separate from business logic
- Use dependency injection

---

# Future Improvements

- Angular Material
- Lazy Loading
- Route Guards
- Theme Support
- Internationalization (i18n)
- Unit Testing
- Accessibility Improvements

---

# Status

Bootstrap Complete ✅
Ready for Feature Development 🚀