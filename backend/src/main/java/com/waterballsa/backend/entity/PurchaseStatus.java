package com.waterballsa.backend.entity;

/**
 * Enum representing the status of a purchase.
 */
public enum PurchaseStatus {
    /**
     * Purchase created but payment not yet completed.
     */
    PENDING,

    /**
     * Payment successful, user has access to curriculum.
     */
    COMPLETED,

    /**
     * Purchase was cancelled before completion.
     */
    CANCELLED
}
