package tw.waterballsa.api.controller;

import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tw.waterballsa.api.entity.Lesson;
import tw.waterballsa.api.entity.VideoProgress;
import tw.waterballsa.api.entity.Chapter;
import tw.waterballsa.api.repository.LessonRepository;
import tw.waterballsa.api.repository.VideoProgressRepository;
import tw.waterballsa.api.repository.ChapterRepository;
import tw.waterballsa.api.security.JwtUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@AllArgsConstructor
public class LessonController {
    private final LessonRepository lessonRepository;
    private final VideoProgressRepository videoProgressRepository;
    private final ChapterRepository chapterRepository;
    private final JwtUtils jwtUtils;

    private Long getUserId(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        String token = authHeader.substring(7);
        String userIdStr = jwtUtils.validateToken(token);
        if (userIdStr == null)
            return null;
        return Long.parseLong(userIdStr);
    }

    @GetMapping("/lessons/{id}")
    public ResponseEntity<Lesson> getLesson(@PathVariable Long id) {
        return lessonRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/lessons/{lessonId}/progress")
    public ResponseEntity<Map<String, Object>> saveProgress(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long lessonId,
            @RequestBody VideoProgress request) {
        Long userId = getUserId(authHeader);
        if (userId == null)
            return ResponseEntity.status(401).build();

        Lesson lesson = lessonRepository.findById(lessonId).orElse(null);
        if (lesson == null)
            return ResponseEntity.notFound().build();

        VideoProgress existing = videoProgressRepository.findAll().stream()
                .filter(vp -> vp.getUserId().equals(userId) && vp.getLessonId().equals(lessonId))
                .findFirst()
                .orElse(null);

        // Initialize defaults if creating new
        if (existing == null) {
            existing = new VideoProgress();
            existing.setUserId(userId);
            existing.setLessonId(lessonId);
            existing.setCurrentTimeSeconds(java.math.BigDecimal.ZERO);
            existing.setCompletionPercentage(java.math.BigDecimal.ZERO);
            existing.setIsCompleted(false);
        }

        // Update current time
        if (request.getCurrentTimeSeconds() != null) {
            existing.setCurrentTimeSeconds(request.getCurrentTimeSeconds());
        }

        // Calculate Duration and Set it (MANDATORY per Schema)
        java.math.BigDecimal durationSeconds = java.math.BigDecimal.ZERO;
        if (lesson.getDurationMinutes() != null) {
            durationSeconds = java.math.BigDecimal.valueOf(lesson.getDurationMinutes() * 60);
        }
        existing.setDurationSeconds(durationSeconds);

        // Calculate percentage and completion
        if (durationSeconds.compareTo(java.math.BigDecimal.ZERO) > 0) {
            java.math.BigDecimal current = existing.getCurrentTimeSeconds() != null
                    ? existing.getCurrentTimeSeconds()
                    : java.math.BigDecimal.ZERO;

            // Percentage
            java.math.BigDecimal percentage = current
                    .divide(durationSeconds, 2, java.math.RoundingMode.HALF_UP)
                    .multiply(java.math.BigDecimal.valueOf(100));

            // Cap at 100? No, standard math.
            existing.setCompletionPercentage(percentage);

            if (percentage.doubleValue() >= 90.0) { // Threshold 90%
                existing.setIsCompleted(true);
            } else {
                existing.setIsCompleted(false);
            }
        } else {
            // Duration is 0, progress implies completed? Or just 0%?
            // Keep existing completion percentage (0) or set to 100 if completed?
            // safer to leave simple.
        }

        videoProgressRepository.save(existing);
        return ResponseEntity.ok(convertToMap(existing));
    }

    @GetMapping("/lessons/{lessonId}/progress")
    public ResponseEntity<Map<String, Object>> getProgress(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long lessonId) {
        Long userId = getUserId(authHeader);
        if (userId == null)
            return ResponseEntity.status(401).build();

        VideoProgress vp = videoProgressRepository.findAll().stream()
                .filter(p -> p.getUserId().equals(userId) && p.getLessonId().equals(lessonId))
                .findFirst()
                .orElse(null);

        if (vp == null)
            return ResponseEntity.notFound().build();
        return ResponseEntity.ok(convertToMap(vp));
    }

    @GetMapping("/lessons/chapters/{chapterId}/progress")
    public ResponseEntity<List<Map<String, Object>>> getChapterProgress(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long chapterId) {
        Long userId = getUserId(authHeader);
        if (userId == null)
            return ResponseEntity.status(401).build();

        // 1. Find all lessons in chapter (need filtered LessonRepository)
        // 2. Find progress for each lesson

        // Simpler: find all progress for user, and filter by lessons in chapter?
        // OR find all lessons in chapter, then join progress.

        // Need LessonRepository.findByChapterId
        // I'll assume findAll + filter

        List<Long> lessonIds = lessonRepository.findAll().stream()
                .filter(l -> l.getChapterId().equals(chapterId))
                .map(Lesson::getId)
                .collect(Collectors.toList());

        List<VideoProgress> progressList = videoProgressRepository.findAll().stream()
                .filter(p -> p.getUserId().equals(userId) && lessonIds.contains(p.getLessonId()))
                .collect(Collectors.toList());

        List<Map<String, Object>> result = progressList.stream()
                .map(this::convertToMap)
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    @GetMapping("/lessons/curriculum/{curriculumId}/free-preview")
    public ResponseEntity<List<Lesson>> getFreePreviewLessons(@PathVariable Long curriculumId) {
        List<Chapter> chapters = chapterRepository.findByCurriculumIdOrderByOrderIndex(curriculumId);
        List<Lesson> freeLessons = new ArrayList<>();
        for (Chapter ch : chapters) {
            List<Lesson> lessons = lessonRepository.findByChapterId(ch.getId());
            for (Lesson l : lessons) {
                if (Boolean.TRUE.equals(l.getIsFreePreview())) {
                    freeLessons.add(l);
                }
            }
        }
        return ResponseEntity.ok(freeLessons);
    }

    private Map<String, Object> convertToMap(VideoProgress vp) {
        Map<String, Object> map = new java.util.HashMap<>();
        map.put("userId", vp.getUserId());
        map.put("lessonId", vp.getLessonId());
        // API uses currentTimeSeconds and completionPercentage
        map.put("currentTimeSeconds", vp.getCurrentTimeSeconds());

        map.put("isCompleted", vp.getIsCompleted());
        if (vp.getCompletionPercentage() != null) {
            map.put("completionPercentage", vp.getCompletionPercentage());
        } else {
            map.put("completionPercentage", 0.0);
        }
        return map;
    }
}
