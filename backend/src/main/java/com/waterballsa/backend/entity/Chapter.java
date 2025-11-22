package com.waterballsa.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Chapter entity representing a section within a curriculum.
 *
 * Chapters organize lessons into logical groups and are ordered within their curriculum.
 */
@Entity
@Table(name = "chapters",
        indexes = {
                @Index(name = "idx_chapters_curriculum_id", columnList = "curriculum_id"),
                @Index(name = "idx_chapters_order_index", columnList = "curriculum_id,order_index"),
                @Index(name = "idx_chapters_is_published", columnList = "is_published")
        },
        uniqueConstraints = {
                @UniqueConstraint(name = "chapters_unique_order_per_curriculum",
                        columnNames = {"curriculum_id", "order_index"})
        })
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Chapter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Curriculum is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "curriculum_id", nullable = false, foreignKey = @ForeignKey(name = "fk_chapters_curriculum"))
    private Curriculum curriculum;

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @NotNull(message = "Order index is required")
    @PositiveOrZero(message = "Order index must be non-negative")
    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;

    // Metadata
    @Column(name = "is_published", nullable = false)
    @Builder.Default
    private Boolean isPublished = false;

    @PositiveOrZero(message = "Estimated duration must be non-negative")
    @Column(name = "estimated_duration_hours")
    private Integer estimatedDurationHours;

    // Relationships
    @OneToMany(mappedBy = "chapter", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("orderIndex ASC")
    @Builder.Default
    private List<Lesson> lessons = new ArrayList<>();

    // Audit fields
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /**
     * Publishes the chapter making it visible to users.
     */
    public void publish() {
        this.isPublished = true;
    }

    /**
     * Unpublishes the chapter hiding it from users.
     */
    public void unpublish() {
        this.isPublished = false;
    }

    /**
     * Adds a lesson to this chapter.
     *
     * @param lesson the lesson to add
     */
    public void addLesson(Lesson lesson) {
        lessons.add(lesson);
        lesson.setChapter(this);
    }

    /**
     * Removes a lesson from this chapter.
     *
     * @param lesson the lesson to remove
     */
    public void removeLesson(Lesson lesson) {
        lessons.remove(lesson);
        lesson.setChapter(null);
    }
}
