-- ============================================================================
-- Seed Data for WaterBallSA Online Learning Platform
-- ============================================================================

-- Clean up existing data to avoid duplicates
TRUNCATE TABLE video_progress,  payment_transactions, purchases, coupons, lessons, chapters, curriculums, users RESTART IDENTITY CASCADE;

-- 1. Users
-- Matches schema: google_id, email, name, profile_picture
INSERT INTO users (google_id, email, name, profile_picture) VALUES
('google_123456789', 'waterball@example.com', 'Waterball Pan', 'https://lh3.googleusercontent.com/a-/AOh14BgExampleImage=s96-c'),
('google_987654321', 'student@example.com', 'Test Student', 'https://lh3.googleusercontent.com/a-/BGh12ChExampleImage=s96-c');

-- 2. Curriculums
-- Matches schema: title, description, price, currency, difficulty_level, estimated_duration_hours, is_published, instructor_name
INSERT INTO curriculums (title, description, price, currency, difficulty_level, estimated_duration_hours, is_published, instructor_name) VALUES
('軟體設計模式之旅', '這是一趟軟體設計模式的旅程，帶你深入淺出了解各種 Design Patterns 的應用場景與實作細節。', 3200.00, 'TWD', 'INTERMEDIATE', 20, TRUE, 'Waterball Pan'),
('Clean Architecture 實戰', '學習如何構建可維護、可測試且獨立於框架的系統。', 4500.00, 'TWD', 'ADVANCED', 30, TRUE, 'Waterball Pan');

-- 3. Chapters
-- Matches schema: curriculum_id, title, order_index
INSERT INTO chapters (curriculum_id, title, order_index) VALUES
(1, '導論：為什麼我們需要設計模式？', 1),
(1, '創建型模式 (Creational Patterns)', 2),
(1, '結構型模式 (Structural Patterns)', 3),
(1, '行為型模式 (Behavioral Patterns)', 4);

-- 4. Lessons
-- Matches schema: chapter_id, title, lesson_type, content_url, content_metadata, order_index, duration_minutes, is_free_preview
INSERT INTO lessons (chapter_id, title, lesson_type, content_url, content_metadata, order_index, duration_minutes, is_free_preview) VALUES
(1, '課程介紹與學習路徑', 'VIDEO', 'https://youtu.be/W09vydJH6jo?si=oNIgep1beKECmIi8', '{"videoProvider": "youtube", "videoId": "W09vydJH6jo"}', 1, 10, TRUE),
(1, '設計模式的歷史與 GoF', 'VIDEO', 'https://youtu.be/XGEPX3V-Dr8?si=59LMqy5dyv7uGCI7', '{"videoProvider": "youtube", "videoId": "XGEPX3V-Dr8"}', 2, 5, TRUE),
(2, 'Singleton 單例模式', 'VIDEO', 'https://youtu.be/RsVXi7tZMks', '{"videoProvider": "youtube", "videoId": "RsVXi7tZMks"}', 1, 25, FALSE),
(2, 'Factory Method 工廠方法', 'VIDEO', 'https://youtu.be/sXCpSqLCg8E', '{"videoProvider": "youtube", "videoId": "sXCpSqLCg8E"}', 2, 30, FALSE),
(2, '創建型模式小測驗', 'SURVEY', 'https://www.example.com/survey', '{"questionsCount": 10, "passingScore": 70, "timeLimit": 30}', 3, 15, FALSE),
(3, 'Adapter 適配器模式', 'VIDEO', 'https://youtu.be/ZxGKjJL_9IY', '{"videoProvider": "youtube", "videoId": "ZxGKjJL_9IY"}', 1, 20, FALSE);

-- 5. Coupons
-- Matches schema: code, discount_type, discount_value, valid_from, valid_until, usage_limit
INSERT INTO coupons (code, discount_type, discount_value, valid_from, valid_until, usage_limit) VALUES
('EARLYBIRD2024', 'PERCENTAGE', 15.00, NOW(), NOW() + INTERVAL '1 month', 100),
('WELCOME100', 'FIXED_AMOUNT', 100.00, NOW(), NOW() + INTERVAL '1 year', NULL);

-- 6. Video Progress
-- Matches schema: user_id, lesson_id, current_time_seconds, duration_seconds, completion_percentage, is_completed, completed_at
INSERT INTO video_progress (user_id, lesson_id, current_time_seconds, duration_seconds, completion_percentage, is_completed, completed_at) VALUES
(2, 1, 600.00, 600.00, 100.00, TRUE, NOW());

-- ============================================================================
-- End of Seed Data
-- ============================================================================
