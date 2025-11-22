package com.waterballsa.backend.service;

import com.waterballsa.backend.dto.ChapterDto;
import com.waterballsa.backend.entity.Chapter;
import com.waterballsa.backend.exception.ResourceNotFoundException;
import com.waterballsa.backend.repository.ChapterRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for managing chapters.
 *
 * Handles business logic for:
 * - Retrieving chapters by curriculum
 * - Getting chapter details with lessons
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ChapterService {

    private final ChapterRepository chapterRepository;

    /**
     * Retrieves all published chapters for a curriculum.
     *
     * @param curriculumId the curriculum ID
     * @return list of chapter DTOs ordered by sequence
     */
    @Transactional(readOnly = true)
    public List<ChapterDto> getChaptersByCurriculum(Long curriculumId) {
        log.debug("Fetching chapters for curriculum ID: {}", curriculumId);
        return chapterRepository.findByCurriculumIdAndIsPublishedTrueOrderByOrderIndexAsc(curriculumId)
                .stream()
                .map(ChapterDto::from)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves a chapter by ID with its lessons.
     *
     * @param id the chapter ID
     * @return chapter DTO with lessons
     * @throws ResourceNotFoundException if chapter not found or not published
     */
    @Transactional(readOnly = true)
    public ChapterDto getChapterById(Long id) {
        log.debug("Fetching chapter with ID: {}", id);
        Chapter chapter = chapterRepository.findPublishedByIdWithLessons(id)
                .orElseThrow(() -> new ResourceNotFoundException("Chapter", "id", id));

        return ChapterDto.fromWithLessons(chapter);
    }

    /**
     * Counts chapters in a curriculum.
     *
     * @param curriculumId the curriculum ID
     * @return total count
     */
    @Transactional(readOnly = true)
    public long countChaptersByCurriculum(Long curriculumId) {
        return chapterRepository.countByCurriculumIdAndIsPublishedTrue(curriculumId);
    }
}
