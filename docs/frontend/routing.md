# Routing

The app should use route-driven features rather than a single large page.

## Suggested Route Groups

- Landing and authentication views.
- Creation workspace views.
- Asset management views.
- Account and settings views.

## Routing Guidelines

- Keep route components small.
- Load feature code lazily when the route is not part of the critical path.
- Prefer route-level guards for auth-protected areas.
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