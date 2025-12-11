package tw.waterballsa.api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseResponse {
    private Integer purchaseId;
    private Integer curriculumId;
    private String curriculumTitle;
    private BigDecimal originalPrice;
    private BigDecimal finalPrice;
    private String couponCode;
    private String status;
    private LocalDateTime purchasedAt;
    private LocalDateTime createdAt;
}
