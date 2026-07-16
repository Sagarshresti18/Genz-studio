CREATE TABLE IF NOT EXISTS calendar_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    platform VARCHAR(50),
    scheduled_at TIMESTAMP,
    content_id UUID, 
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);