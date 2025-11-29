-- Insert seed data for coupons table (testing/development)
-- Phase 3 Feature: Coupon system (schema ready, not used in Phase 2)

-- Note: This seed data is for future Phase 3 implementation
-- Coupons will NOT be validated or applied in Phase 2 business logic

-- Insert test coupons for development and testing

-- Coupon 1: WELCOME20 - 20% off, unlimited uses, active
INSERT INTO coupons (code, discount_type, discount_value, valid_from, valid_until, max_uses, current_uses, is_active)
VALUES (
    'WELCOME20',
    'PERCENTAGE',
    20.00,
    TIMESTAMP '2025-01-01 00:00:00',
    TIMESTAMP '2025-12-31 23:59:59',
    0,  -- Unlimited uses
    1,  -- Already used once (in purchase seed data)
    TRUE
) ON CONFLICT (code) DO NOTHING;

-- Coupon 2: NEWYEAR2025 - $10 fixed discount, limited to 100 uses
INSERT INTO coupons (code, discount_type, discount_value, valid_from, valid_until, max_uses, current_uses, is_active)
VALUES (
    'NEWYEAR2025',
    'FIXED_AMOUNT',
    10.00,
    TIMESTAMP '2025-01-01 00:00:00',
    TIMESTAMP '2025-01-31 23:59:59',
    100,
    0,
    TRUE
) ON CONFLICT (code) DO NOTHING;

-- Coupon 3: BLACKFRIDAY - 50% off, limited time, limited uses
INSERT INTO coupons (code, discount_type, discount_value, valid_from, valid_until, max_uses, current_uses, is_active)
VALUES (
    'BLACKFRIDAY',
    'PERCENTAGE',
    50.00,
    TIMESTAMP '2025-11-25 00:00:00',
    TIMESTAMP '2025-11-30 23:59:59',
    500,
    0,
    TRUE
) ON CONFLICT (code) DO NOTHING;

-- Coupon 4: EXPIRED10 - Expired coupon (for testing)
INSERT INTO coupons (code, discount_type, discount_value, valid_from, valid_until, max_uses, current_uses, is_active)
VALUES (
    'EXPIRED10',
    'PERCENTAGE',
    10.00,
    TIMESTAMP '2025-01-01 00:00:00',
    TIMESTAMP '2025-06-30 23:59:59',
    0,
    15,
    FALSE  -- Deactivated
) ON CONFLICT (code) DO NOTHING;

-- Coupon 5: STUDENT15 - 15% off for students, unlimited uses
INSERT INTO coupons (code, discount_type, discount_value, valid_from, valid_until, max_uses, current_uses, is_active)
VALUES (
    'STUDENT15',
    'PERCENTAGE',
    15.00,
    TIMESTAMP '2025-01-01 00:00:00',
    TIMESTAMP '2025-12-31 23:59:59',
    0,  -- Unlimited uses
    42,
    TRUE
) ON CONFLICT (code) DO NOTHING;

-- Coupon 6: EARLYBIRD - $25 fixed discount, almost at max uses (for testing)
INSERT INTO coupons (code, discount_type, discount_value, valid_from, valid_until, max_uses, current_uses, is_active)
VALUES (
    'EARLYBIRD',
    'FIXED_AMOUNT',
    25.00,
    TIMESTAMP '2025-01-01 00:00:00',
    TIMESTAMP '2025-12-31 23:59:59',
    50,
    49,  -- Only 1 use remaining
    TRUE
) ON CONFLICT (code) DO NOTHING;

-- Add comments
COMMENT ON TABLE coupons IS 'Updated with seed data for Phase 3 testing (not used in Phase 2)';

-- Display summary of inserted coupons
DO $$
DECLARE
    active_count INTEGER;
    inactive_count INTEGER;
    percentage_count INTEGER;
    fixed_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO active_count FROM coupons WHERE is_active = TRUE;
    SELECT COUNT(*) INTO inactive_count FROM coupons WHERE is_active = FALSE;
    SELECT COUNT(*) INTO percentage_count FROM coupons WHERE discount_type = 'PERCENTAGE';
    SELECT COUNT(*) INTO fixed_count FROM coupons WHERE discount_type = 'FIXED_AMOUNT';

    RAISE NOTICE 'Coupon seed data summary (Phase 3 ready):';
    RAISE NOTICE '  - Active coupons: %', active_count;
    RAISE NOTICE '  - Inactive coupons: %', inactive_count;
    RAISE NOTICE '  - Percentage discounts: %', percentage_count;
    RAISE NOTICE '  - Fixed amount discounts: %', fixed_count;
    RAISE NOTICE 'Total coupons: %', active_count + inactive_count;
    RAISE NOTICE '';
    RAISE NOTICE 'NOTE: Coupons are NOT validated in Phase 2 business logic';
END $$;
