package tw.waterballsa.application.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tw.waterballsa.api.dto.response.LessonDto;
import tw.waterballsa.api.entity.Lesson;
import tw.waterballsa.api.exception.ResourceNotFoundException;
import tw.waterballsa.api.repository.LessonRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class LessonService {

    @Autowired
    private LessonRepository lessonRepository;

    @Transactional(readOnly = true)
    public LessonDto getLessonById(Integer id) {
        Lesson lesson = lessonRepository.findById(id.longValue())
                .orElseThrow(() -> new ResourceNotFoundException("Lesson", "id", id));
        return convertToDto(lesson);
    }

    @Transactional(readOnly = true)
    public List<LessonDto> getLessonsByChapterId(Integer chapterId) {
        List<Lesson> lessons = lessonRepository.findByChapterIdOrderByOrderIndex(chapterId.longValue());
        return lessons.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LessonDto> getFreePreviewLessons(Integer curriculumId) {
        List<Lesson> lessons = lessonRepository.findFreePreviewLessonsByCurriculumId(curriculumId.longValue());
        return lessons.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private LessonDto convertToDto(Lesson lesson) {
        return LessonDto.builder()
                .id(lesson.getId().intValue())
                .chapterId(lesson.getChapter().getId().intValue())
                .title(lesson.getTitle())
                .description(lesson.getDescription())
                .lessonType(lesson.getLessonType().name())
                .contentUrl(lesson.getContentUrl())
                .contentMetadata(lesson.getContentMetadata())
                .orderIndex(lesson.getOrderIndex())
                .durationMinutes(lesson.getDurationMinutes())
                .isFreePreview(lesson.getIsFreePreview())
                .isCompleted(false) // Will be set by VideoProgressService if needed
                .createdAt(lesson.getCreatedAt())
                .build();
    }
}
