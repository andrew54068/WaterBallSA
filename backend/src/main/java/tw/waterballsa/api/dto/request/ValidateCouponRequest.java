package tw.waterballsa.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ValidateCouponRequest {
    @NotNull(message = "Curriculum ID is required")
    private Integer curriculumId;

    @NotBlank(message = "Coupon code is required")
    private String couponCode;
}
