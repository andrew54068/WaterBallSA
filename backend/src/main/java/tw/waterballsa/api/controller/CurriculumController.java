package tw.waterballsa.api.controller;

import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tw.waterballsa.api.entity.Chapter;
import tw.waterballsa.api.entity.Curriculum;
import tw.waterballsa.api.entity.Lesson;
import tw.waterballsa.api.repository.ChapterRepository;
import tw.waterballsa.api.repository.CurriculumRepository;
import tw.waterballsa.api.repository.LessonRepository;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@AllArgsConstructor
public class CurriculumController {
    private final CurriculumRepository curriculumRepository;
    private final ChapterRepository chapterRepository;
    private final LessonRepository lessonRepository;

    @GetMapping("/curriculums/{id}")
    public ResponseEntity<Curriculum> getCurriculum(@PathVariable Long id) {
        return curriculumRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/curriculums")
    public ResponseEntity<Page<Curriculum>> getCurriculums(
            @RequestParam(required = false) String level,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            jakarta.servlet.http.HttpServletRequest request) {

        if (request.getRequestURI().contains("/free")) {
            return getFreeCurriculums(page, size);
        }

        List<Curriculum> list = curriculumRepository.findAll();
        List<Curriculum> filtered = list.stream()
                .filter(c -> level == null || c.getDifficultyLevel().name().equalsIgnoreCase(level))
                .filter(c -> minPrice == null || (c.getPrice() != null && c.getPrice() >= minPrice))
                .filter(c -> maxPrice == null || (c.getPrice() != null && c.getPrice() <= maxPrice))
                .collect(Collectors.toList());
        return ResponseEntity.ok(paginate(filtered, page, size));
    }

    @GetMapping("/curriculums/free")
    public ResponseEntity<Page<Curriculum>> getFreeCurriculums(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        List<Curriculum> all = curriculumRepository.findAll();
        List<Curriculum> free = all.stream()
                .filter(c -> c.getPrice() != null && c.getPrice() <= 0.0)
                .collect(Collectors.toList());
        return ResponseEntity.ok(paginate(free, page, size));
    }



    private <T> Page<T> paginate(List<T> list, int page, int size) {
        int start = page * size;
        int end = Math.min(start + size, list.size());
        List<T> content = (start > list.size()) ? Collections.emptyList() : list.subList(start, end);
        return new org.springframework.data.domain.PageImpl<>(content,
                org.springframework.data.domain.PageRequest.of(page, size), list.size());
    }

    @GetMapping("/curriculums/{id}/chapters")
    public ResponseEntity<List<Chapter>> getChapters(@PathVariable Long id) {
        return ResponseEntity.ok(chapterRepository.findByCurriculumIdOrderByOrderIndex(id));
    }

    @GetMapping("/curriculums/{id}/free-lessons")
    public ResponseEntity<List<Lesson>> getFreeLessons(@PathVariable Long id) {
        // Placeholder implementation
        return ResponseEntity.ok(Collections.emptyList());
    }
}
