-- ============================================================================
-- WaterBallSA Online Learning Platform - Database Schema Design
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
-- Stores Google OAuth authenticated user information
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    google_id VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    profile_picture TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_google_id (google_id)
);

-- Curriculums Table
-- Stores complete course information including pricing, difficulty, instructor details
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_curriculums_difficulty (difficulty_level),
    INDEX idx_curriculums_price (price),
    INDEX idx_curriculums_published (is_published, published_at)
);

-- Chapters Table
-- Stores chapter information (each curriculum contains multiple chapters)
CREATE TABLE chapters (
    id SERIAL PRIMARY KEY,
    curriculum_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (curriculum_id) REFERENCES curriculums(id) ON DELETE CASCADE,
    INDEX idx_chapters_curriculum (curriculum_id, order_index)
);

-- Lessons Table
-- Stores actual lesson content (videos, articles, surveys)
-- Uses JSONB field to store different metadata for different lesson types
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
    FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE,
    INDEX idx_lessons_chapter (chapter_id, order_index),
    INDEX idx_lessons_type (lesson_type),
    INDEX idx_lessons_free_preview (is_free_preview)
);

-- content_metadata Examples:
-- VIDEO type: {"videoProvider": "youtube", "videoId": "abc123", "thumbnailUrl": "https://..."}
-- ARTICLE type: {"author": "John Doe", "publishedDate": "2024-12-01", "readingTime": 10}
-- SURVEY type: {"questionsCount": 10, "passingScore": 70, "timeLimit": 30}

-- Video Progress Table
-- Tracks user video watching progress (playback time, completion percentage)
-- Automatically marks as completed when completion_percentage >= 90%
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
    UNIQUE KEY unique_user_lesson (user_id, lesson_id),
    INDEX idx_video_progress_user (user_id),
    INDEX idx_video_progress_lesson (lesson_id),
    INDEX idx_video_progress_completed (is_completed, completed_at)
);

-- ============================================================================
-- Phase 2: Purchase System & Access Control
-- ============================================================================

-- Coupons Table
-- Stores coupon information (percentage discount or fixed amount discount)
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_coupons_code (code),
    INDEX idx_coupons_validity (valid_from, valid_until),
    INDEX idx_coupons_active (is_active)
);

-- applicable_curriculum_ids Example: [1, 2, 5] means only applicable to curriculums 1, 2, 5
-- NULL means applicable to all curriculums

-- Purchases Table
-- Stores user curriculum purchase order records
-- Purchase flow: Create order (PENDING) → Complete payment (COMPLETED)
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
    FOREIGN KEY (curriculum_id) REFERENCES curriculums(id) ON DELETE RESTRICT,
    INDEX idx_purchases_user (user_id, status),
    INDEX idx_purchases_curriculum (curriculum_id),
    INDEX idx_purchases_status (status, purchased_at)
);

-- Payment Transactions Table
-- Stores payment transaction details (Phase 2 uses mock payment, always succeeds)
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
    FOREIGN KEY (purchase_id) REFERENCES purchases(id) ON DELETE RESTRICT,
    INDEX idx_payment_transactions_purchase (purchase_id),
    INDEX idx_payment_transactions_status (transaction_status)
);

-- ============================================================================
-- Index Optimization
-- ============================================================================

-- Composite indexes for improved query performance
CREATE INDEX idx_lessons_chapter_type ON lessons(chapter_id, lesson_type);
CREATE INDEX idx_video_progress_user_completed ON video_progress(user_id, is_completed);
CREATE INDEX idx_purchases_user_curriculum ON purchases(user_id, curriculum_id);

-- Full-text search index (PostgreSQL FULLTEXT)
-- For searching curriculum titles and descriptions
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
