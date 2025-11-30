package com.waterballsa.backend.entity;

/**
 * Enum representing the type of discount for a coupon.
 */
public enum DiscountType {
    /**
     * Percentage discount (e.g., 20% off).
     * Discount value should be between 1-100.
     */
    PERCENTAGE,

    /**
     * Fixed amount discount (e.g., $15 off).
     * Discount value is a fixed monetary amount.
     */
    FIXED_AMOUNT
}
