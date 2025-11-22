package com.waterballsa.backend.service;

import com.waterballsa.backend.dto.CurriculumDto;
import com.waterballsa.backend.entity.Curriculum;
import com.waterballsa.backend.entity.DifficultyLevel;
import com.waterballsa.backend.exception.ResourceNotFoundException;
import com.waterballsa.backend.repository.CurriculumRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service for managing curriculums.
 *
 * Handles business logic for:
 * - Browsing and searching curriculums
 * - Retrieving curriculum details
 * - Filtering by difficulty and instructor
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CurriculumService {

    private final CurriculumRepository curriculumRepository;

    /**
     * Retrieves all published curriculums with pagination.
     *
     * @param pageable pagination information
     * @return page of curriculum DTOs
     */
    @Transactional(readOnly = true)
    public Page<CurriculumDto> getAllPublishedCurriculums(Pageable pageable) {
        log.debug("Fetching published curriculums, page: {}", pageable.getPageNumber());
        return curriculumRepository.findByIsPublishedTrue(pageable)
                .map(CurriculumDto::from);
    }

    /**
     * Retrieves a curriculum by ID with its chapters.
     *
     * @param id the curriculum ID
     * @return curriculum DTO with chapters
     * @throws ResourceNotFoundException if curriculum not found or not published
     */
    @Transactional(readOnly = true)
    public CurriculumDto getCurriculumById(Long id) {
        log.debug("Fetching curriculum with ID: {}", id);
        Curriculum curriculum = curriculumRepository.findPublishedByIdWithChapters(id)
                .orElseThrow(() -> new ResourceNotFoundException("Curriculum", "id", id));

        return CurriculumDto.fromWithChapters(curriculum);
    }

    /**
     * Searches published curriculums by title or description.
     *
     * @param searchTerm the search term
     * @param pageable pagination information
     * @return page of matching curriculum DTOs
     */
    @Transactional(readOnly = true)
    public Page<CurriculumDto> searchCurriculums(String searchTerm, Pageable pageable) {
        log.debug("Searching curriculums with term: {}", searchTerm);
        return curriculumRepository.searchPublishedCurriculums(searchTerm, pageable)
                .map(CurriculumDto::from);
    }

    /**
     * Filters published curriculums by difficulty level.
     *
     * @param difficultyLevel the difficulty level
     * @param pageable pagination information
     * @return page of matching curriculum DTOs
     */
    @Transactional(readOnly = true)
    public Page<CurriculumDto> getCurriculumsByDifficulty(DifficultyLevel difficultyLevel, Pageable pageable) {
        log.debug("Fetching curriculums with difficulty: {}", difficultyLevel);
        return curriculumRepository.findByIsPublishedTrueAndDifficultyLevel(difficultyLevel, pageable)
                .map(CurriculumDto::from);
    }

    /**
     * Finds curriculums by instructor name.
     *
     * @param instructorName the instructor name
     * @param pageable pagination information
     * @return page of matching curriculum DTOs
     */
    @Transactional(readOnly = true)
    public Page<CurriculumDto> getCurriculumsByInstructor(String instructorName, Pageable pageable) {
        log.debug("Fetching curriculums by instructor: {}", instructorName);
        return curriculumRepository.findByIsPublishedTrueAndInstructorNameContainingIgnoreCase(
                instructorName, pageable)
                .map(CurriculumDto::from);
    }

    /**
     * Retrieves all free curriculums (price = 0).
     *
     * @param pageable pagination information
     * @return page of free curriculum DTOs
     */
    @Transactional(readOnly = true)
    public Page<CurriculumDto> getFreeCurriculums(Pageable pageable) {
        log.debug("Fetching free curriculums");
        return curriculumRepository.findFreeCurriculums(pageable)
                .map(CurriculumDto::from);
    }

    /**
     * Counts all published curriculums.
     *
     * @return total count
     */
    @Transactional(readOnly = true)
    public long countPublishedCurriculums() {
        return curriculumRepository.countByIsPublishedTrue();
    }
}
