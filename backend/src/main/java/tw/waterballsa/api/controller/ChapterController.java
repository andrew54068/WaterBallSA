package tw.waterballsa.api.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tw.waterballsa.api.dto.response.ChapterDto;
import tw.waterballsa.application.service.ChapterService;

import java.util.List;

@RestController
@RequestMapping("/chapters")
public class ChapterController {

    @Autowired
    private ChapterService chapterService;

    @GetMapping("/{id}")
    public ResponseEntity<ChapterDto> getChapterById(@PathVariable Integer id) {
        ChapterDto chapter = chapterService.getChapterById(id);
        return ResponseEntity.ok(chapter);
    }

    @GetMapping("/curriculum/{curriculumId}")
    public ResponseEntity<List<ChapterDto>> getChaptersByCurriculumId(@PathVariable Integer curriculumId) {
        List<ChapterDto> chapters = chapterService.getChaptersByCurriculumId(curriculumId);
        return ResponseEntity.ok(chapters);
    }

    @GetMapping("/curriculum/{curriculumId}/count")
    public ResponseEntity<Long> getChapterCount(@PathVariable Integer curriculumId) {
        Long count = chapterService.getChapterCount(curriculumId);
        return ResponseEntity.ok(count);
    }
}
