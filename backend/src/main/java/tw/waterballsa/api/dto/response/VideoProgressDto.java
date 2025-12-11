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
public class VideoProgressDto {
    private Integer id;
    private Integer userId;
    private Integer lessonId;
    private BigDecimal currentTimeSeconds;
    private BigDecimal durationSeconds;
    private BigDecimal completionPercentage;
    private Boolean isCompleted;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
