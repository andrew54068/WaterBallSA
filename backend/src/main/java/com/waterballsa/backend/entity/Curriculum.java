package com.waterballsa.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Curriculum entity representing a course or learning path.
 *
 * A curriculum contains:
 * - Multiple chapters organized in sequence
 * - Pricing information (for Phase 2 purchase system)
 * - Metadata like difficulty level and estimated duration
 */
@Entity
@Table(name = "curriculums", indexes = {
        @Index(name = "idx_curriculums_is_published", columnList = "is_published"),
        @Index(name = "idx_curriculums_difficulty_level", columnList = "difficulty_level"),
        @Index(name = "idx_curriculums_instructor_name", columnList = "instructor_name")
})
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Curriculum {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    @Column(nullable = false)
    private String title;

    @NotBlank(message = "Description is required")
    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "thumbnail_url", length = 500)
    private String thumbnailUrl;

    @NotBlank(message = "Instructor name is required")
    @Column(name = "instructor_name", nullable = false)
    private String instructorName;

    // Pricing fields (Phase 2)
    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Price must be non-negative")
    @Column(nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal price = BigDecimal.ZERO;

    @NotBlank(message = "Currency is required")
    @Size(min = 3, max = 3, message = "Currency must be a 3-letter code")
    @Column(nullable = false, length = 3)
    @Builder.Default
    private String currency = "USD";

    // Metadata
    @Column(name = "is_published", nullable = false)
    @Builder.Default
    private Boolean isPublished = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "difficulty_level", length = 50)
    private DifficultyLevel difficultyLevel;

    @Positive(message = "Estimated duration must be positive")
    @Column(name = "estimated_duration_hours")
    private Integer estimatedDurationHours;

    // Relationships
    @OneToMany(mappedBy = "curriculum", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("orderIndex ASC")
    @Builder.Default
    private List<Chapter> chapters = new ArrayList<>();

    // Audit fields
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    /**
     * Publishes the curriculum making it visible to users.
     */
    public void publish() {
        this.isPublished = true;
        this.publishedAt = LocalDateTime.now();
    }

    /**
     * Unpublishes the curriculum hiding it from users.
     */
    public void unpublish() {
        this.isPublished = false;
        this.publishedAt = null;
    }

    /**
     * Adds a chapter to this curriculum.
     *
     * @param chapter the chapter to add
     */
    public void addChapter(Chapter chapter) {
        chapters.add(chapter);
        chapter.setCurriculum(this);
    }

    /**
     * Removes a chapter from this curriculum.
     *
     * @param chapter the chapter to remove
     */
    public void removeChapter(Chapter chapter) {
        chapters.remove(chapter);
        chapter.setCurriculum(null);
    }

    /**
     * Checks if the curriculum is free (price is 0).
     *
     * @return true if price is 0, false otherwise
     */
    public boolean isFree() {
        return price.compareTo(BigDecimal.ZERO) == 0;
    }
}
