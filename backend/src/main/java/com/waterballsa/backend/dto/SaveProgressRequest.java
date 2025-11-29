package com.waterballsa.backend.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SaveProgressRequest {

    @NotNull(message = "Current time seconds is required")
    @PositiveOrZero(message = "Current time seconds must be positive or zero")
    private Double currentTimeSeconds;

    @NotNull(message = "Duration seconds is required")
    @Positive(message = "Duration seconds must be positive")
    private Double durationSeconds;

    @NotNull(message = "Completion percentage is required")
    @Min(value = 0, message = "Completion percentage must be between 0 and 100")
    @Max(value = 100, message = "Completion percentage must be between 0 and 100")
    private Integer completionPercentage;

    @NotNull(message = "Completed flag is required")
    private Boolean isCompleted;

    /**
     * Custom validation: current time should not exceed duration
     */
    @AssertTrue(message = "Current time cannot exceed duration")
    public boolean isCurrentTimeValid() {
        if (currentTimeSeconds == null || durationSeconds == null) {
            return true; // Let @NotNull handle null validation
        }
        return currentTimeSeconds <= durationSeconds;
    }
}
