package com.waterballsa.backend.service;

import com.waterballsa.backend.dto.*;
import com.waterballsa.backend.entity.*;
import com.waterballsa.backend.exception.DuplicatePurchaseException;
import com.waterballsa.backend.exception.FreeCurriculumException;
import com.waterballsa.backend.exception.InvalidCouponException;
import com.waterballsa.backend.exception.ResourceNotFoundException;
import com.waterballsa.backend.repository.ChapterRepository;
import com.waterballsa.backend.repository.CouponRepository;
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
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

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
    private final CouponRepository couponRepository;
    private final ChapterRepository chapterRepository;

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

        // Check if curriculum is free
        if (curriculum.isFree()) {
            throw new FreeCurriculumException(
                    curriculum.getId(),
                    "Cannot create purchase for free curriculum"
            );
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
            // If there's a pending purchase, return it so user can proceed to payment
            log.info("Found existing {} purchase, returning it for payment", existing.getStatus());
            return PurchaseResponse.from(existing);
        }

        // Calculate pricing with coupon if provided
        BigDecimal originalPrice = curriculum.getPrice();
        BigDecimal finalPrice = originalPrice;
        String couponCode = request.getCouponCode();

        if (couponCode != null && !couponCode.isBlank()) {
            Coupon coupon = couponRepository.findByCode(couponCode)
                    .orElseThrow(() -> new InvalidCouponException(
                            couponCode, "COUPON_NOT_FOUND", "Coupon not found"));

            // Validate coupon
            if (!coupon.isValid()) {
                if (coupon.isExpired()) {
                    throw new InvalidCouponException(couponCode, "COUPON_EXPIRED", "Coupon has expired");
                } else if (coupon.isNotStarted()) {
                    throw new InvalidCouponException(couponCode, "COUPON_NOT_STARTED", "Coupon is not yet valid");
                } else if (coupon.hasReachedMaxUses()) {
                    throw new InvalidCouponException(couponCode, "COUPON_MAX_USES", "Coupon has reached maximum uses");
                } else if (!coupon.getIsActive()) {
                    throw new InvalidCouponException(couponCode, "COUPON_INACTIVE", "Coupon is not active");
                }
            }

            // Calculate discount
            BigDecimal discountAmount = coupon.calculateDiscountAmount(originalPrice);
            finalPrice = originalPrice.subtract(discountAmount);

            // Increment coupon usage
            coupon.incrementUsage();
            couponRepository.save(coupon);
            log.info("Applied coupon {} with discount {}", couponCode, discountAmount);
        }

        // Create new purchase with PENDING status
        Purchase purchase = Purchase.builder()
                .user(user)
                .curriculum(curriculum)
                .originalPrice(originalPrice)
                .finalPrice(finalPrice)
                .couponCode(couponCode)
                .status(PurchaseStatus.PENDING)
                .build();

        Purchase savedPurchase = purchaseRepository.save(purchase);
        log.info("Purchase {} created with PENDING status for user {} and curriculum {}",
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

    /**
     * Completes a pending purchase (mock payment in Phase 2).
     * In production, this would be called after payment gateway confirmation.
     *
     * @param purchaseId the purchase ID
     * @param userId the user ID (for authorization)
     * @return completed purchase response
     * @throws ResourceNotFoundException if purchase not found
     * @throws IllegalStateException if purchase doesn't belong to user or already completed
     */
    @Transactional
    public PurchaseResponse completePurchase(Long purchaseId, Long userId) {
        log.debug("Completing purchase {} for user {}", purchaseId, userId);

        Purchase purchase = purchaseRepository.findById(purchaseId)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase", "id", purchaseId));

        // Authorization check
        if (!purchase.getUser().getId().equals(userId)) {
            throw new IllegalStateException("Purchase does not belong to user");
        }

        // Check if already completed
        if (purchase.getStatus() == PurchaseStatus.COMPLETED) {
            log.warn("Purchase {} is already completed", purchaseId);
            return PurchaseResponse.from(purchase);
        }

        // Complete the purchase (Phase 2: mock payment always succeeds)
        purchase.complete();
        Purchase completedPurchase = purchaseRepository.save(purchase);

        log.info("Purchase {} completed successfully for user {}", purchaseId, userId);
        return PurchaseResponse.from(completedPurchase);
    }

    /**
     * Gets order preview for a curriculum (for order confirmation page).
     * Uses two queries to avoid MultipleBagFetchException:
     * 1. Fetch curriculum with chapters
     * 2. Fetch lessons for all chapters
     *
     * @param curriculumId the curriculum ID
     * @param userId the user ID
     * @return OrderPreviewResponse with full curriculum details
     * @throws ResourceNotFoundException if curriculum not found
     * @throws DuplicatePurchaseException if user already owns curriculum
     */
    @Transactional(readOnly = true)
    public OrderPreviewResponse getOrderPreview(Long curriculumId, Long userId) {
        log.debug("Getting order preview for curriculum {} and user {}", curriculumId, userId);

        // Query 1: Fetch curriculum with chapters (but not lessons)
        Curriculum curriculum = curriculumRepository.findPublishedByIdWithChapters(curriculumId)
                .orElseThrow(() -> new ResourceNotFoundException("Curriculum", "id", curriculumId));

        // Check if user already owns this curriculum
        if (purchaseRepository.existsByUserIdAndCurriculumIdAndStatus(
                userId, curriculumId, PurchaseStatus.COMPLETED)) {
            Purchase existingPurchase = purchaseRepository.findCompletedPurchase(
                    userId, curriculumId, PurchaseStatus.COMPLETED)
                    .orElseThrow(() -> new ResourceNotFoundException("Purchase record not found"));
            throw new DuplicatePurchaseException(
                    "You already own this curriculum",
                    existingPurchase.getId(),
                    existingPurchase.getPurchasedAt()
            );
        }

        // Query 2: Fetch lessons for all chapters in a single query (avoids N+1)
        List<Long> chapterIds = curriculum.getChapters().stream()
                .map(Chapter::getId)
                .collect(Collectors.toList());

        if (!chapterIds.isEmpty()) {
            // This will fetch all lessons for the chapters and populate the lessons collections
            chapterRepository.findByIdInWithLessons(chapterIds);
        }

        // Convert to DTOs
        CurriculumDto curriculumDto = convertToCurriculumDto(curriculum);
        var chapterDtos = curriculum.getChapters().stream()
                .map(this::convertToChapterDto)
                .collect(Collectors.toList());

        int totalLessons = curriculum.getChapters().stream()
                .mapToInt(chapter -> chapter.getLessons().size())
                .sum();

        return OrderPreviewResponse.builder()
                .curriculum(curriculumDto)
                .chapters(chapterDtos)
                .originalPrice(curriculum.getPrice())
                .totalChapters(curriculum.getChapters().size())
                .totalLessons(totalLessons)
                .build();
    }

    private CurriculumDto convertToCurriculumDto(Curriculum curriculum) {
        return CurriculumDto.builder()
                .id(curriculum.getId())
                .title(curriculum.getTitle())
                .description(curriculum.getDescription())
                .thumbnailUrl(curriculum.getThumbnailUrl())
                .instructorName(curriculum.getInstructorName())
                .price(curriculum.getPrice())
                .currency(curriculum.getCurrency())
                .isPublished(curriculum.getIsPublished())
                .difficultyLevel(curriculum.getDifficultyLevel())
                .estimatedDurationHours(curriculum.getEstimatedDurationHours())
                .createdAt(curriculum.getCreatedAt())
                .publishedAt(curriculum.getPublishedAt())
                .build();
    }

    private ChapterDto convertToChapterDto(Chapter chapter) {
        var lessonDtos = chapter.getLessons().stream()
                .map(this::convertToLessonDto)
                .collect(Collectors.toList());

        return ChapterDto.builder()
                .id(chapter.getId())
                .curriculumId(chapter.getCurriculum().getId())
                .title(chapter.getTitle())
                .description(chapter.getDescription())
                .orderIndex(chapter.getOrderIndex())
                .lessons(lessonDtos)
                .build();
    }

    private LessonDto convertToLessonDto(Lesson lesson) {
        return LessonDto.builder()
                .id(lesson.getId())
                .chapterId(lesson.getChapter().getId())
                .title(lesson.getTitle())
                .description(lesson.getDescription())
                .lessonType(lesson.getLessonType())
                .contentUrl(lesson.getContentUrl())
                .durationMinutes(lesson.getDurationMinutes())
                .orderIndex(lesson.getOrderIndex())
                .isFreePreview(lesson.getIsFreePreview())
                .build();
    }
}
