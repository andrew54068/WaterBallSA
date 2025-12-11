package tw.waterballsa.application.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tw.waterballsa.api.dto.response.ChapterDto;
import tw.waterballsa.api.dto.response.LessonDto;
import tw.waterballsa.api.entity.Chapter;
import tw.waterballsa.api.entity.Lesson;
import tw.waterballsa.api.exception.ResourceNotFoundException;
import tw.waterballsa.api.repository.ChapterRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChapterService {

    @Autowired
    private ChapterRepository chapterRepository;

    @Transactional(readOnly = true)
    public ChapterDto getChapterById(Integer id) {
        Chapter chapter = chapterRepository.findByIdWithLessons(id.longValue())
                .orElseThrow(() -> new ResourceNotFoundException("Chapter", "id", id));
        return convertToDto(chapter, true);
    }

    @Transactional(readOnly = true)
    public List<ChapterDto> getChaptersByCurriculumId(Integer curriculumId) {
        List<Chapter> chapters = chapterRepository.findByCurriculumIdOrderByOrderIndex(curriculumId.longValue());
        return chapters.stream()
                .map(chapter -> convertToDto(chapter, false))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Long getChapterCount(Integer curriculumId) {
        return chapterRepository.countByCurriculumId(curriculumId.longValue());
    }

    private ChapterDto convertToDto(Chapter chapter, boolean includeLessons) {
        ChapterDto dto = ChapterDto.builder()
                .id(chapter.getId().intValue())
                .curriculumId(chapter.getCurriculum().getId().intValue())
                .title(chapter.getTitle())
                .description(chapter.getDescription())
                .orderIndex(chapter.getOrderIndex())
                .createdAt(chapter.getCreatedAt())
                .build();

        if (includeLessons) {
            List<LessonDto> lessons = chapter.getLessons().stream()
                    .map(this::convertLessonToDto)
                    .collect(Collectors.toList());
            dto.setLessons(lessons);
        }

        return dto;
    }

    private LessonDto convertLessonToDto(Lesson lesson) {
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
