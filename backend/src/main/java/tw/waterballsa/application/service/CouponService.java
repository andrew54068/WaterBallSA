package tw.waterballsa.application.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tw.waterballsa.api.dto.request.ValidateCouponRequest;
import tw.waterballsa.api.dto.response.CouponValidationResponse;
import tw.waterballsa.api.entity.Coupon;
import tw.waterballsa.api.repository.CouponRepository;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class CouponService {

    @Autowired
    private CouponRepository couponRepository;

    @Transactional(readOnly = true)
    public CouponValidationResponse validateCoupon(ValidateCouponRequest request) {
        String couponCode = request.getCouponCode();
        Integer curriculumId = request.getCurriculumId();

        Optional<Coupon> couponOpt = couponRepository.findByCodeIgnoreCase(couponCode);

        if (couponOpt.isEmpty()) {
            return CouponValidationResponse.builder()
                    .valid(false)
                    .errorCode("COUPON_NOT_FOUND")
                    .errorMessage("Coupon not found")
                    .build();
        }

        Coupon coupon = couponOpt.get();

        // Check if coupon is active
        if (!coupon.getIsActive()) {
            return CouponValidationResponse.builder()
                    .valid(false)
                    .code(coupon.getCode())
                    .errorCode("COUPON_INACTIVE")
                    .errorMessage("Coupon is inactive")
                    .build();
        }

        // Check validity period
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(coupon.getValidFrom())) {
            return CouponValidationResponse.builder()
                    .valid(false)
                    .code(coupon.getCode())
                    .errorCode("COUPON_NOT_YET_VALID")
                    .errorMessage("Coupon not yet valid")
                    .build();
        }

        if (now.isAfter(coupon.getValidUntil())) {
            return CouponValidationResponse.builder()
                    .valid(false)
                    .code(coupon.getCode())
                    .errorCode("COUPON_EXPIRED")
                    .errorMessage("Coupon已過期")
                    .build();
        }

        // Check usage limit
        if (coupon.getUsageLimit() != null && coupon.getUsageCount() >= coupon.getUsageLimit()) {
            return CouponValidationResponse.builder()
                    .valid(false)
                    .code(coupon.getCode())
                    .errorCode("COUPON_USAGE_LIMIT_REACHED")
                    .errorMessage("Coupon usage limit reached")
                    .build();
        }

        // Check if applicable to this curriculum
        if (coupon.getApplicableCurriculumIds() != null && !coupon.getApplicableCurriculumIds().isEmpty()) {
            if (!coupon.getApplicableCurriculumIds().contains(curriculumId.longValue())) {
                return CouponValidationResponse.builder()
                        .valid(false)
                        .code(coupon.getCode())
                        .errorCode("COUPON_NOT_APPLICABLE")
                        .errorMessage("Coupon not applicable to curriculum")
                        .build();
            }
        }

        // Coupon is valid
        return CouponValidationResponse.builder()
                .valid(true)
                .code(coupon.getCode())
                .discountType(coupon.getDiscountType().name())
                .discountValue(coupon.getDiscountValue())
                .build();
    }

    @Transactional
    public void incrementUsageCount(String couponCode) {
        couponRepository.findByCodeIgnoreCase(couponCode).ifPresent(coupon -> {
            coupon.setUsageCount(coupon.getUsageCount() + 1);
            couponRepository.save(coupon);
        });
    }
}
