-- Create users table for storing user information from Google OAuth
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    google_id VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    profile_picture_url VARCHAR(500),

    -- Gamification fields (Phase 3, but added now for schema completeness)
    total_exp INTEGER NOT NULL DEFAULT 0,
    current_level INTEGER NOT NULL DEFAULT 1,
    global_rank INTEGER,

    -- Audit fields
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP,

    -- Constraints
    CONSTRAINT users_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT users_total_exp_check CHECK (total_exp >= 0),
    CONSTRAINT users_current_level_check CHECK (current_level >= 1),
    CONSTRAINT users_global_rank_check CHECK (global_rank IS NULL OR global_rank > 0)
);

-- Create indexes for users table
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_global_rank ON users(global_rank) WHERE global_rank IS NOT NULL;
CREATE INDEX idx_users_created_at ON users(created_at);

-- Add comment to table
COMMENT ON TABLE users IS 'Stores user accounts authenticated via Google OAuth';
COMMENT ON COLUMN users.google_id IS 'Unique identifier from Google OAuth';
COMMENT ON COLUMN users.total_exp IS 'Total experience points earned across all activities';
COMMENT ON COLUMN users.current_level IS 'Current user level calculated from total_exp';
COMMENT ON COLUMN users.global_rank IS 'Platform-wide ranking based on total_exp';
