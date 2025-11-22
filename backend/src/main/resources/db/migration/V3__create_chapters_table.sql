-- Create chapters table for organizing curriculum content
CREATE TABLE IF NOT EXISTS chapters (
    id BIGSERIAL PRIMARY KEY,
    curriculum_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,

    -- Metadata
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    estimated_duration_hours INTEGER,

    -- Audit fields
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Foreign key constraints
    CONSTRAINT fk_chapters_curriculum FOREIGN KEY (curriculum_id)
        REFERENCES curriculums(id) ON DELETE CASCADE,

    -- Other constraints
    CONSTRAINT chapters_order_index_check CHECK (order_index >= 0),
    CONSTRAINT chapters_duration_check CHECK (estimated_duration_hours IS NULL OR estimated_duration_hours > 0),
    CONSTRAINT chapters_unique_order_per_curriculum UNIQUE (curriculum_id, order_index)
);

-- Create indexes for chapters table
CREATE INDEX idx_chapters_curriculum_id ON chapters(curriculum_id);
CREATE INDEX idx_chapters_order_index ON chapters(curriculum_id, order_index);
CREATE INDEX idx_chapters_is_published ON chapters(is_published);

-- Add comments
COMMENT ON TABLE chapters IS 'Stores chapters within curriculums for content organization';
COMMENT ON COLUMN chapters.order_index IS 'Display order within the curriculum (0-based)';
COMMENT ON COLUMN chapters.is_published IS 'Whether the chapter is visible to users';
