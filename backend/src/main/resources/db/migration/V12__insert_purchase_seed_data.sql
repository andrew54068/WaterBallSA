-- Insert seed data for purchases table (testing/development)
-- Phase 2: Purchase System Testing Data

-- Note: This migration assumes seed data from V6 exists:
--   - User IDs: Auto-generated (we'll use user emails to find IDs)
--   - Curriculum IDs: Auto-generated (we'll use curriculum titles to find IDs)

-- Insert test purchases for development and testing
-- Using subqueries to dynamically find user and curriculum IDs

-- Purchase 1: User "john.doe@example.com" purchased "React & Next.js 現代網頁開發" (COMPLETED)
INSERT INTO purchases (user_id, curriculum_id, original_price, final_price, coupon_code, status, purchased_at, created_at, updated_at)
SELECT
    u.id,
    c.id,
    c.price,
    c.price,  -- No discount
    NULL,     -- No coupon used
    'COMPLETED',
    TIMESTAMP '2025-11-01 10:30:00',
    TIMESTAMP '2025-11-01 10:25:00',
    TIMESTAMP '2025-11-01 10:30:00'
FROM users u
CROSS JOIN curriculums c
WHERE u.email = 'john.doe@example.com'
  AND c.title = 'React & Next.js 現代網頁開發'
ON CONFLICT (user_id, curriculum_id) DO NOTHING;

-- Purchase 2: User "john.doe@example.com" purchased "Java 從零開始" (COMPLETED with coupon)
INSERT INTO purchases (user_id, curriculum_id, original_price, final_price, coupon_code, status, purchased_at, created_at, updated_at)
SELECT
    u.id,
    c.id,
    c.price,
    c.price * 0.8,  -- Simulated 20% discount (as if coupon was used)
    'WELCOME20',    -- Phase 3 feature - coupon code stored but not validated yet
    'COMPLETED',
    TIMESTAMP '2025-11-10 14:15:00',
    TIMESTAMP '2025-11-10 14:10:00',
    TIMESTAMP '2025-11-10 14:15:00'
FROM users u
CROSS JOIN curriculums c
WHERE u.email = 'john.doe@example.com'
  AND c.title = 'Java 從零開始'
ON CONFLICT (user_id, curriculum_id) DO NOTHING;

-- Purchase 3: User "jane.smith@example.com" purchased "資料結構與演算法 (Python)" (COMPLETED)
INSERT INTO purchases (user_id, curriculum_id, original_price, final_price, coupon_code, status, purchased_at, created_at, updated_at)
SELECT
    u.id,
    c.id,
    c.price,
    c.price,
    NULL,
    'COMPLETED',
    TIMESTAMP '2025-11-20 09:00:00',
    TIMESTAMP '2025-11-20 08:55:00',
    TIMESTAMP '2025-11-20 09:00:00'
FROM users u
CROSS JOIN curriculums c
WHERE u.email = 'jane.smith@example.com'
  AND c.title = '資料結構與演算法 (Python)'
ON CONFLICT (user_id, curriculum_id) DO NOTHING;

-- Purchase 4: User "bob.wilson@example.com" purchased "軟體設計模式精通之旅" (COMPLETED)
INSERT INTO purchases (user_id, curriculum_id, original_price, final_price, coupon_code, status, purchased_at, created_at, updated_at)
SELECT
    u.id,
    c.id,
    c.price,
    c.price,
    NULL,
    'COMPLETED',
    TIMESTAMP '2025-11-15 16:45:00',
    TIMESTAMP '2025-11-15 16:40:00',
    TIMESTAMP '2025-11-15 16:45:00'
FROM users u
CROSS JOIN curriculums c
WHERE u.email = 'bob.wilson@example.com'
  AND c.title = '軟體設計模式精通之旅'
ON CONFLICT (user_id, curriculum_id) DO NOTHING;

-- Purchase 5: Pending purchase by john.doe (user started but didn't complete)
-- Useful for testing cancellation and timeout scenarios
INSERT INTO purchases (user_id, curriculum_id, original_price, final_price, coupon_code, status, purchased_at, created_at, updated_at)
SELECT
    u.id,
    c.id,
    c.price,
    c.price,
    NULL,
    'PENDING',
    NULL,  -- Not completed yet
    TIMESTAMP '2025-11-27 20:00:00',
    TIMESTAMP '2025-11-27 20:00:00'
FROM users u
CROSS JOIN curriculums c
WHERE u.email = 'john.doe@example.com'
  -- Select a curriculum the user hasn't purchased yet
  AND c.title = 'AI x BDD：規格驅動全自動開發術'
ON CONFLICT (user_id, curriculum_id) DO NOTHING;

-- Add comments
COMMENT ON TABLE purchases IS 'Updated with seed data for development and testing';

-- Display summary of inserted purchases
DO $$
DECLARE
    completed_count INTEGER;
    pending_count INTEGER;
    cancelled_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO completed_count FROM purchases WHERE status = 'COMPLETED';
    SELECT COUNT(*) INTO pending_count FROM purchases WHERE status = 'PENDING';
    SELECT COUNT(*) INTO cancelled_count FROM purchases WHERE status = 'CANCELLED';

    RAISE NOTICE 'Purchase seed data summary:';
    RAISE NOTICE '  - COMPLETED purchases: %', completed_count;
    RAISE NOTICE '  - PENDING purchases: %', pending_count;
    RAISE NOTICE '  - CANCELLED purchases: %', cancelled_count;
    RAISE NOTICE 'Total purchases: %', completed_count + pending_count + cancelled_count;
END $$;
