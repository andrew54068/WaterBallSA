-- Create purchases table for tracking user curriculum ownership
-- Phase 2: Access Control & Payment
-- Simplified version: Instant purchase (no payment gateway simulation)

CREATE TABLE IF NOT EXISTS purchases (
    id BIGSERIAL PRIMARY KEY,

    -- User and curriculum relationship
    user_id BIGINT NOT NULL,
    curriculum_id BIGINT NOT NULL,

    -- Pricing information (locked at purchase time)
    original_price DECIMAL(10, 2) NOT NULL, -- Curriculum price at time of purchase
    final_price DECIMAL(10, 2) NOT NULL,    -- Price after discount (if coupon used)

    -- Coupon support (Phase 3 feature - column exists but not used in Phase 2)
    coupon_code VARCHAR(50),

    -- Purchase status
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',

    -- Timestamps
    purchased_at TIMESTAMP,  -- Set when status changes to COMPLETED
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Foreign key constraints
    CONSTRAINT fk_purchases_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE RESTRICT,  -- Prevent user deletion if purchases exist

    CONSTRAINT fk_purchases_curriculum
        FOREIGN KEY (curriculum_id) REFERENCES curriculums(id)
        ON DELETE RESTRICT,  -- Prevent curriculum deletion if purchases exist

    -- Business rule constraints
    CONSTRAINT purchases_original_price_check CHECK (original_price >= 0),
    CONSTRAINT purchases_final_price_check CHECK (final_price >= 0),
    CONSTRAINT purchases_discount_check CHECK (final_price <= original_price),
    CONSTRAINT purchases_status_check CHECK (status IN ('PENDING', 'COMPLETED', 'CANCELLED')),

    -- Prevent duplicate purchases
    CONSTRAINT purchases_user_curriculum_unique UNIQUE (user_id, curriculum_id)
);

-- Create indexes for query performance
CREATE INDEX idx_purchases_user_id ON purchases(user_id);
CREATE INDEX idx_purchases_curriculum_id ON purchases(curriculum_id);
CREATE INDEX idx_purchases_status ON purchases(status);
CREATE INDEX idx_purchases_purchased_at ON purchases(purchased_at);
CREATE INDEX idx_purchases_created_at ON purchases(created_at DESC);

-- Composite index for checking ownership (most common query)
CREATE INDEX idx_purchases_user_curriculum_status ON purchases(user_id, curriculum_id, status);

-- Create trigger for auto-updating updated_at timestamp
CREATE TRIGGER update_purchases_updated_at
    BEFORE UPDATE ON purchases
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add table and column comments for documentation
COMMENT ON TABLE purchases IS 'Records user ownership of curriculums after purchase';
COMMENT ON COLUMN purchases.original_price IS 'Curriculum price at time of purchase (locked, never changes)';
COMMENT ON COLUMN purchases.final_price IS 'Actual price paid after coupon discount (if any)';
COMMENT ON COLUMN purchases.coupon_code IS 'Coupon code used for discount (Phase 3 feature, nullable)';
COMMENT ON COLUMN purchases.status IS 'Purchase status: PENDING (in progress), COMPLETED (successful), CANCELLED (abandoned)';
COMMENT ON COLUMN purchases.purchased_at IS 'Timestamp when purchase was completed (NULL if not completed)';
COMMENT ON CONSTRAINT purchases_user_curriculum_unique ON purchases IS 'Ensures user can only purchase same curriculum once';
