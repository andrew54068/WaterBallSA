package tw.waterballsa.api.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import tw.waterballsa.api.dto.response.LessonDto;
import tw.waterballsa.application.service.LessonService;

import java.util.List;

@RestController
@RequestMapping("/lessons")
public class LessonController {

    @Autowired
    private LessonService lessonService;

    @GetMapping("/{id}")
    public ResponseEntity<LessonDto> getLessonById(@PathVariable Integer id) {
        LessonDto lesson = lessonService.getLessonById(id);
        return ResponseEntity.ok(lesson);
    }

    @GetMapping("/chapter/{chapterId}")
    public ResponseEntity<List<LessonDto>> getLessonsByChapterId(@PathVariable Integer chapterId) {
        List<LessonDto> lessons = lessonService.getLessonsByChapterId(chapterId);
        return ResponseEntity.ok(lessons);
    }

    @GetMapping("/curriculum/{curriculumId}/free-preview")
    public ResponseEntity<List<LessonDto>> getFreePreviewLessons(@PathVariable Integer curriculumId) {
        List<LessonDto> lessons = lessonService.getFreePreviewLessons(curriculumId);
        return ResponseEntity.ok(lessons);
    }
}
