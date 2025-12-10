-- ============================================================================
-- Clean Data Script
-- ============================================================================

TRUNCATE TABLE video_progresses, coupons, lessons, chapters, curriculums, users RESTART IDENTITY CASCADE;
