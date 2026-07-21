CREATE TABLE IF NOT EXISTS meme_templates (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    url VARCHAR(255) NOT NULL,
    uses INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS user_memes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    template_id VARCHAR(100) REFERENCES meme_templates(id),
    top_text TEXT,
    bottom_text TEXT,
    output_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);