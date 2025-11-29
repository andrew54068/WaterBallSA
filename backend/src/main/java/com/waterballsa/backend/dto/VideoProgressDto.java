package com.waterballsa.backend.dto;

import com.waterballsa.backend.entity.VideoProgress;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VideoProgressDto {

    private Long id;
    private Long userId;
    private Long lessonId;
    private Double currentTimeSeconds;
    private Double durationSeconds;
    private Integer completionPercentage;
    private Boolean isCompleted;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * Factory method to create DTO from entity
     */
    public static VideoProgressDto from(VideoProgress entity) {
        if (entity == null) {
            return null;
        }

        return VideoProgressDto.builder()
                .id(entity.getId())
                .userId(entity.getUser() != null ? entity.getUser().getId() : null)
                .lessonId(entity.getLesson() != null ? entity.getLesson().getId() : null)
                .currentTimeSeconds(entity.getCurrentTimeSeconds())
                .durationSeconds(entity.getDurationSeconds())
                .completionPercentage(entity.getCompletionPercentage())
                .isCompleted(entity.getIsCompleted())
                .completedAt(entity.getCompletedAt())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
