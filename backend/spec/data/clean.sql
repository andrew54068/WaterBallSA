-- ============================================================================
-- Clean Data Script
-- ============================================================================

TRUNCATE TABLE video_progress, payment_transactions, purchases, coupons, lessons, chapters, curriculums, users RESTART IDENTITY CASCADE;
