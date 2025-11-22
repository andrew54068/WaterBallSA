-- Create curriculums table for storing course/curriculum information
CREATE TABLE IF NOT EXISTS curriculums (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    thumbnail_url VARCHAR(500),
    instructor_name VARCHAR(255) NOT NULL,

    -- Pricing (Phase 2, but added now for schema completeness)
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',

    -- Metadata
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    difficulty_level VARCHAR(50), -- BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
    estimated_duration_hours INTEGER, -- Total estimated hours to complete

    -- Audit fields
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP,

    -- Constraints
    CONSTRAINT curriculums_price_check CHECK (price >= 0),
    CONSTRAINT curriculums_duration_check CHECK (estimated_duration_hours IS NULL OR estimated_duration_hours > 0),
    CONSTRAINT curriculums_difficulty_check CHECK (difficulty_level IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'))
);

-- Create indexes for curriculums table
CREATE INDEX idx_curriculums_is_published ON curriculums(is_published);
CREATE INDEX idx_curriculums_difficulty_level ON curriculums(difficulty_level);
CREATE INDEX idx_curriculums_created_at ON curriculums(created_at);
CREATE INDEX idx_curriculums_instructor_name ON curriculums(instructor_name);

-- Add comments
COMMENT ON TABLE curriculums IS 'Stores course/curriculum information';
COMMENT ON COLUMN curriculums.price IS 'Price in the specified currency (0.00 for free curriculums)';
COMMENT ON COLUMN curriculums.is_published IS 'Whether the curriculum is visible to users';
COMMENT ON COLUMN curriculums.estimated_duration_hours IS 'Total estimated hours to complete all content';
