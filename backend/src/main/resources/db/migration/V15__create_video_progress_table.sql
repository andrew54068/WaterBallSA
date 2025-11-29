-- Create video_progress table for tracking user video playback
CREATE TABLE video_progress (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    lesson_id BIGINT NOT NULL,
    current_time_seconds DOUBLE PRECISION NOT NULL DEFAULT 0,
    duration_seconds DOUBLE PRECISION NOT NULL,
    completion_percentage INTEGER NOT NULL DEFAULT 0,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

    -- Foreign keys
    CONSTRAINT fk_video_progress_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_video_progress_lesson
        FOREIGN KEY (lesson_id)
        REFERENCES lessons(id)
        ON DELETE CASCADE,

    -- Constraints
    CONSTRAINT video_progress_current_time_positive
        CHECK (current_time_seconds >= 0),

    CONSTRAINT video_progress_duration_positive
        CHECK (duration_seconds > 0),

    CONSTRAINT video_progress_completion_range
        CHECK (completion_percentage >= 0 AND completion_percentage <= 100),

    CONSTRAINT video_progress_current_lte_duration
        CHECK (current_time_seconds <= duration_seconds),

    -- Unique constraint: one progress record per user-lesson combination
    CONSTRAINT video_progress_unique_user_lesson
        UNIQUE (user_id, lesson_id)
);

-- Indexes for query performance
CREATE INDEX idx_video_progress_user_id
    ON video_progress (user_id);

CREATE INDEX idx_video_progress_lesson_id
    ON video_progress (lesson_id);

CREATE INDEX idx_video_progress_completed
    ON video_progress (user_id, is_completed)
    WHERE is_completed = true;

-- Trigger to auto-update updated_at timestamp
CREATE TRIGGER update_video_progress_updated_at
    BEFORE UPDATE ON video_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE video_progress IS
    'Tracks user video playback progress for resume functionality and completion tracking';

COMMENT ON COLUMN video_progress.current_time_seconds IS
    'Current playback position in seconds';

COMMENT ON COLUMN video_progress.duration_seconds IS
    'Total video duration in seconds';

COMMENT ON COLUMN video_progress.completion_percentage IS
    'Completion percentage calculated as (current_time / duration) * 100';

COMMENT ON COLUMN video_progress.is_completed IS
    'True when user has watched >= 95% of the video (or 100% for videos < 30 seconds)';

COMMENT ON COLUMN video_progress.completed_at IS
    'Timestamp when the lesson was first marked as completed (preserved on rewatches)';
