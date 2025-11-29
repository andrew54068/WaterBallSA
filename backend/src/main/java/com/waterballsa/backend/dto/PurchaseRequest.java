package com.waterballsa.backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for creating a purchase.
 * Simplified for Phase 2 - no payment details needed, just curriculum ID.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseRequest {

    @NotNull(message = "Curriculum ID is required")
    private Long curriculumId;

    /**
     * Optional coupon code for discount (Phase 3 feature, not implemented yet).
     */
    private String couponCode;
}
