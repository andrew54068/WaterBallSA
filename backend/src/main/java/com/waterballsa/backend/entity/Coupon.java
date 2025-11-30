package com.waterballsa.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Coupon entity representing promotional discount codes.
 *
 * Business Rules:
 * - Coupon must be active (is_active = true)
 * - Current date must be between valid_from and valid_until
 * - current_uses must be less than max_uses (if max_uses > 0)
 * - Percentage discounts must be between 0-100
 * - Fixed amount discounts can be any positive value
 * - current_uses cannot exceed max_uses
 */
@Entity
@Table(name = "coupons", indexes = {
        @Index(name = "idx_coupons_code", columnList = "code"),
        @Index(name = "idx_coupons_is_active", columnList = "is_active"),
        @Index(name = "idx_coupons_valid_from", columnList = "valid_from"),
        @Index(name = "idx_coupons_valid_until", columnList = "valid_until"),
        @Index(name = "idx_coupons_validity", columnList = "code,is_active,valid_from,valid_until")
})
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Coupon code is required")
    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @NotNull(message = "Discount type is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "discount_type", nullable = false, length = 20)
    private DiscountType discountType;

    @NotNull(message = "Discount value is required")
    @Positive(message = "Discount value must be positive")
    @Column(name = "discount_value", nullable = false, precision = 10, scale = 2)
    private BigDecimal discountValue;

    @NotNull(message = "Valid from date is required")
    @Column(name = "valid_from", nullable = false)
    private LocalDateTime validFrom;

    @NotNull(message = "Valid until date is required")
    @Column(name = "valid_until", nullable = false)
    private LocalDateTime validUntil;

    @NotNull(message = "Max uses is required")
    @PositiveOrZero(message = "Max uses must be non-negative")
    @Column(name = "max_uses", nullable = false)
    @Builder.Default
    private Integer maxUses = 0;

    @NotNull(message = "Current uses is required")
    @PositiveOrZero(message = "Current uses must be non-negative")
    @Column(name = "current_uses", nullable = false)
    @Builder.Default
    private Integer currentUses = 0;

    @NotNull(message = "Is active is required")
    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /**
     * Checks if the coupon is currently valid for use.
     *
     * @return true if coupon is active, within validity period, and has uses remaining
     */
    public boolean isValid() {
        LocalDateTime now = LocalDateTime.now();
        boolean withinDateRange = !now.isBefore(validFrom) && !now.isAfter(validUntil);
        boolean hasUsesRemaining = maxUses == 0 || currentUses < maxUses;
        return isActive && withinDateRange && hasUsesRemaining;
    }

    /**
     * Checks if the coupon has expired.
     *
     * @return true if current date is after valid_until
     */
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(validUntil);
    }

    /**
     * Checks if the coupon has not started yet.
     *
     * @return true if current date is before valid_from
     */
    public boolean isNotStarted() {
        return LocalDateTime.now().isBefore(validFrom);
    }

    /**
     * Checks if the coupon has reached maximum uses.
     *
     * @return true if current_uses >= max_uses (and max_uses > 0)
     */
    public boolean hasReachedMaxUses() {
        return maxUses > 0 && currentUses >= maxUses;
    }

    /**
     * Increments the usage count by 1.
     *
     * @throws IllegalStateException if coupon has already reached max uses
     */
    public void incrementUsage() {
        if (hasReachedMaxUses()) {
            throw new IllegalStateException("Coupon has reached maximum uses");
        }
        this.currentUses++;
    }

    /**
     * Calculates the discount amount for a given price.
     *
     * @param originalPrice the original price before discount
     * @return the discount amount (not exceeding original price)
     */
    public BigDecimal calculateDiscountAmount(BigDecimal originalPrice) {
        if (originalPrice == null || originalPrice.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }

        BigDecimal discountAmount;
        if (discountType == DiscountType.PERCENTAGE) {
            // Percentage discount: discountValue is 1-100
            discountAmount = originalPrice
                    .multiply(discountValue)
                    .divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);
        } else {
            // Fixed amount discount
            discountAmount = discountValue;
        }

        // Ensure discount doesn't exceed original price
        return discountAmount.min(originalPrice);
    }

    /**
     * Validates coupon constraints before persist/update.
     */
    @PrePersist
    @PreUpdate
    private void validateConstraints() {
        if (validUntil != null && validFrom != null && !validUntil.isAfter(validFrom)) {
            throw new IllegalArgumentException("Valid until must be after valid from");
        }
        if (discountType == DiscountType.PERCENTAGE) {
            if (discountValue.compareTo(BigDecimal.ZERO) <= 0 ||
                discountValue.compareTo(BigDecimal.valueOf(100)) > 0) {
                throw new IllegalArgumentException("Percentage discount must be between 0 and 100");
            }
        }
        if (currentUses != null && maxUses != null && maxUses > 0 && currentUses > maxUses) {
            throw new IllegalArgumentException("Current uses cannot exceed max uses");
        }
    }
}
