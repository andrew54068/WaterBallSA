package com.waterballsa.backend.dto;

import com.waterballsa.backend.entity.Lesson;
import com.waterballsa.backend.entity.LessonType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * DTO for Lesson entity.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LessonDto {

    private Long id;
    private Long chapterId;
    private String title;
    private String description;
    private LessonType lessonType;
    private String contentUrl;
    private Integer orderIndex;
    private Integer durationMinutes;
    private Boolean isFreePreview;
    private Boolean isPublished;
    private LocalDateTime createdAt;

    @Builder.Default
    private Map<String, Object> contentMetadata = new HashMap<>();

    /**
     * Converts a Lesson entity to LessonDto.
     *
     * @param lesson the lesson entity
     * @return LessonDto instance
     */
    public static LessonDto from(Lesson lesson) {
        return LessonDto.builder()
                .id(lesson.getId())
                .chapterId(lesson.getChapter() != null ? lesson.getChapter().getId() : null)
                .title(lesson.getTitle())
                .description(lesson.getDescription())
                .lessonType(lesson.getLessonType())
                .contentUrl(lesson.getContentUrl())
                .orderIndex(lesson.getOrderIndex())
                .durationMinutes(lesson.getDurationMinutes())
                .isFreePreview(lesson.getIsFreePreview())
                .isPublished(lesson.getIsPublished())
                .createdAt(lesson.getCreatedAt())
                .contentMetadata(lesson.getContentMetadata() != null ?
                        lesson.getContentMetadata() : new HashMap<>())
                .build();
    }
}
