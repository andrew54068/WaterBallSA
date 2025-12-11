package tw.waterballsa.api.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SaveProgressRequest {
    @NotNull(message = "Current time seconds is required")
    @DecimalMin(value = "0.0", message = "Current time must be >= 0")
    private BigDecimal currentTimeSeconds;

    @NotNull(message = "Duration seconds is required")
    @DecimalMin(value = "0.0", message = "Duration must be >= 0")
    private BigDecimal durationSeconds;

    @NotNull(message = "Completion percentage is required")
    @DecimalMin(value = "0.0", message = "Completion percentage must be >= 0")
    @DecimalMax(value = "100.0", message = "Completion percentage must be <= 100")
    private BigDecimal completionPercentage;

    @NotNull(message = "Is completed is required")
    private Boolean isCompleted;
}
