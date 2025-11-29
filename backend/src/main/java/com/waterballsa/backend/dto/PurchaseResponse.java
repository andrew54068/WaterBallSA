package com.waterballsa.backend.dto;

import com.waterballsa.backend.entity.Purchase;
import com.waterballsa.backend.entity.PurchaseStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for purchase response.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseResponse {

    private Long purchaseId;
    private Long curriculumId;
    private String curriculumTitle;
    private String curriculumThumbnailUrl;
    private BigDecimal originalPrice;
    private BigDecimal finalPrice;
    private String couponCode;
    private PurchaseStatus status;
    private LocalDateTime purchasedAt;
    private LocalDateTime createdAt;

    /**
     * Creates a PurchaseResponse from a Purchase entity.
     *
     * @param purchase the purchase entity
     * @return PurchaseResponse instance
     */
    public static PurchaseResponse from(Purchase purchase) {
        return PurchaseResponse.builder()
                .purchaseId(purchase.getId())
                .curriculumId(purchase.getCurriculum().getId())
                .curriculumTitle(purchase.getCurriculum().getTitle())
                .curriculumThumbnailUrl(purchase.getCurriculum().getThumbnailUrl())
                .originalPrice(purchase.getOriginalPrice())
                .finalPrice(purchase.getFinalPrice())
                .couponCode(purchase.getCouponCode())
                .status(purchase.getStatus())
                .purchasedAt(purchase.getPurchasedAt())
                .createdAt(purchase.getCreatedAt())
                .build();
    }
}
