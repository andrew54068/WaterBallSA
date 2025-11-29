package com.waterballsa.backend.repository;

import com.waterballsa.backend.entity.VideoProgress;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit tests for VideoProgressRepository
 * Tests the custom upsert query and finder methods
 */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
class VideoProgressRepositoryTest {

    @Autowired
    private VideoProgressRepository videoProgressRepository;

    @Autowired
    private TestEntityManager entityManager;

    private Long userId;
    private Long lessonId;

    @BeforeEach
    void setUp() {
        userId = 1L;
        lessonId = 100L;
        videoProgressRepository.deleteAll();
        entityManager.flush();
        entityManager.clear();
    }

    @Test
    @DisplayName("Should create new progress record when none exists")
    void shouldCreateNewProgressWhenNoneExists() {
        // Given
        Double currentTime = 30.0;
        Double duration = 120.0;
        Integer completionPercentage = 25;
        Boolean isCompleted = false;

        // When
        videoProgressRepository.upsertProgress(
                userId, lessonId, currentTime, duration,
                completionPercentage, isCompleted, null
        );
        entityManager.flush();
        entityManager.clear();

        // Then
        Optional<VideoProgress> result = videoProgressRepository.findByUserIdAndLessonId(userId, lessonId);
        assertThat(result).isPresent();

        VideoProgress progress = result.get();
        assertThat(progress.getCurrentTimeSeconds()).isEqualTo(currentTime);
        assertThat(progress.getDurationSeconds()).isEqualTo(duration);
        assertThat(progress.getCompletionPercentage()).isEqualTo(completionPercentage);
        assertThat(progress.getIsCompleted()).isFalse();
        assertThat(progress.getCompletedAt()).isNull();
    }

    @Test
    @DisplayName("Should update existing progress when current time increases")
    void shouldUpdateProgressWhenCurrentTimeIncreases() {
        // Given - Create initial progress
        videoProgressRepository.upsertProgress(
                userId, lessonId, 30.0, 120.0, 25, false, null
        );
        entityManager.flush();
        entityManager.clear();

        // When - Update with greater current time
        videoProgressRepository.upsertProgress(
                userId, lessonId, 60.0, 120.0, 50, false, null
        );
        entityManager.flush();
        entityManager.clear();

        // Then
        Optional<VideoProgress> result = videoProgressRepository.findByUserIdAndLessonId(userId, lessonId);
        assertThat(result).isPresent();
        assertThat(result.get().getCurrentTimeSeconds()).isEqualTo(60.0);
        assertThat(result.get().getCompletionPercentage()).isEqualTo(50);
    }

    @Test
    @DisplayName("Should NOT update when current time is less than existing")
    void shouldNotUpdateWhenCurrentTimeIsLess() {
        // Given - Create initial progress at 60 seconds
        videoProgressRepository.upsertProgress(
                userId, lessonId, 60.0, 120.0, 50, false, null
        );
        entityManager.flush();
        entityManager.clear();

        // When - Try to update with lesser current time (user seeked backward)
        videoProgressRepository.upsertProgress(
                userId, lessonId, 30.0, 120.0, 25, false, null
        );
        entityManager.flush();
        entityManager.clear();

        // Then - Should keep the higher time
        Optional<VideoProgress> result = videoProgressRepository.findByUserIdAndLessonId(userId, lessonId);
        assertThat(result).isPresent();
        assertThat(result.get().getCurrentTimeSeconds()).isEqualTo(60.0);
        assertThat(result.get().getCompletionPercentage()).isEqualTo(50);
    }

    @Test
    @DisplayName("Should mark as completed and preserve completion timestamp")
    void shouldMarkAsCompletedAndPreserveTimestamp() {
        // Given - Create initial uncompleted progress
        videoProgressRepository.upsertProgress(
                userId, lessonId, 100.0, 120.0, 83, false, null
        );
        entityManager.flush();
        entityManager.clear();

        // When - Mark as completed
        LocalDateTime completedAt = LocalDateTime.now();
        videoProgressRepository.upsertProgress(
                userId, lessonId, 120.0, 120.0, 100, true, completedAt
        );
        entityManager.flush();
        entityManager.clear();

        // Then
        Optional<VideoProgress> result = videoProgressRepository.findByUserIdAndLessonId(userId, lessonId);
        assertThat(result).isPresent();

        VideoProgress progress = result.get();
        assertThat(progress.getIsCompleted()).isTrue();
        assertThat(progress.getCompletionPercentage()).isEqualTo(100);
        assertThat(progress.getCompletedAt()).isNotNull();

        LocalDateTime firstCompletedAt = progress.getCompletedAt();

        // When - Try to update after already completed
        videoProgressRepository.upsertProgress(
                userId, lessonId, 115.0, 120.0, 95, true, LocalDateTime.now().plusSeconds(10)
        );
        entityManager.flush();
        entityManager.clear();

        // Then - Should preserve original completion timestamp
        result = videoProgressRepository.findByUserIdAndLessonId(userId, lessonId);
        assertThat(result).isPresent();
        assertThat(result.get().getCompletedAt()).isEqualTo(firstCompletedAt);
    }


    @Test
    @DisplayName("Should find progress by user and lesson")
    void shouldFindByUserIdAndLessonId() {
        // Given
        videoProgressRepository.upsertProgress(userId, lessonId, 30.0, 120.0, 25, false, null);
        videoProgressRepository.upsertProgress(userId, 101L, 60.0, 180.0, 33, false, null);
        entityManager.flush();
        entityManager.clear();

        // When
        Optional<VideoProgress> result = videoProgressRepository.findByUserIdAndLessonId(userId, lessonId);

        // Then - If found, it's the correct user/lesson by definition
        assertThat(result).isPresent();
        assertThat(result.get().getCurrentTimeSeconds()).isEqualTo(30.0);
        assertThat(result.get().getCompletionPercentage()).isEqualTo(25);
    }

    @Test
    @DisplayName("Should return empty when progress not found")
    void shouldReturnEmptyWhenProgressNotFound() {
        // When
        Optional<VideoProgress> result = videoProgressRepository.findByUserIdAndLessonId(999L, 999L);

        // Then
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should handle concurrent updates with atomic upsert")
    void shouldHandleConcurrentUpdatesAtomically() {
        // Given - Initial state
        videoProgressRepository.upsertProgress(userId, lessonId, 30.0, 120.0, 25, false, null);
        entityManager.flush();

        // When - Multiple rapid updates (simulating concurrent saves)
        videoProgressRepository.upsertProgress(userId, lessonId, 35.0, 120.0, 29, false, null);
        videoProgressRepository.upsertProgress(userId, lessonId, 40.0, 120.0, 33, false, null);
        videoProgressRepository.upsertProgress(userId, lessonId, 45.0, 120.0, 37, false, null);

        entityManager.flush();
        entityManager.clear();

        // Then - Should have the latest valid update
        Optional<VideoProgress> result = videoProgressRepository.findByUserIdAndLessonId(userId, lessonId);
        assertThat(result).isPresent();
        assertThat(result.get().getCurrentTimeSeconds()).isEqualTo(45.0);
    }

    @Test
    @DisplayName("Should handle zero progress correctly")
    void shouldHandleZeroProgress() {
        // Given
        videoProgressRepository.upsertProgress(userId, lessonId, 0.0, 120.0, 0, false, null);
        entityManager.flush();
        entityManager.clear();

        // When
        Optional<VideoProgress> result = videoProgressRepository.findByUserIdAndLessonId(userId, lessonId);

        // Then
        assertThat(result).isPresent();
        assertThat(result.get().getCurrentTimeSeconds()).isEqualTo(0.0);
        assertThat(result.get().getCompletionPercentage()).isEqualTo(0);
        assertThat(result.get().getIsCompleted()).isFalse();
    }

    @Test
    @DisplayName("Should update from incomplete to complete")
    void shouldTransitionFromIncompleteToComplete() {
        // Given - Start with incomplete
        videoProgressRepository.upsertProgress(userId, lessonId, 100.0, 120.0, 83, false, null);
        entityManager.flush();
        entityManager.clear();

        // When - Complete the video
        LocalDateTime completedAt = LocalDateTime.now();
        videoProgressRepository.upsertProgress(userId, lessonId, 120.0, 120.0, 100, true, completedAt);
        entityManager.flush();
        entityManager.clear();

        // Then
        Optional<VideoProgress> result = videoProgressRepository.findByUserIdAndLessonId(userId, lessonId);
        assertThat(result).isPresent();

        VideoProgress progress = result.get();
        assertThat(progress.getIsCompleted()).isTrue();
        assertThat(progress.getCompletionPercentage()).isEqualTo(100);
        assertThat(progress.getCompletedAt()).isNotNull();
        assertThat(progress.getUpdatedAt()).isNotNull();
    }
}
