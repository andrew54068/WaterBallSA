package tw.waterballsa.api.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "coupons")
public class Coupon {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String code;

    private String discountType; // PERCENTAGE, AMOUNT
    private Double discountValue;

    private LocalDateTime validFrom;
    private LocalDateTime validUntil;

    private Integer usageLimit;
    private Integer usageCount;

    @Column(columnDefinition = "jsonb")
    private String applicableCurriculumIds;

    private Boolean isActive;

    @jakarta.persistence.Column(name = "created_at", insertable = false, updatable = false)
    private java.time.LocalDateTime createdAt;

    @jakarta.persistence.Column(name = "updated_at", insertable = false, updatable = false)
    private java.time.LocalDateTime updatedAt;
}
