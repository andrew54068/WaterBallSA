package com.waterballsa.backend.dto;

import com.waterballsa.backend.entity.DiscountType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO for coupon validation response.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CouponValidationResponse {

    private Boolean valid;
    private String code;
    private DiscountType discountType;
    private BigDecimal discountValue;
    private BigDecimal discountAmount;
    private BigDecimal finalPrice;
    private BigDecimal originalPrice;
    private String error;
    private String message;

    /**
     * Creates a valid coupon response.
     *
     * @param code coupon code
     * @param discountType type of discount
     * @param discountValue discount value (percentage or fixed amount)
     * @param discountAmount calculated discount amount
     * @param originalPrice original price before discount
     * @param finalPrice final price after discount
     * @return CouponValidationResponse instance
     */
    public static CouponValidationResponse valid(
            String code,
            DiscountType discountType,
            BigDecimal discountValue,
            BigDecimal discountAmount,
            BigDecimal originalPrice,
            BigDecimal finalPrice) {
        return CouponValidationResponse.builder()
                .valid(true)
                .code(code)
                .discountType(discountType)
                .discountValue(discountValue)
                .discountAmount(discountAmount)
                .originalPrice(originalPrice)
                .finalPrice(finalPrice)
                .build();
    }

    /**
     * Creates an invalid coupon response.
     *
     * @param error error code
     * @param message error message
     * @param originalPrice original price (unchanged)
     * @return CouponValidationResponse instance
     */
    public static CouponValidationResponse invalid(String error, String message, BigDecimal originalPrice) {
        return CouponValidationResponse.builder()
                .valid(false)
                .error(error)
                .message(message)
                .originalPrice(originalPrice)
                .build();
    }
}
