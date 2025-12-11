package tw.waterballsa.api.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "video_progress", uniqueConstraints = {
    @UniqueConstraint(name = "unique_user_lesson", columnNames = {"user_id", "lesson_id"})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class VideoProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id", nullable = false)
    private Lesson lesson;

    @Column(name = "current_time_seconds", nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal currentTimeSeconds = BigDecimal.ZERO;

    @Column(name = "duration_seconds", nullable = false, precision = 10, scale = 2)
    private BigDecimal durationSeconds;

    @Column(name = "completion_percentage", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal completionPercentage = BigDecimal.ZERO;

    @Column(name = "is_completed")
    @Builder.Default
    private Boolean isCompleted = false;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Get user ID directly from the relationship
     * @return User ID or null if user is not set
     */
    public Long getUserId() {
        return user != null ? user.getId() : null;
    }

    /**
     * Get lesson ID directly from the relationship
     * @return Lesson ID or null if lesson is not set
     */
    public Long getLessonId() {
        return lesson != null ? lesson.getId() : null;
    }
}
