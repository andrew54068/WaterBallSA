package tw.waterballsa.application.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tw.waterballsa.api.dto.request.CreatePurchaseRequest;
import tw.waterballsa.api.dto.response.*;
import tw.waterballsa.api.entity.Curriculum;
import tw.waterballsa.api.entity.Purchase;
import tw.waterballsa.api.entity.User;
import tw.waterballsa.api.exception.BadRequestException;
import tw.waterballsa.api.exception.ResourceNotFoundException;
import tw.waterballsa.api.exception.UnauthorizedException;
import tw.waterballsa.api.repository.CurriculumRepository;
import tw.waterballsa.api.repository.PurchaseRepository;
import tw.waterballsa.api.repository.UserRepository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PurchaseService {

    @Autowired
    private PurchaseRepository purchaseRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CurriculumRepository curriculumRepository;

    @Transactional(readOnly = true)
    public OrderPreviewResponse getOrderPreview(Integer userId, Integer curriculumId) {
        User user = userRepository.findById(userId.longValue())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Curriculum curriculum = curriculumRepository.findById(curriculumId.longValue())
                .orElseThrow(() -> new ResourceNotFoundException("Curriculum", "id", curriculumId));

        // Check if user already owns the curriculum
        boolean alreadyOwned = purchaseRepository.existsByUserIdAndCurriculumIdAndStatus(
                userId.longValue(), curriculumId.longValue(), Purchase.PurchaseStatus.COMPLETED);

        if (alreadyOwned) {
            throw new BadRequestException("User already owns this curriculum");
        }

        OrderPreviewResponse.CurriculumInfo curriculumInfo = OrderPreviewResponse.CurriculumInfo.builder()
                .id(curriculum.getId().intValue())
                .title(curriculum.getTitle())
                .price(curriculum.getPrice())
                .currency(curriculum.getCurrency())
                .build();

        return OrderPreviewResponse.builder()
                .curriculum(curriculumInfo)
                .originalPrice(curriculum.getPrice())
                .build();
    }

    @Transactional
    public PurchaseResponse createPurchase(Integer userId, CreatePurchaseRequest request) {
        User user = userRepository.findById(userId.longValue())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Curriculum curriculum = curriculumRepository.findById(request.getCurriculumId().longValue())
                .orElseThrow(() -> new ResourceNotFoundException("Curriculum", "id", request.getCurriculumId()));

        // Check if user already has a purchase for this curriculum
        boolean alreadyOwned = purchaseRepository.existsByUserIdAndCurriculumIdAndStatus(
                userId.longValue(), request.getCurriculumId().longValue(), Purchase.PurchaseStatus.COMPLETED);

        if (alreadyOwned) {
            throw new BadRequestException("User already owns this curriculum");
        }

        // Calculate final price (without coupon for now)
        BigDecimal originalPrice = curriculum.getPrice();
        BigDecimal finalPrice = originalPrice;

        // Create purchase
        Purchase purchase = Purchase.builder()
                .user(user)
                .curriculum(curriculum)
                .originalPrice(originalPrice)
                .finalPrice(finalPrice)
                .status(Purchase.PurchaseStatus.PENDING)
                .build();

        purchase = purchaseRepository.save(purchase);

        return convertToResponse(purchase);
    }

    @Transactional
    public PurchaseResponse completePurchase(Integer userId, Integer purchaseId) {
        Purchase purchase = purchaseRepository.findById(purchaseId.longValue())
                .orElseThrow(() -> new ResourceNotFoundException("Purchase", "id", purchaseId));

        // Verify ownership
        if (!purchase.getUserId().equals(userId.longValue())) {
            throw new UnauthorizedException("User does not own this purchase");
        }

        // Verify purchase is pending
        if (purchase.getStatus() != Purchase.PurchaseStatus.PENDING) {
            throw new BadRequestException("Purchase is not in PENDING status");
        }

        // Complete the purchase (mock payment)
        purchase.setStatus(Purchase.PurchaseStatus.COMPLETED);
        purchase.setPurchasedAt(LocalDateTime.now());
        purchase = purchaseRepository.save(purchase);

        return convertToResponse(purchase);
    }

    @Transactional(readOnly = true)
    public OwnershipCheckResponse checkOwnership(Integer userId, Integer curriculumId) {
        boolean owns = purchaseRepository.existsByUserIdAndCurriculumIdAndStatus(
                userId.longValue(), curriculumId.longValue(), Purchase.PurchaseStatus.COMPLETED);

        return OwnershipCheckResponse.builder()
                .owns(owns)
                .build();
    }

    @Transactional(readOnly = true)
    public PaginatedPurchasesResponse getMyPurchases(Integer userId, int page, int size, String sortBy, String direction) {
        Sort.Direction sortDirection = direction != null && direction.equalsIgnoreCase("asc")
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;

        String sortField = sortBy != null ? sortBy : "createdAt";
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortField));

        Page<Purchase> purchasePage = purchaseRepository.findByUserId(userId.longValue(), pageable);

        List<PurchaseResponse> content = purchasePage.getContent().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());

        return PaginatedPurchasesResponse.builder()
                .content(content)
                .totalPages(purchasePage.getTotalPages())
                .totalElements(purchasePage.getTotalElements())
                .size(purchasePage.getSize())
                .page(purchasePage.getNumber())
                .build();
    }

    @Transactional(readOnly = true)
    public PaginatedPurchasesResponse getCompletedPurchases(Integer userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "purchasedAt"));

        Page<Purchase> purchasePage = purchaseRepository.findByUserIdAndStatus(
                userId.longValue(), Purchase.PurchaseStatus.COMPLETED, pageable);

        List<PurchaseResponse> content = purchasePage.getContent().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());

        return PaginatedPurchasesResponse.builder()
                .content(content)
                .totalPages(purchasePage.getTotalPages())
                .totalElements(purchasePage.getTotalElements())
                .size(purchasePage.getSize())
                .page(purchasePage.getNumber())
                .build();
    }

    @Transactional(readOnly = true)
    public PurchaseResponse getPurchaseById(Integer userId, Integer purchaseId) {
        Purchase purchase = purchaseRepository.findById(purchaseId.longValue())
                .orElseThrow(() -> new ResourceNotFoundException("Purchase", "id", purchaseId));

        // Verify ownership
        if (!purchase.getUserId().equals(userId.longValue())) {
            throw new UnauthorizedException("User does not own this purchase");
        }

        return convertToResponse(purchase);
    }

    private PurchaseResponse convertToResponse(Purchase purchase) {
        PurchaseResponse.PurchaseResponseBuilder builder = PurchaseResponse.builder()
                .purchaseId(purchase.getId().intValue())
                .curriculumId(purchase.getCurriculumId().intValue())
                .originalPrice(purchase.getOriginalPrice())
                .finalPrice(purchase.getFinalPrice())
                .status(purchase.getStatus().name())
                .createdAt(purchase.getCreatedAt());

        if (purchase.getCouponCode() != null) {
            builder.couponCode(purchase.getCouponCode());
        }

        if (purchase.getPurchasedAt() != null) {
            builder.purchasedAt(purchase.getPurchasedAt());
        }

        return builder.build();
    }
}
