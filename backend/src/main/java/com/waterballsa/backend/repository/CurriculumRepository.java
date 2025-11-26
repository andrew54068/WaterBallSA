package com.waterballsa.backend.repository;

import com.waterballsa.backend.entity.Curriculum;
import com.waterballsa.backend.entity.DifficultyLevel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Curriculum entity operations.
 *
 * Provides database access methods for curriculum management including:
 * - Finding published curriculums
 * - Filtering by difficulty level
 * - Searching by title or instructor
 */
@Repository
public interface CurriculumRepository extends JpaRepository<Curriculum, Long> {

    /**
     * Finds all published curriculums.
     *
     * @param pageable pagination information
     * @return page of published curriculums
     */
    Page<Curriculum> findByIsPublishedTrue(Pageable pageable);

    /**
     * Finds all published curriculums by difficulty level.
     *
     * @param difficultyLevel the difficulty level
     * @param pageable pagination information
     * @return page of matching curriculums
     */
    Page<Curriculum> findByIsPublishedTrueAndDifficultyLevel(
            DifficultyLevel difficultyLevel, Pageable pageable);

    /**
     * Finds a published curriculum by ID with its chapters and lessons.
     * Uses two queries to avoid MultipleBagFetchException.
     *
     * @param id the curriculum ID
     * @return an Optional containing the curriculum if found and published
     */
    @Query("SELECT c FROM Curriculum c " +
           "LEFT JOIN FETCH c.chapters " +
           "WHERE c.id = :id AND c.isPublished = true")
    Optional<Curriculum> findPublishedByIdWithChapters(@Param("id") Long id);

    /**
     * Fetches lessons for chapters of a curriculum.
     * This is a workaround for MultipleBagFetchException.
     *
     * @param curriculumId the curriculum ID
     */
    @Query("SELECT DISTINCT c FROM Curriculum c " +
           "LEFT JOIN FETCH c.chapters ch " +
           "LEFT JOIN FETCH ch.lessons l " +
           "WHERE c.id = :curriculumId AND c.isPublished = true")
    Optional<Curriculum> findByIdWithChaptersAndLessons(@Param("curriculumId") Long curriculumId);

    /**
     * Finds curriculums by instructor name (case-insensitive).
     *
     * @param instructorName the instructor name
     * @param pageable pagination information
     * @return page of matching curriculums
     */
    Page<Curriculum> findByIsPublishedTrueAndInstructorNameContainingIgnoreCase(
            String instructorName, Pageable pageable);

    /**
     * Searches curriculums by title or description (case-insensitive).
     *
     * @param searchTerm the search term
     * @param pageable pagination information
     * @return page of matching published curriculums
     */
    @Query("SELECT c FROM Curriculum c WHERE c.isPublished = true AND " +
           "(LOWER(c.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(c.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    Page<Curriculum> searchPublishedCurriculums(@Param("searchTerm") String searchTerm, Pageable pageable);

    /**
     * Finds free curriculums (price = 0).
     *
     * @param pageable pagination information
     * @return page of free published curriculums
     */
    @Query("SELECT c FROM Curriculum c WHERE c.isPublished = true AND c.price = 0")
    Page<Curriculum> findFreeCurriculums(Pageable pageable);

    /**
     * Counts all published curriculums.
     *
     * @return count of published curriculums
     */
    long countByIsPublishedTrue();

    /**
     * Finds curriculums by instructor name.
     *
     * @param instructorName the instructor name
     * @return list of curriculums by this instructor
     */
    List<Curriculum> findByInstructorName(String instructorName);
}
