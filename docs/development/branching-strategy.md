# Branching Strategy

The repository uses a simple trunk-based flow with `main` as the stable branch.

## Branch Types

- `feature/<name>` for new work.
- `fix/<name>` for bug fixes.
- `docs/<name>` for documentation-only updates.

## Rules

- Branch from `main`.
- Keep branches small and focused.
- Rebase or merge `main` regularly if the branch lives for more than a short time.
- Merge only after the change builds and the relevant checks pass.

## Suggested Practice

- Use one branch per task.
- Avoid mixing backend implementation and unrelated refactors.
- Use descriptive branch names that make the purpose obvious.
