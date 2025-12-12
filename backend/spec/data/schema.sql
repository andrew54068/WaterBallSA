-- ============================================================================
-- WaterBallSA Online Learning Platform - Database Schema Design (PostgreSQL)
-- ============================================================================
--
-- Project Description:
-- - Authentication: Google OAuth 2.0 + JWT Token
-- - Hierarchy: Curriculum → Chapters → Lessons
-- - Lesson Types: VIDEO, ARTICLE, SURVEY
-- - Development Phases: Phase 1 (Foundation) → Phase 2 (Purchase) → Phase 3 (Gamification)
--
-- ============================================================================

-- ============================================================================
-- Phase 1: Foundation Features
-- ============================================================================

-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    google_id VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    profile_picture TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE users IS 'Users (Google OAuth authentication)';
COMMENT ON COLUMN users.google_id IS 'Google user ID (unique)';
COMMENT ON COLUMN users.email IS 'User email address';
COMMENT ON COLUMN users.name IS 'User full name';
COMMENT ON COLUMN users.profile_picture IS 'User profile picture URL (from Google)';
COMMENT ON COLUMN users.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN users.updated_at IS 'Last update timestamp';

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id);

-- Curriculums Table
CREATE TABLE curriculums (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    thumbnail_url TEXT,
    instructor_name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'TWD',
    difficulty_level VARCHAR(20) NOT NULL CHECK (difficulty_level IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')),
    estimated_duration_hours INT NOT NULL,
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE curriculums IS 'Curriculums';
COMMENT ON COLUMN curriculums.title IS 'Curriculum title';
COMMENT ON COLUMN curriculums.description IS 'Curriculum description';
COMMENT ON COLUMN curriculums.thumbnail_url IS 'Curriculum thumbnail URL';
COMMENT ON COLUMN curriculums.instructor_name IS 'Instructor name';
COMMENT ON COLUMN curriculums.price IS 'Course price (0 = free)';
COMMENT ON COLUMN curriculums.currency IS 'Currency code (default: TWD)';
COMMENT ON COLUMN curriculums.difficulty_level IS 'Difficulty level (BEGINNER, INTERMEDIATE, ADVANCED)';
COMMENT ON COLUMN curriculums.estimated_duration_hours IS 'Estimated total duration in hours';
COMMENT ON COLUMN curriculums.is_published IS 'Publication status (FALSE = draft)';
COMMENT ON COLUMN curriculums.published_at IS 'Publication timestamp (only set when published)';
COMMENT ON COLUMN curriculums.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN curriculums.updated_at IS 'Last update timestamp';

CREATE INDEX idx_curriculums_difficulty ON curriculums(difficulty_level);
CREATE INDEX idx_curriculums_price ON curriculums(price);
CREATE INDEX idx_curriculums_published ON curriculums(is_published, published_at);

-- Chapters Table
CREATE TABLE chapters (
    id SERIAL PRIMARY KEY,
    curriculum_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (curriculum_id) REFERENCES curriculums(id) ON DELETE CASCADE
);

COMMENT ON TABLE chapters IS 'Chapters';
COMMENT ON COLUMN chapters.curriculum_id IS 'Parent curriculum ID (foreign key)';
COMMENT ON COLUMN chapters.title IS 'Chapter title';
COMMENT ON COLUMN chapters.description IS 'Chapter description';
COMMENT ON COLUMN chapters.order_index IS 'Sort order index (lower number = higher priority)';
COMMENT ON COLUMN chapters.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN chapters.updated_at IS 'Last update timestamp';

CREATE INDEX idx_chapters_curriculum ON chapters(curriculum_id, order_index);

-- Lessons Table
CREATE TABLE lessons (
    id SERIAL PRIMARY KEY,
    chapter_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    lesson_type VARCHAR(20) NOT NULL CHECK (lesson_type IN ('VIDEO', 'ARTICLE', 'SURVEY')),
    content_url TEXT,
    content_metadata JSONB,
    order_index INT NOT NULL,
    duration_minutes INT,
    is_free_preview BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
);

COMMENT ON TABLE lessons IS 'Lessons (VIDEO/ARTICLE/SURVEY)';
COMMENT ON COLUMN lessons.chapter_id IS 'Parent chapter ID (foreign key)';
COMMENT ON COLUMN lessons.title IS 'Lesson title';
COMMENT ON COLUMN lessons.description IS 'Lesson description';
COMMENT ON COLUMN lessons.lesson_type IS 'Lesson type (VIDEO, ARTICLE, SURVEY)';
COMMENT ON COLUMN lessons.content_url IS 'Lesson content URL (e.g., YouTube video link)';
COMMENT ON COLUMN lessons.content_metadata IS 'Lesson content metadata (JSONB, varies by lesson_type)';
COMMENT ON COLUMN lessons.order_index IS 'Sort order index (lower number = higher priority)';
COMMENT ON COLUMN lessons.duration_minutes IS 'Lesson duration in minutes';
COMMENT ON COLUMN lessons.is_free_preview IS 'Free preview flag';
COMMENT ON COLUMN lessons.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN lessons.updated_at IS 'Last update timestamp';

CREATE INDEX idx_lessons_chapter ON lessons(chapter_id, order_index);
CREATE INDEX idx_lessons_type ON lessons(lesson_type);
CREATE INDEX idx_lessons_free_preview ON lessons(is_free_preview);

-- Video Progress Table
CREATE TABLE video_progress (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    lesson_id INT NOT NULL,
    current_time_seconds DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    duration_seconds DECIMAL(10, 2) NOT NULL,
    completion_percentage DECIMAL(5, 2) NOT NULL DEFAULT 0.00 CHECK (completion_percentage BETWEEN 0 AND 100),
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
    UNIQUE (user_id, lesson_id)
);

COMMENT ON TABLE video_progress IS 'Video watching progress';
COMMENT ON COLUMN video_progress.user_id IS 'User ID (foreign key)';
COMMENT ON COLUMN video_progress.lesson_id IS 'Lesson ID (foreign key)';
COMMENT ON COLUMN video_progress.current_time_seconds IS 'Current playback time in seconds';
COMMENT ON COLUMN video_progress.duration_seconds IS 'Total video duration in seconds';
COMMENT ON COLUMN video_progress.completion_percentage IS 'Completion percentage (0-100)';
COMMENT ON COLUMN video_progress.is_completed IS 'Completion flag (usually true when completion_percentage >= 90)';
COMMENT ON COLUMN video_progress.completed_at IS 'Completion timestamp (only set when completed)';
COMMENT ON COLUMN video_progress.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN video_progress.updated_at IS 'Last update timestamp';

CREATE INDEX idx_video_progress_user ON video_progress(user_id);
CREATE INDEX idx_video_progress_lesson ON video_progress(lesson_id);
CREATE INDEX idx_video_progress_completed ON video_progress(is_completed, completed_at);

-- ============================================================================
-- Phase 2: Purchase System & Access Control
-- ============================================================================

-- Coupons Table
CREATE TABLE coupons (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('PERCENTAGE', 'FIXED_AMOUNT')),
    discount_value DECIMAL(10, 2) NOT NULL,
    valid_from TIMESTAMP NOT NULL,
    valid_until TIMESTAMP NOT NULL,
    usage_limit INT,
    usage_count INT DEFAULT 0,
    applicable_curriculum_ids JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE coupons IS 'Coupons';
COMMENT ON COLUMN coupons.code IS 'Coupon code (unique, case-insensitive)';
COMMENT ON COLUMN coupons.discount_type IS 'Discount type (PERCENTAGE or FIXED_AMOUNT)';
COMMENT ON COLUMN coupons.discount_value IS 'Discount value (percentage: 0-100, fixed: actual amount)';
COMMENT ON COLUMN coupons.valid_from IS 'Validity start timestamp';
COMMENT ON COLUMN coupons.valid_until IS 'Validity end timestamp';
COMMENT ON COLUMN coupons.usage_limit IS 'Maximum usage count (NULL = unlimited)';
COMMENT ON COLUMN coupons.usage_count IS 'Current usage count';
COMMENT ON COLUMN coupons.applicable_curriculum_ids IS 'Applicable curriculum IDs (JSONB array, NULL = all curriculums)';
COMMENT ON COLUMN coupons.is_active IS 'Active status flag';
COMMENT ON COLUMN coupons.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN coupons.updated_at IS 'Last update timestamp';

CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_validity ON coupons(valid_from, valid_until);
CREATE INDEX idx_coupons_active ON coupons(is_active);

-- Purchases Table
CREATE TABLE purchases (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    curriculum_id INT NOT NULL,
    original_price DECIMAL(10, 2) NOT NULL,
    final_price DECIMAL(10, 2) NOT NULL,
    coupon_code VARCHAR(50),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED', 'CANCELLED')),
    purchased_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (curriculum_id) REFERENCES curriculums(id) ON DELETE RESTRICT
);

COMMENT ON TABLE purchases IS 'Purchase records';
COMMENT ON COLUMN purchases.user_id IS 'Purchasing user ID (foreign key)';
COMMENT ON COLUMN purchases.curriculum_id IS 'Purchased curriculum ID (foreign key)';
COMMENT ON COLUMN purchases.original_price IS 'Original price';
COMMENT ON COLUMN purchases.final_price IS 'Final price (after coupon applied)';
COMMENT ON COLUMN purchases.coupon_code IS 'Applied coupon code';
COMMENT ON COLUMN purchases.status IS 'Order status (PENDING: awaiting payment, COMPLETED: paid, CANCELLED: cancelled)';
COMMENT ON COLUMN purchases.purchased_at IS 'Payment completion timestamp (only set for COMPLETED status)';
COMMENT ON COLUMN purchases.created_at IS 'Order creation timestamp';
COMMENT ON COLUMN purchases.updated_at IS 'Last update timestamp';

CREATE INDEX idx_purchases_user ON purchases(user_id, status);
CREATE INDEX idx_purchases_curriculum ON purchases(curriculum_id);
CREATE INDEX idx_purchases_status ON purchases(status, purchased_at);

-- Payment Transactions Table
CREATE TABLE payment_transactions (
    id SERIAL PRIMARY KEY,
    purchase_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'TWD',
    payment_method VARCHAR(50) DEFAULT 'MOCK',
    transaction_status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (transaction_status IN ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED')),
    external_transaction_id VARCHAR(255),
    transaction_metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (purchase_id) REFERENCES purchases(id) ON DELETE RESTRICT
);

COMMENT ON TABLE payment_transactions IS 'Payment transaction records';
COMMENT ON COLUMN payment_transactions.purchase_id IS 'Purchase order ID (foreign key)';
COMMENT ON COLUMN payment_transactions.amount IS 'Transaction amount';
COMMENT ON COLUMN payment_transactions.currency IS 'Transaction currency';
COMMENT ON COLUMN payment_transactions.payment_method IS 'Payment method (Phase 2: MOCK, Phase 3+: CREDIT_CARD, PAYPAL, etc.)';
COMMENT ON COLUMN payment_transactions.transaction_status IS 'Transaction status';
COMMENT ON COLUMN payment_transactions.external_transaction_id IS 'External payment gateway transaction ID';
COMMENT ON COLUMN payment_transactions.transaction_metadata IS 'Transaction metadata (JSONB, stores additional info from payment gateway)';
COMMENT ON COLUMN payment_transactions.created_at IS 'Transaction creation timestamp';
COMMENT ON COLUMN payment_transactions.updated_at IS 'Last update timestamp';

CREATE INDEX idx_payment_transactions_purchase ON payment_transactions(purchase_id);
CREATE INDEX idx_payment_transactions_status ON payment_transactions(transaction_status);

-- ============================================================================
-- Index Optimization
-- ============================================================================

-- Composite indexes for improved query performance
CREATE INDEX idx_lessons_chapter_type ON lessons(chapter_id, lesson_type);
CREATE INDEX idx_video_progress_user_completed ON video_progress(user_id, is_completed);
CREATE INDEX idx_purchases_user_curriculum ON purchases(user_id, curriculum_id);

-- Full-text search index (PostgreSQL FULLTEXT)
CREATE INDEX idx_curriculums_fulltext ON curriculums USING GIN(to_tsvector('english', title || ' ' || description));

-- ============================================================================
-- Auto-update Timestamp Triggers
-- ============================================================================

-- Create generic updated_at auto-update function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create updated_at auto-update triggers for all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_curriculums_updated_at BEFORE UPDATE ON curriculums
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chapters_updated_at BEFORE UPDATE ON chapters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON lessons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_video_progress_updated_at BEFORE UPDATE ON video_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON coupons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchases_updated_at BEFORE UPDATE ON purchases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_transactions_updated_at BEFORE UPDATE ON payment_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Data Integrity Constraints
-- ============================================================================

-- 1. Curriculum price must be >= 0
ALTER TABLE curriculums ADD CONSTRAINT check_price_non_negative CHECK (price >= 0);

-- 2. Coupon discount value must be reasonable
ALTER TABLE coupons ADD CONSTRAINT check_discount_value
    CHECK (
        (discount_type = 'PERCENTAGE' AND discount_value BETWEEN 0 AND 100) OR
        (discount_type = 'FIXED_AMOUNT' AND discount_value >= 0)
    );

-- 3. Purchase final price must be >= 0
ALTER TABLE purchases ADD CONSTRAINT check_final_price_non_negative CHECK (final_price >= 0);

-- ============================================================================
-- End of Schema
-- ============================================================================

