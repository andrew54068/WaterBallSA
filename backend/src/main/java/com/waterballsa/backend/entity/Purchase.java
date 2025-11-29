package com.waterballsa.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
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
 * Purchase entity representing a user's ownership of a curriculum.
 *
 * Business Rules:
 * - A user can only purchase the same curriculum once (enforced by UNIQUE constraint on user_id + curriculum_id)
 * - final_price must be <= original_price (discount can only reduce price)
 * - Status lifecycle: PENDING → COMPLETED or PENDING → CANCELLED
 * - purchased_at is set when status changes to COMPLETED
 */
@Entity
@Table(name = "purchases",
    uniqueConstraints = {
        @UniqueConstraint(name = "purchases_user_curriculum_unique",
                         columnNames = {"user_id", "curriculum_id"})
    },
    indexes = {
        @Index(name = "idx_purchases_user_id", columnList = "user_id"),
        @Index(name = "idx_purchases_curriculum_id", columnList = "curriculum_id"),
        @Index(name = "idx_purchases_status", columnList = "status"),
        @Index(name = "idx_purchases_user_curriculum_status",
               columnList = "user_id,curriculum_id,status"),
        @Index(name = "idx_purchases_purchased_at", columnList = "purchased_at"),
        @Index(name = "idx_purchases_created_at", columnList = "created_at")
    }
)
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Purchase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "User is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotNull(message = "Curriculum is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "curriculum_id", nullable = false)
    private Curriculum curriculum;

    @NotNull(message = "Original price is required")
    @PositiveOrZero(message = "Original price must be non-negative")
    @Column(name = "original_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal originalPrice;

    @NotNull(message = "Final price is required")
    @PositiveOrZero(message = "Final price must be non-negative")
    @Column(name = "final_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal finalPrice;

    @Column(name = "coupon_code", length = 50)
    private String couponCode;

    @NotNull(message = "Status is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private PurchaseStatus status = PurchaseStatus.PENDING;

    @Column(name = "purchased_at")
    private LocalDateTime purchasedAt;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /**
     * Completes the purchase by setting status to COMPLETED and recording purchase timestamp.
     * This method should be called after successful payment processing.
     *
     * @throws IllegalStateException if purchase is not in PENDING status
     */
    public void complete() {
        if (this.status != PurchaseStatus.PENDING) {
            throw new IllegalStateException(
                "Cannot complete purchase with status: " + this.status
            );
        }
        this.status = PurchaseStatus.COMPLETED;
        this.purchasedAt = LocalDateTime.now();
    }

    /**
     * Cancels the purchase by setting status to CANCELLED.
     *
     * @throws IllegalStateException if purchase is not in PENDING status
     */
    public void cancel() {
        if (this.status != PurchaseStatus.PENDING) {
            throw new IllegalStateException(
                "Cannot cancel purchase with status: " + this.status
            );
        }
        this.status = PurchaseStatus.CANCELLED;
    }

    /**
     * Checks if this purchase grants access to the curriculum.
     *
     * @return true if status is COMPLETED, false otherwise
     */
    public boolean grantsAccess() {
        return this.status == PurchaseStatus.COMPLETED;
    }

    /**
     * Validates that final price does not exceed original price.
     *
     * @throws IllegalArgumentException if final price > original price
     */
    @PrePersist
    @PreUpdate
    private void validatePrices() {
        if (finalPrice.compareTo(originalPrice) > 0) {
            throw new IllegalArgumentException(
                "Final price cannot exceed original price"
            );
        }
    }
}
