package com.waterballsa.backend.repository;

import com.waterballsa.backend.entity.VideoProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface VideoProgressRepository extends JpaRepository<VideoProgress, Long> {

    /**
     * Find progress by user ID and lesson ID
     */
    Optional<VideoProgress> findByUserIdAndLessonId(Long userId, Long lessonId);

    /**
     * Find all progress records for a user in a specific chapter
     */
    @Query("SELECT vp FROM VideoProgress vp WHERE vp.user.id = :userId AND vp.lesson.chapter.id = :chapterId")
    List<VideoProgress> findByUserIdAndLesson_ChapterId(@Param("userId") Long userId, @Param("chapterId") Long chapterId);

    /**
     * Upsert progress using PostgreSQL's INSERT ON CONFLICT
     * This ensures atomic updates and avoids race conditions
     */
    @Modifying
    @Query(nativeQuery = true, value = """
        INSERT INTO video_progress
            (user_id, lesson_id, current_time_seconds, duration_seconds,
             completion_percentage, is_completed, completed_at, created_at, updated_at)
        VALUES
            (:userId, :lessonId, :currentTimeSeconds, :durationSeconds,
             :completionPercentage, :isCompleted, :completedAt, NOW(), NOW())
        ON CONFLICT (user_id, lesson_id)
        DO UPDATE SET
            current_time_seconds = EXCLUDED.current_time_seconds,
            duration_seconds = EXCLUDED.duration_seconds,
            completion_percentage = EXCLUDED.completion_percentage,
            is_completed = EXCLUDED.is_completed,
            completed_at = CASE
                WHEN video_progress.is_completed = true THEN video_progress.completed_at
                ELSE EXCLUDED.completed_at
            END,
            updated_at = NOW()
        WHERE
            video_progress.current_time_seconds < EXCLUDED.current_time_seconds
            OR video_progress.is_completed = false AND EXCLUDED.is_completed = true
        """)
    void upsertProgress(
            @Param("userId") Long userId,
            @Param("lessonId") Long lessonId,
            @Param("currentTimeSeconds") Double currentTimeSeconds,
            @Param("durationSeconds") Double durationSeconds,
            @Param("completionPercentage") Integer completionPercentage,
            @Param("isCompleted") Boolean isCompleted,
            @Param("completedAt") LocalDateTime completedAt
    );
}
