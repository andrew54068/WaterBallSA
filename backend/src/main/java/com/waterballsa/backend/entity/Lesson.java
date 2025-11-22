package com.waterballsa.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Lesson entity representing individual learning content within a chapter.
 *
 * Lessons can be of three types:
 * - VIDEO: Video content accessed via URL
 * - ARTICLE: Text/markdown content
 * - SURVEY: Form/questionnaire content
 */
@Entity
@Table(name = "lessons",
        indexes = {
                @Index(name = "idx_lessons_chapter_id", columnList = "chapter_id"),
                @Index(name = "idx_lessons_order_index", columnList = "chapter_id,order_index"),
                @Index(name = "idx_lessons_lesson_type", columnList = "lesson_type"),
                @Index(name = "idx_lessons_is_free_preview", columnList = "is_free_preview"),
                @Index(name = "idx_lessons_is_published", columnList = "is_published")
        },
        uniqueConstraints = {
                @UniqueConstraint(name = "lessons_unique_order_per_chapter",
                        columnNames = {"chapter_id", "order_index"})
        })
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Lesson {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Chapter is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chapter_id", nullable = false, foreignKey = @ForeignKey(name = "fk_lessons_chapter"))
    private Chapter chapter;

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @NotNull(message = "Lesson type is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "lesson_type", nullable = false, length = 50)
    private LessonType lessonType;

    @Size(max = 1000, message = "Content URL must not exceed 1000 characters")
    @Column(name = "content_url", length = 1000)
    private String contentUrl;

    @NotNull(message = "Order index is required")
    @PositiveOrZero(message = "Order index must be non-negative")
    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;

    @Positive(message = "Duration must be positive")
    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    // Phase 2: Free preview flag
    @Column(name = "is_free_preview", nullable = false)
    @Builder.Default
    private Boolean isFreePreview = false;

    @Column(name = "is_published", nullable = false)
    @Builder.Default
    private Boolean isPublished = false;

    // JSONB field for storing type-specific metadata
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "content_metadata", columnDefinition = "jsonb")
    @Builder.Default
    private Map<String, Object> contentMetadata = new HashMap<>();

    // Audit fields
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /**
     * Publishes the lesson making it visible to users.
     */
    public void publish() {
        this.isPublished = true;
    }

    /**
     * Unpublishes the lesson hiding it from users.
     */
    public void unpublish() {
        this.isPublished = false;
    }

    /**
     * Marks this lesson as a free preview, accessible without purchase.
     */
    public void markAsFreePreview() {
        this.isFreePreview = true;
    }

    /**
     * Removes the free preview flag from this lesson.
     */
    public void removeFromFreePreview() {
        this.isFreePreview = false;
    }

    /**
     * Adds or updates a metadata entry.
     *
     * @param key the metadata key
     * @param value the metadata value
     */
    public void addMetadata(String key, Object value) {
        if (this.contentMetadata == null) {
            this.contentMetadata = new HashMap<>();
        }
        this.contentMetadata.put(key, value);
    }

    /**
     * Removes a metadata entry.
     *
     * @param key the metadata key to remove
     */
    public void removeMetadata(String key) {
        if (this.contentMetadata != null) {
            this.contentMetadata.remove(key);
        }
    }

    /**
     * Checks if this is a video lesson.
     *
     * @return true if lesson type is VIDEO
     */
    public boolean isVideo() {
        return this.lessonType == LessonType.VIDEO;
    }

    /**
     * Checks if this is an article lesson.
     *
     * @return true if lesson type is ARTICLE
     */
    public boolean isArticle() {
        return this.lessonType == LessonType.ARTICLE;
    }

    /**
     * Checks if this is a survey lesson.
     *
     * @return true if lesson type is SURVEY
     */
    public boolean isSurvey() {
        return this.lessonType == LessonType.SURVEY;
    }
}
