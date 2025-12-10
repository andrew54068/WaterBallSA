package tw.waterballsa.api.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "purchases")
public class Purchase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long userId;
    private Long curriculumId;
    private String status; // Using String for simplicity
    private Double originalPrice;
    private Double finalPrice;
    private String couponCode;
    private LocalDateTime purchasedAt;

    @jakarta.persistence.Column(name = "created_at", insertable = false, updatable = false)
    private java.time.LocalDateTime createdAt;

    @jakarta.persistence.Column(name = "updated_at", insertable = false, updatable = false)
    private java.time.LocalDateTime updatedAt;
}
