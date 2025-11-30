package com.waterballsa.backend.service;

import com.waterballsa.backend.dto.OrderPreviewResponse;
import com.waterballsa.backend.dto.PurchaseRequest;
import com.waterballsa.backend.dto.PurchaseResponse;
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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PurchaseServiceTest {

    @Mock
    private PurchaseRepository purchaseRepository;

    @Mock
    private CurriculumRepository curriculumRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CouponRepository couponRepository;

    @Mock
    private ChapterRepository chapterRepository;

    @InjectMocks
    private PurchaseService purchaseService;

    private User testUser;
    private Curriculum paidCurriculum;
    private Curriculum freeCurriculum;
    private Coupon validCoupon;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .email("test@example.com")
                .name("Test User")
                .googleId("google123")
                .build();

        paidCurriculum = Curriculum.builder()
                .id(1L)
                .title("React Mastery")
                .description("Learn React")
                .price(new BigDecimal("49.99"))
                .isPublished(true)
                .chapters(new ArrayList<>())
                .build();

        freeCurriculum = Curriculum.builder()
                .id(2L)
                .title("Git Basics")
                .price(BigDecimal.ZERO)
                .isPublished(true)
                .build();

        validCoupon = Coupon.builder()
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
    }

    @Test
    void getOrderPreview_withValidCurriculum_shouldReturnPreview() {
        // Given
        when(curriculumRepository.findPublishedByIdWithChapters(1L))
                .thenReturn(Optional.of(paidCurriculum));
        when(purchaseRepository.existsByUserIdAndCurriculumIdAndStatus(
                testUser.getId(), 1L, PurchaseStatus.COMPLETED))
                .thenReturn(false);
        // No need to mock chapterRepository since paidCurriculum has no chapters

        // When
        OrderPreviewResponse result = purchaseService.getOrderPreview(1L, testUser.getId());

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getCurriculum()).isNotNull();
        assertThat(result.getOriginalPrice()).isEqualByComparingTo("49.99");
    }

    @Test
    void createPurchase_withValidData_shouldCreatePendingPurchase() {
        // Given
        PurchaseRequest request = new PurchaseRequest(1L, null);
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(curriculumRepository.findById(1L)).thenReturn(Optional.of(paidCurriculum));
        when(purchaseRepository.findByUserIdAndCurriculumId(1L, 1L))
                .thenReturn(Optional.empty());
        when(purchaseRepository.save(any(Purchase.class))).thenAnswer(i -> {
            Purchase p = i.getArgument(0);
            p.setId(1L);
            return p;
        });

        // When
        PurchaseResponse result = purchaseService.createPurchase(1L, request);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getStatus()).isEqualTo(PurchaseStatus.PENDING);
        assertThat(result.getOriginalPrice()).isEqualByComparingTo("49.99");
        assertThat(result.getFinalPrice()).isEqualByComparingTo("49.99");
        verify(purchaseRepository).save(any(Purchase.class));
    }

    @Test
    void createPurchase_withCoupon_shouldApplyDiscount() {
        // Given
        PurchaseRequest request = new PurchaseRequest(1L, "REACT20");
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(curriculumRepository.findById(1L)).thenReturn(Optional.of(paidCurriculum));
        when(couponRepository.findByCode("REACT20")).thenReturn(Optional.of(validCoupon));
        when(purchaseRepository.findByUserIdAndCurriculumId(1L, 1L))
                .thenReturn(Optional.empty());
        when(purchaseRepository.save(any(Purchase.class))).thenAnswer(i -> {
            Purchase p = i.getArgument(0);
            p.setId(1L);
            return p;
        });

        // When
        PurchaseResponse result = purchaseService.createPurchase(1L, request);

        // Then
        assertThat(result.getFinalPrice()).isLessThan(result.getOriginalPrice());
        assertThat(result.getCouponCode()).isEqualTo("REACT20");
        verify(couponRepository).save(validCoupon);
        assertThat(validCoupon.getCurrentUses()).isEqualTo(46);
    }

    @Test
    void createPurchase_forAlreadyOwnedCurriculum_shouldThrowException() {
        // Given
        PurchaseRequest request = new PurchaseRequest(1L, null);
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(curriculumRepository.findById(1L)).thenReturn(Optional.of(paidCurriculum));

        Purchase existingPurchase = Purchase.builder()
                .id(1L)
                .user(testUser)
                .curriculum(paidCurriculum)
                .status(PurchaseStatus.COMPLETED)
                .purchasedAt(LocalDateTime.now().minusDays(5))
                .build();

        when(purchaseRepository.findByUserIdAndCurriculumId(1L, 1L))
                .thenReturn(Optional.of(existingPurchase));

        // When & Then
        assertThatThrownBy(() -> purchaseService.createPurchase(1L, request))
                .isInstanceOf(DuplicatePurchaseException.class)
                .hasMessageContaining("already own");
    }

    @Test
    void createPurchase_forFreeCurriculum_shouldThrowException() {
        // Given
        PurchaseRequest request = new PurchaseRequest(2L, null);
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(curriculumRepository.findById(2L)).thenReturn(Optional.of(freeCurriculum));

        // When & Then
        assertThatThrownBy(() -> purchaseService.createPurchase(1L, request))
                .isInstanceOf(FreeCurriculumException.class)
                .hasMessageContaining("free curriculum");
    }

    @Test
    void checkOwnership_whenPurchaseCompleted_shouldReturnOwned() {
        // Given
        when(curriculumRepository.findById(1L)).thenReturn(Optional.of(paidCurriculum));

        Purchase completedPurchase = Purchase.builder()
                .id(1L)
                .user(testUser)
                .curriculum(paidCurriculum)
                .status(PurchaseStatus.COMPLETED)
                .purchasedAt(LocalDateTime.now())
                .build();

        when(purchaseRepository.findCompletedPurchase(1L, 1L, PurchaseStatus.COMPLETED))
                .thenReturn(Optional.of(completedPurchase));

        // When
        var result = purchaseService.checkOwnership(1L, 1L);

        // Then
        assertThat(result.isOwns()).isTrue();
        assertThat(result.getPurchaseId()).isEqualTo(1L);
        assertThat(result.getPurchaseDate()).isNotNull();
    }

    @Test
    void checkOwnership_whenNoPurchase_shouldReturnNotOwned() {
        // Given
        when(curriculumRepository.findById(1L)).thenReturn(Optional.of(paidCurriculum));
        when(purchaseRepository.findCompletedPurchase(1L, 1L, PurchaseStatus.COMPLETED))
                .thenReturn(Optional.empty());

        // When
        var result = purchaseService.checkOwnership(1L, 1L);

        // Then
        assertThat(result.isOwns()).isFalse();
    }

    @Test
    void checkOwnership_forFreeCurriculum_shouldReturnOwned() {
        // Given
        when(curriculumRepository.findById(2L)).thenReturn(Optional.of(freeCurriculum));

        // When
        var result = purchaseService.checkOwnership(1L, 2L);

        // Then
        assertThat(result.isOwns()).isTrue();
        assertThat(result.getPurchaseId()).isNull();
    }

    @Test
    void getUserPurchases_shouldReturnPaginatedResults() {
        // Given
        Purchase purchase = Purchase.builder()
                .id(1L)
                .user(testUser)
                .curriculum(paidCurriculum)
                .originalPrice(new BigDecimal("49.99"))
                .finalPrice(new BigDecimal("49.99"))
                .status(PurchaseStatus.COMPLETED)
                .purchasedAt(LocalDateTime.now())
                .build();

        Page<Purchase> purchasePage = new PageImpl<>(List.of(purchase), PageRequest.of(0, 10), 1);
        when(purchaseRepository.findByUserIdWithCurriculum(eq(1L), any(Pageable.class)))
                .thenReturn(purchasePage);

        // When
        Page<PurchaseResponse> result = purchaseService.getUserPurchases(1L, PageRequest.of(0, 10));

        // Then
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getCurriculumTitle()).isEqualTo("React Mastery");
    }
}
