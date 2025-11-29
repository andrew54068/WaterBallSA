package com.waterballsa.backend.service;

import com.waterballsa.backend.dto.SaveProgressRequest;
import com.waterballsa.backend.dto.VideoProgressDto;
import com.waterballsa.backend.entity.Lesson;
import com.waterballsa.backend.entity.User;
import com.waterballsa.backend.entity.VideoProgress;
import com.waterballsa.backend.repository.LessonRepository;
import com.waterballsa.backend.repository.UserRepository;
import com.waterballsa.backend.repository.VideoProgressRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for VideoProgressService
 * Tests business logic for progress tracking and completion detection
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class VideoProgressServiceTest {

    @Mock
    private VideoProgressRepository videoProgressRepository;

    @Mock
    private LessonRepository lessonRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private VideoProgressService videoProgressService;

    private Long userId;
    private Long lessonId;
    private User mockUser;
    private Lesson mockLesson;

    @BeforeEach
    void setUp() {
        userId = 1L;
        lessonId = 100L;

        mockUser = new User();
        mockUser.setId(userId);

        mockLesson = new Lesson();
        mockLesson.setId(lessonId);

        // Mock repository responses
        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));
        when(lessonRepository.findById(lessonId)).thenReturn(Optional.of(mockLesson));
    }

    @Test
    @DisplayName("Should save progress for short video (<30s) with 100% completion threshold")
    void shouldSaveProgressForShortVideo() {
        // Given - Short video (25 seconds) at 100% completion
        SaveProgressRequest request = SaveProgressRequest.builder()
                .currentTimeSeconds(25.0)
                .durationSeconds(25.0)
                .completionPercentage(100)
                .isCompleted(true)
                .build();

        VideoProgress mockProgress = createMockVideoProgress(mockUser, mockLesson, 25.0, 25.0, 100, true);
        when(videoProgressRepository.findByUserIdAndLessonId(userId, lessonId))
                .thenReturn(Optional.of(mockProgress));

        // When
        VideoProgressDto result = videoProgressService.saveProgress(userId, lessonId, request);

        // Then
        ArgumentCaptor<Boolean> completedCaptor = ArgumentCaptor.forClass(Boolean.class);
        ArgumentCaptor<LocalDateTime> completedAtCaptor = ArgumentCaptor.forClass(LocalDateTime.class);

        verify(videoProgressRepository).upsertProgress(
                eq(userId), eq(lessonId), eq(25.0), eq(25.0),
                eq(100), completedCaptor.capture(), completedAtCaptor.capture()
        );

        assertThat(completedCaptor.getValue()).isTrue();
        assertThat(completedAtCaptor.getValue()).isNotNull();
        assertThat(result).isNotNull();
    }

    @Test
    @DisplayName("Should NOT mark short video complete at 99%")
    void shouldNotMarkShortVideoCompleteAt99Percent() {
        // Given - Short video (25 seconds) at 99% completion
        SaveProgressRequest request = SaveProgressRequest.builder()
                .currentTimeSeconds(24.75)
                .durationSeconds(25.0)
                .completionPercentage(99)
                .isCompleted(false)
                .build();

        VideoProgress mockProgress = createMockVideoProgress(mockUser, mockLesson, 24.75, 25.0, 99, false);
        when(videoProgressRepository.findByUserIdAndLessonId(userId, lessonId))
                .thenReturn(Optional.of(mockProgress));

        // When
        videoProgressService.saveProgress(userId, lessonId, request);

        // Then
        ArgumentCaptor<Boolean> completedCaptor = ArgumentCaptor.forClass(Boolean.class);
        ArgumentCaptor<Integer> percentageCaptor = ArgumentCaptor.forClass(Integer.class);

        verify(videoProgressRepository).upsertProgress(
                eq(userId), eq(lessonId), eq(24.75), eq(25.0),
                percentageCaptor.capture(), completedCaptor.capture(), isNull()
        );

        assertThat(percentageCaptor.getValue()).isEqualTo(99);
        assertThat(completedCaptor.getValue()).isFalse();
    }

    @Test
    @DisplayName("Should save progress for long video (≥30s) with 95% completion threshold")
    void shouldSaveProgressForLongVideo() {
        // Given - Long video (120 seconds) at 95% completion
        SaveProgressRequest request = SaveProgressRequest.builder()
                .currentTimeSeconds(114.0)
                .durationSeconds(120.0)
                .completionPercentage(95)
                .isCompleted(true)
                .build();

        VideoProgress mockProgress = createMockVideoProgress(mockUser, mockLesson, 114.0, 120.0, 95, true);
        when(videoProgressRepository.findByUserIdAndLessonId(userId, lessonId))
                .thenReturn(Optional.of(mockProgress));

        // When
        videoProgressService.saveProgress(userId, lessonId, request);

        // Then
        ArgumentCaptor<Integer> percentageCaptor = ArgumentCaptor.forClass(Integer.class);
        ArgumentCaptor<Boolean> completedCaptor = ArgumentCaptor.forClass(Boolean.class);
        ArgumentCaptor<LocalDateTime> completedAtCaptor = ArgumentCaptor.forClass(LocalDateTime.class);

        verify(videoProgressRepository).upsertProgress(
                eq(userId), eq(lessonId), eq(114.0), eq(120.0),
                percentageCaptor.capture(), completedCaptor.capture(), completedAtCaptor.capture()
        );

        assertThat(percentageCaptor.getValue()).isEqualTo(95);
        assertThat(completedCaptor.getValue()).isTrue();
        assertThat(completedAtCaptor.getValue()).isNotNull();
    }

    @Test
    @DisplayName("Should NOT mark long video complete at 94%")
    void shouldNotMarkLongVideoCompleteAt94Percent() {
        // Given - Long video at 94%
        SaveProgressRequest request = SaveProgressRequest.builder()
                .currentTimeSeconds(112.8)
                .durationSeconds(120.0)
                .completionPercentage(94)
                .isCompleted(false)
                .build();

        VideoProgress mockProgress = createMockVideoProgress(mockUser, mockLesson, 112.8, 120.0, 94, false);
        when(videoProgressRepository.findByUserIdAndLessonId(userId, lessonId))
                .thenReturn(Optional.of(mockProgress));

        // When
        videoProgressService.saveProgress(userId, lessonId, request);

        // Then
        ArgumentCaptor<Boolean> completedCaptor = ArgumentCaptor.forClass(Boolean.class);
        ArgumentCaptor<Integer> percentageCaptor = ArgumentCaptor.forClass(Integer.class);

        verify(videoProgressRepository).upsertProgress(
                eq(userId), eq(lessonId), eq(112.8), eq(120.0),
                percentageCaptor.capture(), completedCaptor.capture(), isNull()
        );

        assertThat(percentageCaptor.getValue()).isEqualTo(94);
        assertThat(completedCaptor.getValue()).isFalse();
    }

    @Test
    @DisplayName("Should calculate completion percentage correctly")
    void shouldCalculateCompletionPercentageCorrectly() {
        // Given
        SaveProgressRequest request = SaveProgressRequest.builder()
                .currentTimeSeconds(75.0)
                .durationSeconds(150.0)
                .completionPercentage(50)
                .isCompleted(false)
                .build();

        VideoProgress mockProgress = createMockVideoProgress(mockUser, mockLesson, 75.0, 150.0, 50, false);
        when(videoProgressRepository.findByUserIdAndLessonId(userId, lessonId))
                .thenReturn(Optional.of(mockProgress));

        // When
        videoProgressService.saveProgress(userId, lessonId, request);

        // Then
        ArgumentCaptor<Integer> percentageCaptor = ArgumentCaptor.forClass(Integer.class);

        verify(videoProgressRepository).upsertProgress(
                anyLong(), anyLong(), anyDouble(), anyDouble(),
                percentageCaptor.capture(), anyBoolean(), any()
        );

        assertThat(percentageCaptor.getValue()).isEqualTo(50);
    }

    @Test
    @DisplayName("Should handle zero progress")
    void shouldHandleZeroProgress() {
        // Given
        SaveProgressRequest request = SaveProgressRequest.builder()
                .currentTimeSeconds(0.0)
                .durationSeconds(120.0)
                .completionPercentage(0)
                .isCompleted(false)
                .build();

        VideoProgress mockProgress = createMockVideoProgress(mockUser, mockLesson, 0.0, 120.0, 0, false);
        when(videoProgressRepository.findByUserIdAndLessonId(userId, lessonId))
                .thenReturn(Optional.of(mockProgress));

        // When
        videoProgressService.saveProgress(userId, lessonId, request);

        // Then
        ArgumentCaptor<Integer> percentageCaptor = ArgumentCaptor.forClass(Integer.class);
        ArgumentCaptor<Boolean> completedCaptor = ArgumentCaptor.forClass(Boolean.class);

        verify(videoProgressRepository).upsertProgress(
                eq(userId), eq(lessonId), eq(0.0), eq(120.0),
                percentageCaptor.capture(), completedCaptor.capture(), isNull()
        );

        assertThat(percentageCaptor.getValue()).isEqualTo(0);
        assertThat(completedCaptor.getValue()).isFalse();
    }

    @Test
    @DisplayName("Should get progress and return DTO when exists")
    void shouldGetProgressAndReturnDto() {
        // Given
        VideoProgress progress = createMockVideoProgress(mockUser, mockLesson, 60.0, 120.0, 50, false);
        progress.setId(1L);
        progress.setCreatedAt(LocalDateTime.now());
        progress.setUpdatedAt(LocalDateTime.now());

        when(videoProgressRepository.findByUserIdAndLessonId(userId, lessonId))
                .thenReturn(Optional.of(progress));

        // When
        VideoProgressDto result = videoProgressService.getProgress(userId, lessonId);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getUserId()).isEqualTo(userId);
        assertThat(result.getLessonId()).isEqualTo(lessonId);
        assertThat(result.getCurrentTimeSeconds()).isEqualTo(60.0);
        assertThat(result.getDurationSeconds()).isEqualTo(120.0);
        assertThat(result.getCompletionPercentage()).isEqualTo(50);
        assertThat(result.getIsCompleted()).isFalse();
        assertThat(result.getCompletedAt()).isNull();
    }

    @Test
    @DisplayName("Should return null when progress not found")
    void shouldReturnNullWhenProgressNotFound() {
        // Given
        when(videoProgressRepository.findByUserIdAndLessonId(userId, lessonId))
                .thenReturn(Optional.empty());

        // When
        VideoProgressDto result = videoProgressService.getProgress(userId, lessonId);

        // Then
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should mark video complete at exactly 95% for long video")
    void shouldMarkCompleteAtExactly95PercentForLongVideo() {
        // Given - Exactly 95% of a 120-second video
        SaveProgressRequest request = SaveProgressRequest.builder()
                .currentTimeSeconds(114.0)
                .durationSeconds(120.0)
                .completionPercentage(95)
                .isCompleted(true)
                .build();

        VideoProgress mockProgress = createMockVideoProgress(mockUser, mockLesson, 114.0, 120.0, 95, true);
        when(videoProgressRepository.findByUserIdAndLessonId(userId, lessonId))
                .thenReturn(Optional.of(mockProgress));

        // When
        videoProgressService.saveProgress(userId, lessonId, request);

        // Then
        ArgumentCaptor<Boolean> completedCaptor = ArgumentCaptor.forClass(Boolean.class);
        verify(videoProgressRepository).upsertProgress(
                anyLong(), anyLong(), anyDouble(), anyDouble(),
                anyInt(), completedCaptor.capture(), any()
        );

        assertThat(completedCaptor.getValue()).isTrue();
    }

    @Test
    @DisplayName("Should mark video complete at exactly 100% for short video")
    void shouldMarkCompleteAtExactly100PercentForShortVideo() {
        // Given - Exactly 100% of a 20-second video
        SaveProgressRequest request = SaveProgressRequest.builder()
                .currentTimeSeconds(20.0)
                .durationSeconds(20.0)
                .completionPercentage(100)
                .isCompleted(true)
                .build();

        VideoProgress mockProgress = createMockVideoProgress(mockUser, mockLesson, 20.0, 20.0, 100, true);
        when(videoProgressRepository.findByUserIdAndLessonId(userId, lessonId))
                .thenReturn(Optional.of(mockProgress));

        // When
        videoProgressService.saveProgress(userId, lessonId, request);

        // Then
        ArgumentCaptor<Boolean> completedCaptor = ArgumentCaptor.forClass(Boolean.class);
        verify(videoProgressRepository).upsertProgress(
                anyLong(), anyLong(), anyDouble(), anyDouble(),
                anyInt(), completedCaptor.capture(), any()
        );

        assertThat(completedCaptor.getValue()).isTrue();
    }

    @Test
    @DisplayName("Should handle video at exactly 30 seconds with 95% threshold")
    void shouldHandleVideoAtExactly30Seconds() {
        // Given - Video at exactly 30 seconds boundary, 95% complete
        SaveProgressRequest request = SaveProgressRequest.builder()
                .currentTimeSeconds(28.5)
                .durationSeconds(30.0)
                .completionPercentage(95)
                .isCompleted(true)
                .build();

        VideoProgress mockProgress = createMockVideoProgress(mockUser, mockLesson, 28.5, 30.0, 95, true);
        when(videoProgressRepository.findByUserIdAndLessonId(userId, lessonId))
                .thenReturn(Optional.of(mockProgress));

        // When
        videoProgressService.saveProgress(userId, lessonId, request);

        // Then
        ArgumentCaptor<Boolean> completedCaptor = ArgumentCaptor.forClass(Boolean.class);
        ArgumentCaptor<Integer> percentageCaptor = ArgumentCaptor.forClass(Integer.class);

        verify(videoProgressRepository).upsertProgress(
                anyLong(), anyLong(), anyDouble(), anyDouble(),
                percentageCaptor.capture(), completedCaptor.capture(), any()
        );

        assertThat(percentageCaptor.getValue()).isEqualTo(95);
        assertThat(completedCaptor.getValue()).isTrue();
    }

    @Test
    @DisplayName("Should convert completed progress to DTO with completedAt timestamp")
    void shouldConvertCompletedProgressToDto() {
        // Given
        LocalDateTime completedAt = LocalDateTime.now().minusHours(1);
        VideoProgress progress = createMockVideoProgress(mockUser, mockLesson, 120.0, 120.0, 100, true);
        progress.setId(1L);
        progress.setCompletedAt(completedAt);
        progress.setCreatedAt(LocalDateTime.now().minusHours(2));
        progress.setUpdatedAt(LocalDateTime.now().minusHours(1));

        when(videoProgressRepository.findByUserIdAndLessonId(userId, lessonId))
                .thenReturn(Optional.of(progress));

        // When
        VideoProgressDto result = videoProgressService.getProgress(userId, lessonId);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getIsCompleted()).isTrue();
        assertThat(result.getCompletedAt()).isNotNull();
    }

    /**
     * Helper method to create mock VideoProgress entity
     */
    private VideoProgress createMockVideoProgress(User user, Lesson lesson,
                                                   Double currentTime, Double duration,
                                                   Integer percentage, Boolean completed) {
        VideoProgress progress = new VideoProgress();
        progress.setUser(user);
        progress.setLesson(lesson);
        progress.setCurrentTimeSeconds(currentTime);
        progress.setDurationSeconds(duration);
        progress.setCompletionPercentage(percentage);
        progress.setIsCompleted(completed);
        progress.setCreatedAt(LocalDateTime.now());
        progress.setUpdatedAt(LocalDateTime.now());
        if (completed) {
            progress.setCompletedAt(LocalDateTime.now());
        }
        return progress;
    }
}
