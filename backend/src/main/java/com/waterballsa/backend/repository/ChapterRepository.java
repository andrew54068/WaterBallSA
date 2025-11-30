package com.waterballsa.backend.repository;

import com.waterballsa.backend.entity.Chapter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Chapter entity operations.
 *
 * Provides database access methods for chapter management including:
 * - Finding chapters by curriculum
 * - Ordering chapters by sequence
 * - Loading chapters with lessons
 */
@Repository
public interface ChapterRepository extends JpaRepository<Chapter, Long> {

    /**
     * Finds all chapters for a curriculum ordered by order_index.
     *
     * @param curriculumId the curriculum ID
     * @return list of chapters ordered by sequence
     */
    List<Chapter> findByCurriculumIdOrderByOrderIndexAsc(Long curriculumId);

    /**
     * Finds all published chapters for a curriculum.
     *
     * @param curriculumId the curriculum ID
     * @return list of published chapters ordered by sequence
     */
    List<Chapter> findByCurriculumIdAndIsPublishedTrueOrderByOrderIndexAsc(Long curriculumId);

    /**
     * Finds a chapter by ID with its lessons eagerly loaded.
     *
     * @param id the chapter ID
     * @return an Optional containing the chapter with lessons
     */
    @Query("SELECT ch FROM Chapter ch LEFT JOIN FETCH ch.lessons WHERE ch.id = :id")
    Optional<Chapter> findByIdWithLessons(@Param("id") Long id);

    /**
     * Fetches lessons for multiple chapters in a single query.
     * This is used to avoid N+1 queries when loading curriculum with chapters and lessons.
     *
     * @param chapterIds list of chapter IDs
     * @return list of chapters with lessons eagerly loaded
     */
    @Query("SELECT DISTINCT ch FROM Chapter ch " +
           "LEFT JOIN FETCH ch.lessons l " +
           "WHERE ch.id IN :chapterIds " +
           "ORDER BY ch.orderIndex ASC, l.orderIndex ASC")
    List<Chapter> findByIdInWithLessons(@Param("chapterIds") List<Long> chapterIds);

    /**
     * Finds a published chapter by ID with its published lessons.
     *
     * @param id the chapter ID
     * @return an Optional containing the chapter if found and published
     */
    @Query("SELECT ch FROM Chapter ch LEFT JOIN FETCH ch.lessons l " +
           "WHERE ch.id = :id AND ch.isPublished = true AND l.isPublished = true " +
           "ORDER BY l.orderIndex ASC")
    Optional<Chapter> findPublishedByIdWithLessons(@Param("id") Long id);

    /**
     * Counts chapters in a curriculum.
     *
     * @param curriculumId the curriculum ID
     * @return count of chapters
     */
    long countByCurriculumId(Long curriculumId);

    /**
     * Counts published chapters in a curriculum.
     *
     * @param curriculumId the curriculum ID
     * @return count of published chapters
     */
    long countByCurriculumIdAndIsPublishedTrue(Long curriculumId);

    /**
     * Checks if a chapter exists with the given curriculum and order index.
     *
     * @param curriculumId the curriculum ID
     * @param orderIndex the order index
     * @return true if a chapter exists at this position
     */
    boolean existsByCurriculumIdAndOrderIndex(Long curriculumId, Integer orderIndex);

    /**
     * Deletes all chapters for a curriculum.
     *
     * @param curriculumId the curriculum ID
     */
    void deleteByCurriculumId(Long curriculumId);
}
