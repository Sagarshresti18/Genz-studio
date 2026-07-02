# Contributing

## Workflow

1. Create a feature branch from `main`.
2. Make a focused change.
3. Run the relevant build or validation command.
4. Open a pull request with a short summary of the change and verification steps.

## Backend Guidelines

- Keep route handlers thin.
- Validate request data before using it.
- Centralize database access in one place.
- Prefer small, reusable modules over large route files.

## Documentation Guidelines

- Update docs when setup, routing, or architecture changes.
- Keep examples aligned with the current code.
- Use the docs tree to explain how the system is actually wired, not just intended design.

## Commit Style

- Use short, descriptive commit messages.
- Group related backend, frontend, and docs changes separately when possible.
