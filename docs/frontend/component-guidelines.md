# Component Guidelines

## Structure

- Keep components focused on rendering and interaction.
- Move data fetching into services.
- Put shared UI pieces in a reusable folder.

## Styling

- Use component-scoped SCSS where possible.
- Keep design tokens or shared variables centralized.
- Avoid repeating layout logic across multiple screens.

## Behavior

- Pass data through inputs and outputs instead of coupling components tightly.
- Keep form validation close to the form.
- Prefer clear naming over abbreviations.
# Component Guidelines

## Overview

Components are the building blocks of the GenZ Studio frontend.

Each component should have a single responsibility.

---

# Component Structure

Example

login/

login.component.ts

login.component.html

login.component.scss

---

# Naming Convention

Use kebab-case.

Examples

login-page

dashboard-card

user-profile

---

# Responsibilities

A component should:

Display UI

Handle user interaction

Delegate business logic to services

Avoid API logic whenever possible

---

# Folder Organization

shared/

Reusable components

features/

Business-specific components

---

# Styling

Every component should use SCSS.

Avoid inline styles.

---

# Reusability

If a component is reused more than twice,

move it into

shared/components/

---

# Best Practices

Keep components small.

Prefer Input and Output over global communication.

Avoid duplicated UI.

Follow Angular Style Guide.

Use dependency injection.

Keep templates clean.

Avoid large HTML files.

---

# Future

Shared UI Library

Storybook

Component Testing