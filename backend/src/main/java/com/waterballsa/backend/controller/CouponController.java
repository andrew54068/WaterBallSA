package com.waterballsa.backend.controller;

import com.waterballsa.backend.dto.CouponValidationResponse;
import com.waterballsa.backend.dto.ValidateCouponRequest;
import com.waterballsa.backend.service.CouponService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for coupon validation.
 */
@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
@Tag(name = "Coupons", description = "Coupon validation and management APIs")
public class CouponController {

    private final CouponService couponService;

    @PostMapping("/validate")
    @Operation(
            summary = "Validate a coupon code",
            description = "Validates a coupon code for a specific curriculum and returns discount information"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Coupon validation result (may be valid or invalid)",
                    content = @Content(schema = @Schema(implementation = CouponValidationResponse.class))
            ),
            @ApiResponse(responseCode = "400", description = "Invalid request"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<CouponValidationResponse> validateCoupon(
            @Valid @RequestBody ValidateCouponRequest request
    ) {
        CouponValidationResponse response = couponService.validateCoupon(
                request.getCurriculumId(),
                request.getCouponCode()
        );
        return ResponseEntity.ok(response);
    }
}
