package com.waterballsa.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "video_progress")
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
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

    @Column(name = "current_time_seconds", nullable = false)
    private Double currentTimeSeconds;

    @Column(name = "duration_seconds", nullable = false)
    private Double durationSeconds;

    @Column(name = "completion_percentage", nullable = false)
    private Integer completionPercentage;

    @Column(name = "is_completed", nullable = false)
    private Boolean isCompleted;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /**
     * Update progress with new playback position
     */
    public void updateProgress(Double currentTime, Double duration) {
        this.currentTimeSeconds = Math.min(currentTime, duration); // Cap at duration
        this.durationSeconds = duration;
        this.completionPercentage = calculateCompletionPercentage(currentTime, duration);

        if (shouldMarkComplete()) {
            markAsCompleted();
        }
    }

    /**
     * Mark lesson as completed
     */
    public void markAsCompleted() {
        if (!this.isCompleted) {
            this.isCompleted = true;
            this.completionPercentage = 100;
            this.completedAt = LocalDateTime.now();
        }
        // Note: If already completed, preserve the original completedAt timestamp
    }

    /**
     * Check if progress should be marked as complete
     * - Videos >= 30 seconds: 95% threshold
     * - Videos < 30 seconds: 100% threshold
     */
    public boolean shouldMarkComplete() {
        if (durationSeconds == null || durationSeconds == 0) {
            return false;
        }

        double threshold = durationSeconds < 30 ? 100.0 : 95.0;
        return completionPercentage >= threshold;
    }

    /**
     * Calculate completion percentage
     */
    private Integer calculateCompletionPercentage(Double current, Double duration) {
        if (duration == null || duration == 0) {
            return 0;
        }
        double percentage = (current / duration) * 100.0;
        return Math.min(100, (int) Math.round(percentage));
    }
}
