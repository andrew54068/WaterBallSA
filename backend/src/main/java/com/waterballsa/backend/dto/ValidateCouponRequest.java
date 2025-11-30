package com.waterballsa.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for validating a coupon code.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ValidateCouponRequest {

    @NotNull(message = "Curriculum ID is required")
    private Long curriculumId;

    @NotBlank(message = "Coupon code is required")
    private String couponCode;
}
