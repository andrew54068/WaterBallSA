package com.waterballsa.backend.service;

import com.waterballsa.backend.dto.SaveProgressRequest;
import com.waterballsa.backend.dto.VideoProgressDto;
import com.waterballsa.backend.entity.Lesson;
import com.waterballsa.backend.entity.User;
import com.waterballsa.backend.entity.VideoProgress;
import com.waterballsa.backend.repository.LessonRepository;
import com.waterballsa.backend.repository.UserRepository;
import com.waterballsa.backend.repository.VideoProgressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VideoProgressService {

    private final VideoProgressRepository videoProgressRepository;
    private final LessonRepository lessonRepository;
    private final UserRepository userRepository;

    /**
     * Save or update video progress
     */
    @Transactional
    public VideoProgressDto saveProgress(Long userId, Long lessonId, SaveProgressRequest request) {
        // Validate lesson exists
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found with id: " + lessonId));

        // Validate user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Validate request data
        validateProgressData(request);

        // Cap current time at duration if exceeded
        Double cappedCurrentTime = Math.min(request.getCurrentTimeSeconds(), request.getDurationSeconds());

        // Calculate completion percentage
        Integer completionPercentage = calculateCompletionPercentage(cappedCurrentTime, request.getDurationSeconds());

        // Determine if should mark complete
        boolean shouldComplete = shouldMarkComplete(cappedCurrentTime, request.getDurationSeconds());
        LocalDateTime completedAt = shouldComplete ? LocalDateTime.now() : null;

        // Use upsert for atomic operation
        videoProgressRepository.upsertProgress(
                userId,
                lessonId,
                cappedCurrentTime,
                request.getDurationSeconds(),
                completionPercentage,
                shouldComplete,
                completedAt
        );

        // Fetch and return the updated progress
        VideoProgress savedProgress = videoProgressRepository.findByUserIdAndLessonId(userId, lessonId)
                .orElseThrow(() -> new RuntimeException("Failed to retrieve saved progress"));

        return VideoProgressDto.from(savedProgress);
    }

    /**
     * Get progress for a specific lesson
     */
    @Transactional(readOnly = true)
    public VideoProgressDto getProgress(Long userId, Long lessonId) {
        return videoProgressRepository.findByUserIdAndLessonId(userId, lessonId)
                .map(VideoProgressDto::from)
                .orElse(null);
    }

    /**
     * Get all progress for lessons in a chapter
     */
    @Transactional(readOnly = true)
    public List<VideoProgressDto> getChapterProgress(Long userId, Long chapterId) {
        return videoProgressRepository.findByUserIdAndLesson_ChapterId(userId, chapterId)
                .stream()
                .map(VideoProgressDto::from)
                .collect(Collectors.toList());
    }

    /**
     * Validate progress data
     */
    private void validateProgressData(SaveProgressRequest request) {
        if (request.getCurrentTimeSeconds() < 0) {
            throw new IllegalArgumentException("Current time cannot be negative");
        }

        if (request.getDurationSeconds() <= 0) {
            throw new IllegalArgumentException("Duration must be positive");
        }

        if (request.getCompletionPercentage() < 0 || request.getCompletionPercentage() > 100) {
            throw new IllegalArgumentException("Completion percentage must be between 0 and 100");
        }
    }

    /**
     * Calculate completion percentage
     */
    private Integer calculateCompletionPercentage(Double currentTime, Double duration) {
        if (duration == null || duration == 0) {
            return 0;
        }
        double percentage = (currentTime / duration) * 100.0;
        return Math.min(100, (int) Math.round(percentage));
    }

    /**
     * Determine if lesson should be marked as complete
     * - Videos >= 30 seconds: 95% threshold
     * - Videos < 30 seconds: 100% threshold
     */
    private boolean shouldMarkComplete(Double currentTime, Double duration) {
        if (duration == null || duration == 0) {
            return false;
        }

        double completionPercentage = (currentTime / duration) * 100.0;
        double threshold = duration < 30 ? 100.0 : 95.0;

        return completionPercentage >= threshold;
    }
}
