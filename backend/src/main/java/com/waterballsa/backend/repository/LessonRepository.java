package com.waterballsa.backend.repository;

import com.waterballsa.backend.entity.Lesson;
import com.waterballsa.backend.entity.LessonType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Lesson entity operations.
 *
 * Provides database access methods for lesson management including:
 * - Finding lessons by chapter
 * - Filtering by lesson type
 * - Free preview queries (Phase 2)
 */
@Repository
public interface LessonRepository extends JpaRepository<Lesson, Long> {

    /**
     * Finds all lessons for a chapter ordered by order_index.
     *
     * @param chapterId the chapter ID
     * @return list of lessons ordered by sequence
     */
    List<Lesson> findByChapterIdOrderByOrderIndexAsc(Long chapterId);

    /**
     * Finds all published lessons for a chapter.
     *
     * @param chapterId the chapter ID
     * @return list of published lessons ordered by sequence
     */
    List<Lesson> findByChapterIdAndIsPublishedTrueOrderByOrderIndexAsc(Long chapterId);

    /**
     * Finds a published lesson by ID.
     *
     * @param id the lesson ID
     * @return an Optional containing the lesson if found and published
     */
    Optional<Lesson> findByIdAndIsPublishedTrue(Long id);

    /**
     * Finds all free preview lessons for a curriculum.
     *
     * @param curriculumId the curriculum ID
     * @return list of free preview lessons
     */
    @Query("SELECT l FROM Lesson l JOIN l.chapter ch WHERE ch.curriculum.id = :curriculumId " +
           "AND l.isFreePreview = true AND l.isPublished = true")
    List<Lesson> findFreePreviewLessonsByCurriculum(@Param("curriculumId") Long curriculumId);

    /**
     * Finds lessons by type.
     *
     * @param lessonType the lesson type
     * @param pageable pagination information
     * @return page of lessons of the specified type
     */
    Page<Lesson> findByLessonTypeAndIsPublishedTrue(LessonType lessonType, Pageable pageable);

    /**
     * Counts lessons in a chapter.
     *
     * @param chapterId the chapter ID
     * @return count of lessons
     */
    long countByChapterId(Long chapterId);

    /**
     * Counts published lessons in a chapter.
     *
     * @param chapterId the chapter ID
     * @return count of published lessons
     */
    long countByChapterIdAndIsPublishedTrue(Long chapterId);

    /**
     * Checks if a lesson exists with the given chapter and order index.
     *
     * @param chapterId the chapter ID
     * @param orderIndex the order index
     * @return true if a lesson exists at this position
     */
    boolean existsByChapterIdAndOrderIndex(Long chapterId, Integer orderIndex);

    /**
     * Finds all video lessons in a curriculum.
     *
     * @param curriculumId the curriculum ID
     * @return list of video lessons
     */
    @Query("SELECT l FROM Lesson l JOIN l.chapter ch WHERE ch.curriculum.id = :curriculumId " +
           "AND l.lessonType = 'VIDEO' AND l.isPublished = true ORDER BY ch.orderIndex, l.orderIndex")
    List<Lesson> findVideoLessonsByCurriculum(@Param("curriculumId") Long curriculumId);

    /**
     * Calculates total duration of all published lessons in a curriculum.
     *
     * @param curriculumId the curriculum ID
     * @return total duration in minutes
     */
    @Query("SELECT COALESCE(SUM(l.durationMinutes), 0) FROM Lesson l JOIN l.chapter ch " +
           "WHERE ch.curriculum.id = :curriculumId AND l.isPublished = true")
    Long calculateTotalDurationByCurriculum(@Param("curriculumId") Long curriculumId);

    /**
     * Deletes all lessons for a chapter.
     *
     * @param chapterId the chapter ID
     */
    void deleteByChapterId(Long chapterId);
}
