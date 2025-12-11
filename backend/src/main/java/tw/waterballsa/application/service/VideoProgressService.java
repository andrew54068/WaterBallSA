package tw.waterballsa.application.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tw.waterballsa.api.dto.request.SaveProgressRequest;
import tw.waterballsa.api.dto.response.VideoProgressDto;
import tw.waterballsa.api.entity.Lesson;
import tw.waterballsa.api.entity.User;
import tw.waterballsa.api.entity.VideoProgress;
import tw.waterballsa.api.exception.ResourceNotFoundException;
import tw.waterballsa.api.repository.LessonRepository;
import tw.waterballsa.api.repository.UserRepository;
import tw.waterballsa.api.repository.VideoProgressRepository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class VideoProgressService {

    @Autowired
    private VideoProgressRepository videoProgressRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LessonRepository lessonRepository;

    @Transactional
    public VideoProgressDto saveOrUpdateProgress(Integer userId, Integer lessonId, SaveProgressRequest request) {
        User user = userRepository.findById(userId.longValue())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Lesson lesson = lessonRepository.findById(lessonId.longValue())
                .orElseThrow(() -> new ResourceNotFoundException("Lesson", "id", lessonId));

        // Find existing progress or create new one
        VideoProgress progress = videoProgressRepository
                .findByUserIdAndLessonId(userId.longValue(), lessonId.longValue())
                .orElseGet(() -> VideoProgress.builder()
                        .user(user)
                        .lesson(lesson)
                        .build());

        // Update progress data
        progress.setCurrentTimeSeconds(request.getCurrentTimeSeconds());
        progress.setDurationSeconds(request.getDurationSeconds());
        progress.setCompletionPercentage(request.getCompletionPercentage());

        // Auto-mark as completed if completion is >= 90%
        boolean wasCompleted = progress.getIsCompleted();
        if (request.getCompletionPercentage().compareTo(new BigDecimal("90")) >= 0) {
            progress.setIsCompleted(true);
            if (!wasCompleted) {
                progress.setCompletedAt(LocalDateTime.now());
            }
        } else {
            progress.setIsCompleted(request.getIsCompleted() != null ? request.getIsCompleted() : false);
        }

        progress = videoProgressRepository.save(progress);

        return convertToDto(progress);
    }

    @Transactional(readOnly = true)
    public VideoProgressDto getProgress(Integer userId, Integer lessonId) {
        VideoProgress progress = videoProgressRepository
                .findByUserIdAndLessonId(userId.longValue(), lessonId.longValue())
                .orElseThrow(() -> new ResourceNotFoundException("VideoProgress not found for user " + userId + " and lesson " + lessonId));

        return convertToDto(progress);
    }

    @Transactional(readOnly = true)
    public List<VideoProgressDto> getChapterProgress(Integer userId, Integer chapterId) {
        List<VideoProgress> progressList = videoProgressRepository
                .findByUserIdAndChapterId(userId.longValue(), chapterId.longValue());

        return progressList.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private VideoProgressDto convertToDto(VideoProgress progress) {
        VideoProgressDto.VideoProgressDtoBuilder builder = VideoProgressDto.builder()
                .id(progress.getId().intValue())
                .userId(progress.getUserId().intValue())
                .lessonId(progress.getLessonId().intValue())
                .currentTimeSeconds(progress.getCurrentTimeSeconds())
                .durationSeconds(progress.getDurationSeconds())
                .completionPercentage(progress.getCompletionPercentage())
                .isCompleted(progress.getIsCompleted())
                .createdAt(progress.getCreatedAt())
                .updatedAt(progress.getUpdatedAt());

        if (progress.getCompletedAt() != null) {
            builder.completedAt(progress.getCompletedAt());
        }

        return builder.build();
    }
}
