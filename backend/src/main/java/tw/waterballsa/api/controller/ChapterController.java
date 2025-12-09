package tw.waterballsa.api.controller;

import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tw.waterballsa.api.entity.Chapter;
import tw.waterballsa.api.entity.VideoProgress;
import tw.waterballsa.api.repository.ChapterRepository;
import tw.waterballsa.api.repository.VideoProgressRepository; // Needed for Chapter Progress?
import tw.waterballsa.api.security.JwtUtils;

import java.util.List;
import java.util.Map;

@RestController
@AllArgsConstructor
public class ChapterController {
    private final ChapterRepository chapterRepository;
    private final VideoProgressRepository videoProgressRepository;
    private final tw.waterballsa.api.repository.LessonRepository lessonRepository;
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

    @GetMapping("/chapters/{id}")
    public ResponseEntity<Map<String, Object>> getChapter(@PathVariable Long id) {
        return chapterRepository.findById(id)
                .map(chapter -> {
                    Map<String, Object> response = new java.util.HashMap<>();
                    response.put("id", chapter.getId());
                    response.put("curriculumId", chapter.getCurriculumId());
                    response.put("title", chapter.getTitle());
                    response.put("orderIndex", chapter.getOrderIndex());

                    List<tw.waterballsa.api.entity.Lesson> lessons = lessonRepository.findByChapterId(chapter.getId());
                    response.put("lessons", lessons);

                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/chapters/curriculum/{curriculumId}")
    public ResponseEntity<List<Chapter>> getChapters(@PathVariable Long curriculumId) {
        List<Chapter> chapters = chapterRepository.findByCurriculumIdOrderByOrderIndex(curriculumId);
        return ResponseEntity.ok(chapters);
    }

    @GetMapping("/chapters/{chapterId}/progress")
    public ResponseEntity<List<Map<String, Object>>> getChapterProgress(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long chapterId) {
        // Logic already implemented in LessonController??
        // API_取得章節所有課程的進度 maps to /lessons/chapters/{id}/progress in LessonController
        // But maybe feature file uses this path too?
        // Check if I need to duplicate or redirect.
        // If "API_取得章節所有課程的進度" uses /chunks/... I should stick to one.
        // Step 1383 LessonController implements /lessons/chapters/{chapterId}/progress
        // If Test requests /chapters/{id}/progress, I should direct it here.
        // For now, I only add the requested endpoints.
        return ResponseEntity.notFound().build(); // Placeholder if mistakenly called
    }
}
