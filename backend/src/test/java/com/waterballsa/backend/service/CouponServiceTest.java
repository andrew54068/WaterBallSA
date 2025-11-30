package com.waterballsa.backend.service;

import com.waterballsa.backend.entity.Coupon;
import com.waterballsa.backend.entity.Curriculum;
import com.waterballsa.backend.entity.DiscountType;
import com.waterballsa.backend.exception.InvalidCouponException;
import com.waterballsa.backend.repository.CouponRepository;
import com.waterballsa.backend.repository.CurriculumRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * Unit tests for CouponService.
 * Following TDD principles - tests written first, then implementation.
 */
@ExtendWith(MockitoExtension.class)
class CouponServiceTest {

    @Mock
    private CouponRepository couponRepository;

    @Mock
    private CurriculumRepository curriculumRepository;

    @InjectMocks
    private CouponService couponService;

    private Curriculum testCurriculum;
    private Coupon validPercentageCoupon;
    private Coupon validFixedAmountCoupon;
    private Coupon expiredCoupon;
    private Coupon notStartedCoupon;
    private Coupon maxUsedCoupon;
    private Coupon inactiveCoupon;

    @BeforeEach
    void setUp() {
        // Setup test curriculum
        testCurriculum = Curriculum.builder()
                .id(1L)
                .title("React Mastery")
                .price(new BigDecimal("49.99"))
                .build();

        // Setup valid percentage coupon (20% off)
        validPercentageCoupon = Coupon.builder()
                .id(1L)
                .code("REACT20")
                .discountType(DiscountType.PERCENTAGE)
                .discountValue(new BigDecimal("20.00"))
                .validFrom(LocalDateTime.now().minusDays(1))
                .validUntil(LocalDateTime.now().plusDays(30))
                .maxUses(100)
                .currentUses(45)
                .isActive(true)
                .build();

        // Setup valid fixed amount coupon ($15 off)
        validFixedAmountCoupon = Coupon.builder()
                .id(2L)
                .code("SAVE15")
                .discountType(DiscountType.FIXED_AMOUNT)
                .discountValue(new BigDecimal("15.00"))
                .validFrom(LocalDateTime.now().minusDays(1))
                .validUntil(LocalDateTime.now().plusDays(30))
                .maxUses(0) // unlimited
                .currentUses(50)
                .isActive(true)
                .build();

        // Setup expired coupon
        expiredCoupon = Coupon.builder()
                .id(3L)
                .code("EXPIRED10")
                .discountType(DiscountType.PERCENTAGE)
                .discountValue(new BigDecimal("10.00"))
                .validFrom(LocalDateTime.now().minusDays(60))
                .validUntil(LocalDateTime.now().minusDays(30))
                .maxUses(100)
                .currentUses(50)
                .isActive(true)
                .build();

        // Setup not started coupon
        notStartedCoupon = Coupon.builder()
                .id(4L)
                .code("FUTURE10")
                .discountType(DiscountType.PERCENTAGE)
                .discountValue(new BigDecimal("10.00"))
                .validFrom(LocalDateTime.now().plusDays(1))
                .validUntil(LocalDateTime.now().plusDays(30))
                .maxUses(100)
                .currentUses(0)
                .isActive(true)
                .build();

        // Setup max used coupon
        maxUsedCoupon = Coupon.builder()
                .id(5L)
                .code("LIMITED")
                .discountType(DiscountType.PERCENTAGE)
                .discountValue(new BigDecimal("25.00"))
                .validFrom(LocalDateTime.now().minusDays(1))
                .validUntil(LocalDateTime.now().plusDays(30))
                .maxUses(100)
                .currentUses(100)
                .isActive(true)
                .build();

        // Setup inactive coupon
        inactiveCoupon = Coupon.builder()
                .id(6L)
                .code("INACTIVE")
                .discountType(DiscountType.PERCENTAGE)
                .discountValue(new BigDecimal("30.00"))
                .validFrom(LocalDateTime.now().minusDays(1))
                .validUntil(LocalDateTime.now().plusDays(30))
                .maxUses(100)
                .currentUses(10)
                .isActive(false)
                .build();
    }

    @Test
    void validateCoupon_withValidPercentageCoupon_shouldReturnValidResponse() {
        // Given
        when(curriculumRepository.findById(1L)).thenReturn(Optional.of(testCurriculum));
        when(couponRepository.findByCode("REACT20")).thenReturn(Optional.of(validPercentageCoupon));

        // When
        var result = couponService.validateCoupon(1L, "REACT20");

        // Then
        assertThat(result.getValid()).isTrue();
        assertThat(result.getCode()).isEqualTo("REACT20");
        assertThat(result.getDiscountType()).isEqualTo(DiscountType.PERCENTAGE);
        assertThat(result.getDiscountValue()).isEqualByComparingTo("20.00");
        assertThat(result.getDiscountAmount()).isEqualByComparingTo("10.00"); // 20% of 49.99 = 9.998 -> 10.00
        assertThat(result.getFinalPrice()).isEqualByComparingTo("39.99"); // 49.99 - 10.00
        assertThat(result.getOriginalPrice()).isEqualByComparingTo("49.99");
    }

    @Test
    void validateCoupon_withValidFixedAmountCoupon_shouldReturnValidResponse() {
        // Given
        when(curriculumRepository.findById(1L)).thenReturn(Optional.of(testCurriculum));
        when(couponRepository.findByCode("SAVE15")).thenReturn(Optional.of(validFixedAmountCoupon));

        // When
        var result = couponService.validateCoupon(1L, "SAVE15");

        // Then
        assertThat(result.getValid()).isTrue();
        assertThat(result.getDiscountType()).isEqualTo(DiscountType.FIXED_AMOUNT);
        assertThat(result.getDiscountValue()).isEqualByComparingTo("15.00");
        assertThat(result.getDiscountAmount()).isEqualByComparingTo("15.00");
        assertThat(result.getFinalPrice()).isEqualByComparingTo("34.99"); // 49.99 - 15.00
    }

    @Test
    void validateCoupon_withExpiredCoupon_shouldReturnInvalidResponse() {
        // Given
        when(curriculumRepository.findById(1L)).thenReturn(Optional.of(testCurriculum));
        when(couponRepository.findByCode("EXPIRED10")).thenReturn(Optional.of(expiredCoupon));

        // When
        var result = couponService.validateCoupon(1L, "EXPIRED10");

        // Then
        assertThat(result.getValid()).isFalse();
        assertThat(result.getError()).isEqualTo("COUPON_EXPIRED");
        assertThat(result.getMessage()).contains("expired");
        assertThat(result.getOriginalPrice()).isEqualByComparingTo("49.99");
    }

    @Test
    void validateCoupon_withNotStartedCoupon_shouldReturnInvalidResponse() {
        // Given
        when(curriculumRepository.findById(1L)).thenReturn(Optional.of(testCurriculum));
        when(couponRepository.findByCode("FUTURE10")).thenReturn(Optional.of(notStartedCoupon));

        // When
        var result = couponService.validateCoupon(1L, "FUTURE10");

        // Then
        assertThat(result.getValid()).isFalse();
        assertThat(result.getError()).isEqualTo("COUPON_NOT_STARTED");
        assertThat(result.getMessage()).contains("not yet valid");
    }

    @Test
    void validateCoupon_withMaxUsedCoupon_shouldReturnInvalidResponse() {
        // Given
        when(curriculumRepository.findById(1L)).thenReturn(Optional.of(testCurriculum));
        when(couponRepository.findByCode("LIMITED")).thenReturn(Optional.of(maxUsedCoupon));

        // When
        var result = couponService.validateCoupon(1L, "LIMITED");

        // Then
        assertThat(result.getValid()).isFalse();
        assertThat(result.getError()).isEqualTo("COUPON_MAX_USES");
        assertThat(result.getMessage()).contains("maximum uses");
    }

    @Test
    void validateCoupon_withInactiveCoupon_shouldReturnInvalidResponse() {
        // Given
        when(curriculumRepository.findById(1L)).thenReturn(Optional.of(testCurriculum));
        when(couponRepository.findByCode("INACTIVE")).thenReturn(Optional.of(inactiveCoupon));

        // When
        var result = couponService.validateCoupon(1L, "INACTIVE");

        // Then
        assertThat(result.getValid()).isFalse();
        assertThat(result.getError()).isEqualTo("COUPON_INACTIVE");
        assertThat(result.getMessage()).contains("not active");
    }

    @Test
    void validateCoupon_withNonExistentCoupon_shouldReturnInvalidResponse() {
        // Given
        when(curriculumRepository.findById(1L)).thenReturn(Optional.of(testCurriculum));
        when(couponRepository.findByCode("INVALID123")).thenReturn(Optional.empty());

        // When
        var result = couponService.validateCoupon(1L, "INVALID123");

        // Then
        assertThat(result.getValid()).isFalse();
        assertThat(result.getError()).isEqualTo("COUPON_NOT_FOUND");
        assertThat(result.getMessage()).contains("Invalid coupon code");
    }

    @Test
    void applyCoupon_withValidCoupon_shouldIncrementUsage() {
        // Given
        when(couponRepository.findByCode("REACT20")).thenReturn(Optional.of(validPercentageCoupon));
        when(couponRepository.save(any(Coupon.class))).thenReturn(validPercentageCoupon);

        // When
        couponService.applyCoupon("REACT20");

        // Then
        verify(couponRepository).save(validPercentageCoupon);
        assertThat(validPercentageCoupon.getCurrentUses()).isEqualTo(46);
    }

    @Test
    void applyCoupon_withNonExistentCoupon_shouldThrowException() {
        // Given
        when(couponRepository.findByCode("INVALID")).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> couponService.applyCoupon("INVALID"))
                .isInstanceOf(InvalidCouponException.class)
                .hasMessageContaining("not found");
    }
}
