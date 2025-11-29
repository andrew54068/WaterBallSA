package com.waterballsa.backend.repository;

import com.waterballsa.backend.entity.Purchase;
import com.waterballsa.backend.entity.PurchaseStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for Purchase entity operations.
 *
 * Provides database access methods for purchase management including:
 * - Finding purchases by user and curriculum
 * - Checking ownership
 * - Retrieving purchase history
 */
@Repository
public interface PurchaseRepository extends JpaRepository<Purchase, Long> {

    /**
     * Finds a purchase by user ID and curriculum ID.
     *
     * @param userId the user ID
     * @param curriculumId the curriculum ID
     * @return an Optional containing the purchase if found
     */
    Optional<Purchase> findByUserIdAndCurriculumId(Long userId, Long curriculumId);

    /**
     * Checks if a user owns a curriculum (has a completed purchase).
     *
     * @param userId the user ID
     * @param curriculumId the curriculum ID
     * @param status the purchase status (should be COMPLETED)
     * @return true if user has a completed purchase for this curriculum
     */
    boolean existsByUserIdAndCurriculumIdAndStatus(
        Long userId, Long curriculumId, PurchaseStatus status);

    /**
     * Finds all purchases for a user, ordered by purchase date descending.
     *
     * @param userId the user ID
     * @param pageable pagination information
     * @return page of user's purchases
     */
    @Query("SELECT p FROM Purchase p " +
           "LEFT JOIN FETCH p.curriculum c " +
           "WHERE p.user.id = :userId " +
           "ORDER BY p.purchasedAt DESC NULLS LAST, p.createdAt DESC")
    Page<Purchase> findByUserIdWithCurriculum(@Param("userId") Long userId, Pageable pageable);

    /**
     * Finds all completed purchases for a user.
     *
     * @param userId the user ID
     * @param status the purchase status (should be COMPLETED)
     * @param pageable pagination information
     * @return page of completed purchases
     */
    @Query("SELECT p FROM Purchase p " +
           "LEFT JOIN FETCH p.curriculum c " +
           "WHERE p.user.id = :userId AND p.status = :status " +
           "ORDER BY p.purchasedAt DESC")
    Page<Purchase> findByUserIdAndStatus(
        @Param("userId") Long userId,
        @Param("status") PurchaseStatus status,
        Pageable pageable);

    /**
     * Finds a completed purchase by user ID and curriculum ID with curriculum details.
     *
     * @param userId the user ID
     * @param curriculumId the curriculum ID
     * @param status the purchase status (should be COMPLETED)
     * @return an Optional containing the purchase if found
     */
    @Query("SELECT p FROM Purchase p " +
           "LEFT JOIN FETCH p.curriculum c " +
           "WHERE p.user.id = :userId AND p.curriculum.id = :curriculumId AND p.status = :status")
    Optional<Purchase> findCompletedPurchase(
        @Param("userId") Long userId,
        @Param("curriculumId") Long curriculumId,
        @Param("status") PurchaseStatus status);

    /**
     * Counts total purchases for a user with given status.
     *
     * @param userId the user ID
     * @param status the purchase status
     * @return count of purchases
     */
    long countByUserIdAndStatus(Long userId, PurchaseStatus status);

    /**
     * Counts total purchases for a curriculum.
     *
     * @param curriculumId the curriculum ID
     * @param status the purchase status (should be COMPLETED)
     * @return count of purchases
     */
    long countByCurriculumIdAndStatus(Long curriculumId, PurchaseStatus status);
}
