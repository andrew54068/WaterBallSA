package com.waterballsa.backend.exception;

/**
 * Exception thrown when a coupon is invalid.
 * This includes cases where:
 * - Coupon does not exist
 * - Coupon has expired
 * - Coupon is not yet valid
 * - Coupon has reached maximum uses
 * - Coupon is inactive
 */
public class InvalidCouponException extends RuntimeException {

    private final String couponCode;
    private final String errorCode;

    public InvalidCouponException(String couponCode, String errorCode, String message) {
        super(message);
        this.couponCode = couponCode;
        this.errorCode = errorCode;
    }

    public String getCouponCode() {
        return couponCode;
    }

    public String getErrorCode() {
        return errorCode;
    }
}
