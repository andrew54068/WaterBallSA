package com.waterballsa.backend.dto;

import com.waterballsa.backend.entity.Curriculum;
import com.waterballsa.backend.entity.DifficultyLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * DTO for Curriculum entity.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CurriculumDto {

    private Long id;
    private String title;
    private String description;
    private String thumbnailUrl;
    private String instructorName;
    private BigDecimal price;
    private String currency;
    private DifficultyLevel difficultyLevel;
    private Integer estimatedDurationHours;
    private Boolean isPublished;
    private LocalDateTime publishedAt;
    private LocalDateTime createdAt;

    @Builder.Default
    private List<ChapterDto> chapters = new ArrayList<>();

    /**
     * Converts a Curriculum entity to CurriculumDto (without chapters).
     *
     * @param curriculum the curriculum entity
     * @return CurriculumDto instance
     */
    public static CurriculumDto from(Curriculum curriculum) {
        return CurriculumDto.builder()
                .id(curriculum.getId())
                .title(curriculum.getTitle())
                .description(curriculum.getDescription())
                .thumbnailUrl(curriculum.getThumbnailUrl())
                .instructorName(curriculum.getInstructorName())
                .price(curriculum.getPrice())
                .currency(curriculum.getCurrency())
                .difficultyLevel(curriculum.getDifficultyLevel())
                .estimatedDurationHours(curriculum.getEstimatedDurationHours())
                .isPublished(curriculum.getIsPublished())
                .publishedAt(curriculum.getPublishedAt())
                .createdAt(curriculum.getCreatedAt())
                .build();
    }

    /**
     * Converts a Curriculum entity to CurriculumDto with chapters and lessons.
     *
     * @param curriculum the curriculum entity
     * @return CurriculumDto instance with chapters and lessons
     */
    public static CurriculumDto fromWithChapters(Curriculum curriculum) {
        CurriculumDto dto = from(curriculum);
        dto.setChapters(curriculum.getChapters().stream()
                .map(ChapterDto::fromWithLessons)
                .collect(Collectors.toList()));
        return dto;
    }
}
