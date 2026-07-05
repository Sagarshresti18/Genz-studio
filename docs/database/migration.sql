-- ============================================================
-- GenZ Studio — Database Migration
-- Run this against your Neon / PostgreSQL instance
-- ============================================================

-- ── Users (core) ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name  TEXT NOT NULL,
  email      TEXT UNIQUE NOT NULL,
  password   TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── AI Content ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_content (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  prompt      TEXT NOT NULL,
  type        TEXT NOT NULL DEFAULT 'script',
  tone        TEXT,
  output_text TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_content_user_id ON ai_content(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_content_type    ON ai_content(type);

-- Add tone column if upgrading from older schema
ALTER TABLE ai_content ADD COLUMN IF NOT EXISTS tone TEXT;

-- ── Meme Templates ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS meme_templates (
  id         TEXT PRIMARY KEY,           -- Imgflip template ID
  name       TEXT NOT NULL,
  url        TEXT NOT NULL,
  width      INT,
  height     INT,
  box_count  INT DEFAULT 2,
  category   TEXT DEFAULT 'classic',
  trending   BOOLEAN DEFAULT FALSE,
  uses       INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_meme_templates_category ON meme_templates(category);
CREATE INDEX IF NOT EXISTS idx_meme_templates_uses     ON meme_templates(uses DESC);

-- Seed popular templates (Imgflip IDs)
INSERT INTO meme_templates (id, name, url, width, height, box_count, category, trending, uses) VALUES
  ('181913649', 'Drake Hotline Bling',    'https://i.imgflip.com/30b1gx.jpg',  1200, 1200, 2, 'reaction',    TRUE,  980000),
  ('87743020',  'Two Buttons',            'https://i.imgflip.com/1g8my4.jpg',   600,  908, 3, 'decision',    TRUE,  870000),
  ('112126428', 'Distracted Boyfriend',   'https://i.imgflip.com/1ur9b0.jpg',  1200,  800, 3, 'reaction',    TRUE,  820000),
  ('217743513', 'UNO Draw 25 Cards',      'https://i.imgflip.com/3lmzyx.jpg',   500,  486, 2, 'decision',    TRUE,  760000),
  ('93895088',  'Expanding Brain',        'https://i.imgflip.com/1jwhww.jpg',   857, 1202, 4, 'comparison',  TRUE,  710000),
  ('188390779', 'Woman Yelling at Cat',   'https://i.imgflip.com/345v97.jpg',  1200,  628, 2, 'reaction',    TRUE,  690000),
  ('247375501', 'Buff Doge vs. Cheems',   'https://i.imgflip.com/43a45p.jpg',   937,  720, 2, 'comparison',  TRUE,  650000),
  ('61579',     'One Does Not Simply',    'https://i.imgflip.com/1bij.jpg',      568,  335, 2, 'classic',     FALSE, 600000),
  ('101470',    'Ancient Aliens',         'https://i.imgflip.com/26am.jpg',      500,  437, 2, 'conspiracy',  FALSE, 540000),
  ('4087833',   'Waiting Skeleton',       'https://i.imgflip.com/2fm6x.jpg',    500,  623, 2, 'reaction',    FALSE, 490000),
  ('124822590', 'Left Exit 12 Off Ramp',  'https://i.imgflip.com/22bdq6.jpg',   804,  767, 3, 'decision',    FALSE, 460000),
  ('131087935', 'Running Away Balloon',   'https://i.imgflip.com/261o3j.jpg',   761, 1024, 3, 'comparison',  FALSE, 430000)
ON CONFLICT (id) DO NOTHING;

-- ── User Memes ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_memes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  template_id TEXT REFERENCES meme_templates(id) ON DELETE SET NULL,
  top_text    TEXT,
  bottom_text TEXT,
  output_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_memes_user_id ON user_memes(user_id);

-- ── Projects (generic) ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  type       TEXT NOT NULL,
  data       JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
