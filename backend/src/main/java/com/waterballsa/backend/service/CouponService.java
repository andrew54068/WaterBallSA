package com.waterballsa.backend.service;

import com.waterballsa.backend.dto.CouponValidationResponse;
import com.waterballsa.backend.entity.Coupon;
import com.waterballsa.backend.entity.Curriculum;
import com.waterballsa.backend.exception.InvalidCouponException;
import com.waterballsa.backend.exception.ResourceNotFoundException;
import com.waterballsa.backend.repository.CouponRepository;
import com.waterballsa.backend.repository.CurriculumRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

/**
 * Service for managing coupons and discount validation.
 */
@Service
@RequiredArgsConstructor
public class CouponService {

    private final CouponRepository couponRepository;
    private final CurriculumRepository curriculumRepository;

    /**
     * Validates a coupon code for a specific curriculum.
     *
     * @param curriculumId the curriculum ID
     * @param couponCode the coupon code to validate
     * @return CouponValidationResponse with validation result and discount details
     */
    @Transactional(readOnly = true)
    public CouponValidationResponse validateCoupon(Long curriculumId, String couponCode) {
        // Get curriculum to calculate discount
        Curriculum curriculum = curriculumRepository.findById(curriculumId)
                .orElseThrow(() -> new ResourceNotFoundException("Curriculum not found with ID: " + curriculumId));

        BigDecimal originalPrice = curriculum.getPrice();

        // Find coupon
        Coupon coupon = couponRepository.findByCode(couponCode)
                .orElse(null);

        if (coupon == null) {
            return CouponValidationResponse.invalid(
                    "COUPON_NOT_FOUND",
                    "Invalid coupon code",
                    originalPrice
            );
        }

        // Check if coupon is active
        if (!coupon.getIsActive()) {
            return CouponValidationResponse.invalid(
                    "COUPON_INACTIVE",
                    "Coupon is not active",
                    originalPrice
            );
        }

        // Check if coupon has expired
        if (coupon.isExpired()) {
            return CouponValidationResponse.invalid(
                    "COUPON_EXPIRED",
                    "Coupon has expired",
                    originalPrice
            );
        }

        // Check if coupon has not started
        if (coupon.isNotStarted()) {
            return CouponValidationResponse.invalid(
                    "COUPON_NOT_STARTED",
                    "Coupon is not yet valid",
                    originalPrice
            );
        }

        // Check if coupon has reached max uses
        if (coupon.hasReachedMaxUses()) {
            return CouponValidationResponse.invalid(
                    "COUPON_MAX_USES",
                    "Coupon has reached maximum uses",
                    originalPrice
            );
        }

        // Calculate discount
        BigDecimal discountAmount = coupon.calculateDiscountAmount(originalPrice);
        BigDecimal finalPrice = originalPrice.subtract(discountAmount);

        return CouponValidationResponse.valid(
                coupon.getCode(),
                coupon.getDiscountType(),
                coupon.getDiscountValue(),
                discountAmount,
                originalPrice,
                finalPrice
        );
    }

    /**
     * Applies a coupon by incrementing its usage count.
     * This should be called when an order is created with a coupon.
     *
     * @param couponCode the coupon code to apply
     * @throws InvalidCouponException if coupon not found
     */
    @Transactional
    public void applyCoupon(String couponCode) {
        Coupon coupon = couponRepository.findByCode(couponCode)
                .orElseThrow(() -> new InvalidCouponException(
                        couponCode,
                        "COUPON_NOT_FOUND",
                        "Coupon not found: " + couponCode
                ));

        coupon.incrementUsage();
        couponRepository.save(coupon);
    }
}
