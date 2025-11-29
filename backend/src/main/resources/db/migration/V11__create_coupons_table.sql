-- Create coupons table for promotional discount codes
-- Phase 3 Feature: NOT implemented in Phase 2, schema only for future-proofing
-- This table structure is ready for Phase 3 but will not be used in Phase 2 business logic

CREATE TABLE IF NOT EXISTS coupons (
    id BIGSERIAL PRIMARY KEY,

    -- Coupon identification
    code VARCHAR(50) NOT NULL UNIQUE,  -- e.g., "WELCOME20", "SUMMER2025"

    -- Discount configuration
    discount_type VARCHAR(20) NOT NULL,      -- PERCENTAGE or FIXED_AMOUNT
    discount_value DECIMAL(10, 2) NOT NULL,  -- e.g., 20.00 for 20% or $20

    -- Validity period
    valid_from TIMESTAMP NOT NULL,
    valid_until TIMESTAMP NOT NULL,

    -- Usage limits
    max_uses INTEGER NOT NULL DEFAULT 0,      -- 0 = unlimited, >0 = limited uses
    current_uses INTEGER NOT NULL DEFAULT 0,  -- Current usage count

    -- Activation status
    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    -- Audit timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT coupons_discount_type_check CHECK (discount_type IN ('PERCENTAGE', 'FIXED_AMOUNT')),
    CONSTRAINT coupons_discount_value_check CHECK (discount_value > 0),
    CONSTRAINT coupons_percentage_range_check CHECK (
        discount_type != 'PERCENTAGE' OR (discount_value > 0 AND discount_value <= 100)
    ),
    CONSTRAINT coupons_date_range_check CHECK (valid_until > valid_from),
    CONSTRAINT coupons_max_uses_check CHECK (max_uses >= 0),
    CONSTRAINT coupons_current_uses_check CHECK (current_uses >= 0 AND current_uses <= max_uses)
);

-- Create indexes for query performance
CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_is_active ON coupons(is_active);
CREATE INDEX idx_coupons_valid_from ON coupons(valid_from);
CREATE INDEX idx_coupons_valid_until ON coupons(valid_until);

-- Composite index for checking validity (most common query in Phase 3)
CREATE INDEX idx_coupons_validity ON coupons(code, is_active, valid_from, valid_until);

-- Create trigger for auto-updating updated_at timestamp
CREATE TRIGGER update_coupons_updated_at
    BEFORE UPDATE ON coupons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add table and column comments for documentation
COMMENT ON TABLE coupons IS 'Promotional discount codes (Phase 3 feature - not used in Phase 2)';
COMMENT ON COLUMN coupons.code IS 'Unique coupon code entered by users (e.g., WELCOME20)';
COMMENT ON COLUMN coupons.discount_type IS 'Type of discount: PERCENTAGE (e.g., 20% off) or FIXED_AMOUNT (e.g., $10 off)';
COMMENT ON COLUMN coupons.discount_value IS 'Discount value: 1-100 for PERCENTAGE, any positive amount for FIXED_AMOUNT';
COMMENT ON COLUMN coupons.max_uses IS 'Maximum number of times this coupon can be used (0 = unlimited)';
COMMENT ON COLUMN coupons.current_uses IS 'Number of times this coupon has been used';
COMMENT ON COLUMN coupons.is_active IS 'Whether coupon is currently active (can be deactivated manually)';
