CREATE TABLE IF NOT EXISTS music_tracks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    artist VARCHAR(255),
    duration VARCHAR(50),
    url VARCHAR(255) NOT NULL,
    category VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS music_favorites (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    track_id UUID REFERENCES music_tracks(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, track_id)
);