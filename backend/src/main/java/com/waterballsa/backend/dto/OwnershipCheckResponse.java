package com.waterballsa.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for ownership check response.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OwnershipCheckResponse {

    private boolean owns;
    private Long purchaseId;
    private LocalDateTime purchaseDate;

    /**
     * Creates a response indicating the user does not own the curriculum.
     *
     * @return OwnershipCheckResponse with owns=false
     */
    public static OwnershipCheckResponse notOwned() {
        return OwnershipCheckResponse.builder()
                .owns(false)
                .build();
    }

    /**
     * Creates a response indicating the user owns the curriculum.
     *
     * @param purchaseId the purchase ID
     * @param purchaseDate the purchase date
     * @return OwnershipCheckResponse with owns=true
     */
    public static OwnershipCheckResponse owned(Long purchaseId, LocalDateTime purchaseDate) {
        return OwnershipCheckResponse.builder()
                .owns(true)
                .purchaseId(purchaseId)
                .purchaseDate(purchaseDate)
                .build();
    }
}
