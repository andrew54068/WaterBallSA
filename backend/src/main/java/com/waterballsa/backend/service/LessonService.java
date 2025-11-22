package com.waterballsa.backend.service;

import com.waterballsa.backend.dto.LessonDto;
import com.waterballsa.backend.entity.Lesson;
import com.waterballsa.backend.entity.LessonType;
import com.waterballsa.backend.exception.ResourceNotFoundException;
import com.waterballsa.backend.repository.LessonRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for managing lessons.
 *
 * Handles business logic for:
 * - Retrieving lessons by chapter
 * - Getting lesson details
 * - Filtering by lesson type
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class LessonService {

    private final LessonRepository lessonRepository;

    /**
     * Retrieves all published lessons for a chapter.
     *
     * @param chapterId the chapter ID
     * @return list of lesson DTOs ordered by sequence
     */
    @Transactional(readOnly = true)
    public List<LessonDto> getLessonsByChapter(Long chapterId) {
        log.debug("Fetching lessons for chapter ID: {}", chapterId);
        return lessonRepository.findByChapterIdAndIsPublishedTrueOrderByOrderIndexAsc(chapterId)
                .stream()
                .map(LessonDto::from)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves a lesson by ID.
     *
     * @param id the lesson ID
     * @return lesson DTO
     * @throws ResourceNotFoundException if lesson not found or not published
     */
    @Transactional(readOnly = true)
    public LessonDto getLessonById(Long id) {
        log.debug("Fetching lesson with ID: {}", id);
        Lesson lesson = lessonRepository.findByIdAndIsPublishedTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson", "id", id));

        return LessonDto.from(lesson);
    }

    /**
     * Retrieves all free preview lessons for a curriculum.
     *
     * @param curriculumId the curriculum ID
     * @return list of free preview lesson DTOs
     */
    @Transactional(readOnly = true)
    public List<LessonDto> getFreePreviewLessons(Long curriculumId) {
        log.debug("Fetching free preview lessons for curriculum ID: {}", curriculumId);
        return lessonRepository.findFreePreviewLessonsByCurriculum(curriculumId)
                .stream()
                .map(LessonDto::from)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves all video lessons in a curriculum.
     *
     * @param curriculumId the curriculum ID
     * @return list of video lesson DTOs
     */
    @Transactional(readOnly = true)
    public List<LessonDto> getVideoLessons(Long curriculumId) {
        log.debug("Fetching video lessons for curriculum ID: {}", curriculumId);
        return lessonRepository.findVideoLessonsByCurriculum(curriculumId)
                .stream()
                .map(LessonDto::from)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves lessons by type with pagination.
     *
     * @param lessonType the lesson type
     * @param pageable pagination information
     * @return page of lesson DTOs
     */
    @Transactional(readOnly = true)
    public Page<LessonDto> getLessonsByType(LessonType lessonType, Pageable pageable) {
        log.debug("Fetching lessons of type: {}", lessonType);
        return lessonRepository.findByLessonTypeAndIsPublishedTrue(lessonType, pageable)
                .map(LessonDto::from);
    }

    /**
     * Calculates total duration of all lessons in a curriculum.
     *
     * @param curriculumId the curriculum ID
     * @return total duration in minutes
     */
    @Transactional(readOnly = true)
    public Long calculateTotalDuration(Long curriculumId) {
        return lessonRepository.calculateTotalDurationByCurriculum(curriculumId);
    }

    /**
     * Counts lessons in a chapter.
     *
     * @param chapterId the chapter ID
     * @return total count
     */
    @Transactional(readOnly = true)
    public long countLessonsByChapter(Long chapterId) {
        return lessonRepository.countByChapterIdAndIsPublishedTrue(chapterId);
    }
}
