package tw.waterballsa.application.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tw.waterballsa.api.dto.response.ChapterDto;
import tw.waterballsa.api.dto.response.CurriculumDto;
import tw.waterballsa.api.dto.response.LessonDto;
import tw.waterballsa.api.dto.response.PaginatedCurriculumResponse;
import tw.waterballsa.api.entity.Chapter;
import tw.waterballsa.api.entity.Curriculum;
import tw.waterballsa.api.entity.Lesson;
import tw.waterballsa.api.exception.ResourceNotFoundException;
import tw.waterballsa.api.repository.CurriculumRepository;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CurriculumService {

    @Autowired
    private CurriculumRepository curriculumRepository;

    @Transactional(readOnly = true)
    public PaginatedCurriculumResponse getAllCurriculums(int page, int size, String sort) {
        Pageable pageable = createPageable(page, size, sort);
        Page<Curriculum> curriculumPage = curriculumRepository.findAllPublished(pageable);
        return buildPaginatedResponse(curriculumPage);
    }

    @Transactional(readOnly = true)
    public CurriculumDto getCurriculumById(Integer id) {
        Curriculum curriculum = curriculumRepository.findByIdWithChapters(id.longValue())
                .orElseThrow(() -> new ResourceNotFoundException("Curriculum", "id", id));
        return convertToDto(curriculum, true);
    }

    @Transactional(readOnly = true)
    public PaginatedCurriculumResponse searchCurriculums(String query, int page, int size, String sort) {
        Pageable pageable = createPageable(page, size, sort);
        Page<Curriculum> curriculumPage = curriculumRepository.searchByTitleOrDescription(query, pageable);
        return buildPaginatedResponse(curriculumPage);
    }

    @Transactional(readOnly = true)
    public PaginatedCurriculumResponse getFreeCurriculums(int page, int size, String sort) {
        Pageable pageable = createPageable(page, size, sort);
        Page<Curriculum> curriculumPage = curriculumRepository.findByPrice(BigDecimal.ZERO, pageable);
        return buildPaginatedResponse(curriculumPage);
    }

    private Pageable createPageable(int page, int size, String sort) {
        String[] sortParams = sort.split(",");
        String sortField = sortParams[0];
        Sort.Direction direction = sortParams.length > 1 && sortParams[1].equalsIgnoreCase("asc")
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;
        return PageRequest.of(page, size, Sort.by(direction, sortField));
    }

    private PaginatedCurriculumResponse buildPaginatedResponse(Page<Curriculum> curriculumPage) {
        List<CurriculumDto> content = curriculumPage.getContent().stream()
                .map(curriculum -> convertToDto(curriculum, true))
                .collect(Collectors.toList());

        return PaginatedCurriculumResponse.builder()
                .content(content)
                .totalPages(curriculumPage.getTotalPages())
                .totalElements(curriculumPage.getTotalElements())
                .size(curriculumPage.getSize())
                .number(curriculumPage.getNumber())
                .build();
    }

    private CurriculumDto convertToDto(Curriculum curriculum, boolean includeChapters) {
        CurriculumDto dto = CurriculumDto.builder()
                .id(curriculum.getId().intValue())
                .title(curriculum.getTitle())
                .description(curriculum.getDescription())
                .thumbnailUrl(curriculum.getThumbnailUrl())
                .instructorName(curriculum.getInstructorName())
                .price(curriculum.getPrice())
                .currency(curriculum.getCurrency())
                .difficultyLevel(curriculum.getDifficultyLevel().name())
                .estimatedDurationHours(curriculum.getEstimatedDurationHours())
                .isPublished(curriculum.getIsPublished())
                .publishedAt(curriculum.getPublishedAt())
                .createdAt(curriculum.getCreatedAt())
                .build();

        if (includeChapters) {
            List<ChapterDto> chapters = curriculum.getChapters().stream()
                    .map(this::convertChapterToDto)
                    .collect(Collectors.toList());
            dto.setChapters(chapters);
        }

        return dto;
    }

    private ChapterDto convertChapterToDto(Chapter chapter) {
        List<LessonDto> lessons = chapter.getLessons().stream()
                .map(this::convertLessonToDto)
                .collect(Collectors.toList());

        return ChapterDto.builder()
                .id(chapter.getId().intValue())
                .curriculumId(chapter.getCurriculum().getId().intValue())
                .title(chapter.getTitle())
                .description(chapter.getDescription())
                .orderIndex(chapter.getOrderIndex())
                .createdAt(chapter.getCreatedAt())
                .lessons(lessons)
                .build();
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
