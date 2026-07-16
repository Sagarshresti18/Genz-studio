# Database Schema

GenZ Studio utilizes a highly modular schema architecture that mirrors the codebase structure. Instead of a large monolithic schema file, the database tables are defined within their respective feature modules.

## Initialization Workflow

The database is built using an automated initialization script:
`npm run db:init` (located at `server/src/scripts/init-db.js`)

1. **Core Schemas First**: The script initially executes the schema files for `users` and `projects`. These core tables must exist first because nearly all other feature tables include foreign key constraints pointing to them.
2. **Feature Schemas Next**: The script then dynamically traverses all remaining folders within `server/src/features/` and executes any `schema.sql` file it finds.

## Implemented Tables

- **Core**:
  - `users` (Authentication, profiles)
  - `projects` (Workspaces, dashboards)
- **Features**:
  - `logos` (Logo generator feature)
  - `youtube_banners` (YouTube banner generator)
  - `thumbnails` (Thumbnail maker)
  - `image_edits` (Image editor operations)
  - `video_projects` (Video editor)
  - `ai_videos` (AI video generation)
  - `ai_audio` (AI audio/voiceovers)
  - `ai_content` (AI text and prompt generation)
  - `calendar_posts` (Content calendar scheduling)
  - `meme_templates` & `user_memes` (Meme library)
  - `music_tracks` & `music_favorites` (Music library)

*Note: The backend avoids storing raw binary media data in the database. Instead, media files are stored separately (e.g. cloud storage or local disk) and only their paths/URLs (`output_url`, `source_url`, etc.) are tracked inside the database.*
