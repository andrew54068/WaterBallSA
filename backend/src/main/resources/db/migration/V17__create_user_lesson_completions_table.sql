-- V17: Create user_lesson_completions table
-- Tracks which lessons each user has completed to prevent duplicate EXP awards

CREATE TABLE user_lesson_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id BIGINT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    exp_awarded INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, lesson_id)
);

-- Create indexes for efficient queries
CREATE INDEX idx_user_lesson_completions_user
ON user_lesson_completions(user_id);

CREATE INDEX idx_user_lesson_completions_lesson
ON user_lesson_completions(lesson_id);

CREATE INDEX idx_user_lesson_completions_completed_at
ON user_lesson_completions(completed_at DESC);

-- Add comments
COMMENT ON TABLE user_lesson_completions IS 'Tracks lesson completions to prevent duplicate EXP awards';
COMMENT ON COLUMN user_lesson_completions.exp_awarded IS 'Amount of EXP awarded for this completion';
