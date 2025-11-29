-- Fix coupons table constraint to allow current_uses > 0 when max_uses = 0 (unlimited)
-- The original constraint was too strict: current_uses <= max_uses fails when max_uses = 0

-- Drop the old constraint
ALTER TABLE coupons DROP CONSTRAINT IF EXISTS coupons_current_uses_check;

-- Add the corrected constraint
-- When max_uses = 0 (unlimited), current_uses can be any non-negative value
-- When max_uses > 0, current_uses must be <= max_uses
ALTER TABLE coupons ADD CONSTRAINT coupons_current_uses_check CHECK (
    current_uses >= 0 AND (max_uses = 0 OR current_uses <= max_uses)
);

COMMENT ON CONSTRAINT coupons_current_uses_check ON coupons IS 'Allows unlimited uses when max_uses=0, otherwise enforces current_uses <= max_uses';
