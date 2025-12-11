package tw.waterballsa.api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OwnershipCheckResponse {
    private Boolean owns;
    private Integer purchaseId;
    private LocalDateTime purchaseDate;
}
