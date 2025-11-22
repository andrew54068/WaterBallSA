package com.waterballsa.backend.dto;

import com.waterballsa.backend.entity.Chapter;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * DTO for Chapter entity.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChapterDto {

    private Long id;
    private Long curriculumId;
    private String title;
    private String description;
    private Integer orderIndex;
    private Boolean isPublished;
    private Integer estimatedDurationHours;
    private LocalDateTime createdAt;

    @Builder.Default
    private List<LessonDto> lessons = new ArrayList<>();

    /**
     * Converts a Chapter entity to ChapterDto (without lessons).
     *
     * @param chapter the chapter entity
     * @return ChapterDto instance
     */
    public static ChapterDto from(Chapter chapter) {
        return ChapterDto.builder()
                .id(chapter.getId())
                .curriculumId(chapter.getCurriculum() != null ? chapter.getCurriculum().getId() : null)
                .title(chapter.getTitle())
                .description(chapter.getDescription())
                .orderIndex(chapter.getOrderIndex())
                .isPublished(chapter.getIsPublished())
                .estimatedDurationHours(chapter.getEstimatedDurationHours())
                .createdAt(chapter.getCreatedAt())
                .build();
    }

    /**
     * Converts a Chapter entity to ChapterDto with lessons.
     *
     * @param chapter the chapter entity
     * @return ChapterDto instance with lessons
     */
    public static ChapterDto fromWithLessons(Chapter chapter) {
        ChapterDto dto = from(chapter);
        dto.setLessons(chapter.getLessons().stream()
                .map(LessonDto::from)
                .collect(Collectors.toList()));
        return dto;
    }
}
