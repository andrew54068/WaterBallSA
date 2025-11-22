-- Create lessons table for storing individual lesson content
CREATE TABLE IF NOT EXISTS lessons (
    id BIGSERIAL PRIMARY KEY,
    chapter_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    lesson_type VARCHAR(50) NOT NULL, -- VIDEO, ARTICLE, SURVEY
    content_url VARCHAR(1000), -- URL to video, article content, or survey JSON
    order_index INTEGER NOT NULL,
    duration_minutes INTEGER,

    -- Content metadata
    is_free_preview BOOLEAN NOT NULL DEFAULT FALSE, -- Phase 2: allows preview without purchase
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    content_metadata JSONB, -- Store additional metadata like video resolution, article word count, etc.

    -- Audit fields
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Foreign key constraints
    CONSTRAINT fk_lessons_chapter FOREIGN KEY (chapter_id)
        REFERENCES chapters(id) ON DELETE CASCADE,

    -- Other constraints
    CONSTRAINT lessons_type_check CHECK (lesson_type IN ('VIDEO', 'ARTICLE', 'SURVEY')),
    CONSTRAINT lessons_order_index_check CHECK (order_index >= 0),
    CONSTRAINT lessons_duration_check CHECK (duration_minutes IS NULL OR duration_minutes > 0),
    CONSTRAINT lessons_unique_order_per_chapter UNIQUE (chapter_id, order_index)
);

-- Create indexes for lessons table
CREATE INDEX idx_lessons_chapter_id ON lessons(chapter_id);
CREATE INDEX idx_lessons_order_index ON lessons(chapter_id, order_index);
CREATE INDEX idx_lessons_lesson_type ON lessons(lesson_type);
CREATE INDEX idx_lessons_is_free_preview ON lessons(is_free_preview);
CREATE INDEX idx_lessons_is_published ON lessons(is_published);
CREATE INDEX idx_lessons_content_metadata ON lessons USING GIN(content_metadata);

-- Add comments
COMMENT ON TABLE lessons IS 'Stores individual lesson content (videos, articles, surveys)';
COMMENT ON COLUMN lessons.lesson_type IS 'Type of lesson content: VIDEO, ARTICLE, or SURVEY';
COMMENT ON COLUMN lessons.content_url IS 'URL or path to the lesson content';
COMMENT ON COLUMN lessons.order_index IS 'Display order within the chapter (0-based)';
COMMENT ON COLUMN lessons.is_free_preview IS 'Whether this lesson can be accessed without purchasing the curriculum';
COMMENT ON COLUMN lessons.content_metadata IS 'JSON field for storing type-specific metadata';
