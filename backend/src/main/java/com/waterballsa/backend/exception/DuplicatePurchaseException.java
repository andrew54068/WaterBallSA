package com.waterballsa.backend.exception;

import lombok.Getter;

import java.time.LocalDateTime;

/**
 * Exception thrown when a user attempts to purchase a curriculum they already own.
 */
@Getter
public class DuplicatePurchaseException extends RuntimeException {

    private final Long existingPurchaseId;
    private final LocalDateTime purchaseDate;

    public DuplicatePurchaseException(String message, Long existingPurchaseId, LocalDateTime purchaseDate) {
        super(message);
        this.existingPurchaseId = existingPurchaseId;
        this.purchaseDate = purchaseDate;
    }
}
