# Schema

This schema file will grow as the backend data model is implemented.

## Planned Core Tables

- `users` for account identity and profile data.
- `sessions` for login or refresh token tracking if needed.
- `projects` for user-created design or content work.
- `assets` for uploaded or generated files.
- `generation_jobs` for prompt-driven output tracking.

## Common Columns

- `id` as the primary key.
- `created_at` and `updated_at` timestamps.
- Foreign keys for ownership and relationship links.

## Notes

- Add indexes for lookup-heavy columns such as `user_id` and `project_id`.
- Keep sensitive values out of the schema when possible.
- Normalize only when it improves clarity or consistency.
