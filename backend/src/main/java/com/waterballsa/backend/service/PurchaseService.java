package com.waterballsa.backend.service;

import com.waterballsa.backend.dto.OwnershipCheckResponse;
import com.waterballsa.backend.dto.PurchaseRequest;
import com.waterballsa.backend.dto.PurchaseResponse;
import com.waterballsa.backend.entity.Curriculum;
import com.waterballsa.backend.entity.Purchase;
import com.waterballsa.backend.entity.PurchaseStatus;
import com.waterballsa.backend.entity.User;
import com.waterballsa.backend.exception.DuplicatePurchaseException;
import com.waterballsa.backend.exception.ResourceNotFoundException;
import com.waterballsa.backend.repository.CurriculumRepository;
import com.waterballsa.backend.repository.PurchaseRepository;
import com.waterballsa.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;

/**
 * Service for managing purchases and curriculum ownership.
 *
 * Handles business logic for:
 * - Creating purchases (simplified mock payment in Phase 2)
 * - Checking curriculum ownership
 * - Retrieving purchase history
 * - Preventing duplicate purchases
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PurchaseService {

    private final PurchaseRepository purchaseRepository;
    private final CurriculumRepository curriculumRepository;
    private final UserRepository userRepository;

    /**
     * Creates a purchase for a curriculum.
     * In Phase 2, this is simplified - payment is instant and always succeeds.
     *
     * @param userId the user ID
     * @param request the purchase request containing curriculum ID
     * @return purchase response
     * @throws ResourceNotFoundException if user or curriculum not found
     * @throws DuplicatePurchaseException if user already owns the curriculum
     */
    @Transactional
    public PurchaseResponse createPurchase(Long userId, PurchaseRequest request) {
        log.debug("Creating purchase for user {} and curriculum {}", userId, request.getCurriculumId());

        // Validate user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Validate curriculum exists and is published
        Curriculum curriculum = curriculumRepository.findById(request.getCurriculumId())
                .orElseThrow(() -> new ResourceNotFoundException("Curriculum", "id", request.getCurriculumId()));

        if (!curriculum.getIsPublished()) {
            throw new IllegalStateException("Cannot purchase unpublished curriculum");
        }

        // Check for duplicate purchase
        Optional<Purchase> existingPurchase = purchaseRepository.findByUserIdAndCurriculumId(
                userId, request.getCurriculumId());

        if (existingPurchase.isPresent()) {
            Purchase existing = existingPurchase.get();
            if (existing.getStatus() == PurchaseStatus.COMPLETED) {
                throw new DuplicatePurchaseException(
                        "User already owns this curriculum",
                        existing.getId(),
                        existing.getPurchasedAt()
                );
            }
            // If there's a pending or cancelled purchase, we can complete it
            log.info("Found existing {} purchase, updating to COMPLETED", existing.getStatus());
            existing.complete();
            purchaseRepository.save(existing);
            return PurchaseResponse.from(existing);
        }

        // Create new purchase
        Purchase purchase = Purchase.builder()
                .user(user)
                .curriculum(curriculum)
                .originalPrice(curriculum.getPrice())
                .finalPrice(curriculum.getPrice()) // No coupon support in Phase 2
                .couponCode(request.getCouponCode())
                .status(PurchaseStatus.PENDING)
                .build();

        // Simplified Phase 2: Instantly complete the purchase (mock payment always succeeds)
        purchase.complete();

        Purchase savedPurchase = purchaseRepository.save(purchase);
        log.info("Purchase {} completed successfully for user {} and curriculum {}",
                savedPurchase.getId(), userId, request.getCurriculumId());

        return PurchaseResponse.from(savedPurchase);
    }

    /**
     * Checks if a user owns a curriculum.
     *
     * @param userId the user ID
     * @param curriculumId the curriculum ID
     * @return ownership check response
     */
    @Transactional(readOnly = true)
    public OwnershipCheckResponse checkOwnership(Long userId, Long curriculumId) {
        log.debug("Checking ownership for user {} and curriculum {}", userId, curriculumId);

        // Check if curriculum is free
        Curriculum curriculum = curriculumRepository.findById(curriculumId)
                .orElseThrow(() -> new ResourceNotFoundException("Curriculum", "id", curriculumId));

        if (curriculum.getPrice().compareTo(BigDecimal.ZERO) == 0) {
            // Free curriculum - no purchase needed
            return OwnershipCheckResponse.owned(null, null);
        }

        // Check for completed purchase
        Optional<Purchase> purchase = purchaseRepository.findCompletedPurchase(
                userId, curriculumId, PurchaseStatus.COMPLETED);

        if (purchase.isPresent()) {
            Purchase p = purchase.get();
            return OwnershipCheckResponse.owned(p.getId(), p.getPurchasedAt());
        }

        return OwnershipCheckResponse.notOwned();
    }

    /**
     * Retrieves all purchases for a user.
     *
     * @param userId the user ID
     * @param pageable pagination information
     * @return page of purchase responses
     */
    @Transactional(readOnly = true)
    public Page<PurchaseResponse> getUserPurchases(Long userId, Pageable pageable) {
        log.debug("Fetching purchases for user {}, page: {}", userId, pageable.getPageNumber());

        return purchaseRepository.findByUserIdWithCurriculum(userId, pageable)
                .map(PurchaseResponse::from);
    }

    /**
     * Retrieves completed purchases for a user.
     *
     * @param userId the user ID
     * @param pageable pagination information
     * @return page of completed purchase responses
     */
    @Transactional(readOnly = true)
    public Page<PurchaseResponse> getCompletedPurchases(Long userId, Pageable pageable) {
        log.debug("Fetching completed purchases for user {}", userId);

        return purchaseRepository.findByUserIdAndStatus(userId, PurchaseStatus.COMPLETED, pageable)
                .map(PurchaseResponse::from);
    }

    /**
     * Retrieves a purchase by ID.
     * Ensures the purchase belongs to the specified user.
     *
     * @param purchaseId the purchase ID
     * @param userId the user ID (for authorization check)
     * @return purchase response
     * @throws ResourceNotFoundException if purchase not found
     * @throws IllegalStateException if purchase does not belong to user
     */
    @Transactional(readOnly = true)
    public PurchaseResponse getPurchaseById(Long purchaseId, Long userId) {
        log.debug("Fetching purchase {} for user {}", purchaseId, userId);

        Purchase purchase = purchaseRepository.findById(purchaseId)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase", "id", purchaseId));

        // Authorization check
        if (!purchase.getUser().getId().equals(userId)) {
            throw new IllegalStateException("Purchase does not belong to user");
        }

        return PurchaseResponse.from(purchase);
    }

    /**
     * Counts total completed purchases for a user.
     *
     * @param userId the user ID
     * @return count of completed purchases
     */
    @Transactional(readOnly = true)
    public long countUserPurchases(Long userId) {
        return purchaseRepository.countByUserIdAndStatus(userId, PurchaseStatus.COMPLETED);
    }
}
