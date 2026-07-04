# Frontend Routing

## Overview

GenZ Studio uses Angular Router with standalone components for client-side navigation. Routes follow a feature-based structure organized by public, auth, and workspace areas.

## Current Routes

### Public Routes

- `/` → Redirects to `/home`
- `/home` - Public landing page
- `/login` - User login
- `/register` - User registration

### Protected Routes (Workspace)

- `/workspace/dashboard` - Main dashboard with stats and recent projects
- `/workspace/projects` - Project management interface
- `/workspace/ai-tools` - AI tools gallery

## Route Configuration

Routes are defined in `app/app.routes.ts` using standalone component routing. The layout is managed by `WorkspaceLayoutComponent` which wraps protected workspace routes.

## Best Practices

- Keep routes feature-based.
- Use the layout wrapper for authenticated pages.
- Lazy load feature components where appropriate.
- Use route guards for access control.
# Frontend Routing

## Overview

GenZ Studio uses Angular Router for client-side navigation.

The application follows a feature-based routing approach.

---

# Current Status

Routing is enabled.

No application routes have been implemented yet.

---

# Planned Routes

/

/login

/register

/dashboard

/editor

/projects

/templates

/profile

/settings

/admin

---

# Lazy Loading

Future feature modules should be lazy loaded whenever appropriate.

Example:

Dashboard Module

Projects Module

Editor Module

Profile Module

---

# Route Protection

Protected pages:

Dashboard

Projects

Profile

Settings

Authentication will use Route Guards.

---

# Best Practices

- Keep routes feature-based.
- Use lazy loading.
- Protect private routes.
- Avoid deeply nested routes.
- Keep route names meaningful.