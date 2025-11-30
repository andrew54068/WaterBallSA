package com.waterballsa.backend.repository;

import com.waterballsa.backend.entity.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Repository interface for Coupon entity operations.
 *
 * Provides database access methods for coupon management including:
 * - Finding coupons by code
 * - Finding active and valid coupons
 * - Checking coupon validity
 */
@Repository
public interface CouponRepository extends JpaRepository<Coupon, Long> {

    /**
     * Finds a coupon by its code (case-insensitive).
     *
     * @param code the coupon code
     * @return an Optional containing the coupon if found
     */
    @Query("SELECT c FROM Coupon c WHERE UPPER(c.code) = UPPER(:code)")
    Optional<Coupon> findByCode(@Param("code") String code);

    /**
     * Finds an active coupon by code that is currently valid.
     * A coupon is valid if:
     * - is_active = true
     * - current date is between valid_from and valid_until
     * - current_uses < max_uses (if max_uses > 0)
     *
     * @param code the coupon code
     * @param now the current timestamp
     * @return an Optional containing the coupon if found and valid
     */
    @Query("SELECT c FROM Coupon c WHERE " +
           "UPPER(c.code) = UPPER(:code) AND " +
           "c.isActive = true AND " +
           ":now >= c.validFrom AND " +
           ":now <= c.validUntil AND " +
           "(c.maxUses = 0 OR c.currentUses < c.maxUses)")
    Optional<Coupon> findActiveByCode(@Param("code") String code, @Param("now") LocalDateTime now);

    /**
     * Checks if a coupon code exists (case-insensitive).
     *
     * @param code the coupon code
     * @return true if coupon exists
     */
    @Query("SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END FROM Coupon c WHERE UPPER(c.code) = UPPER(:code)")
    boolean existsByCode(@Param("code") String code);
}
