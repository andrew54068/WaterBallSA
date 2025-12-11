package tw.waterballsa.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tw.waterballsa.api.entity.Lesson;

import java.util.List;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, Long> {

    @Query("SELECT l FROM Lesson l WHERE l.chapter.id = :chapterId ORDER BY l.orderIndex ASC")
    List<Lesson> findByChapterIdOrderByOrderIndex(@Param("chapterId") Long chapterId);

    @Query("SELECT l FROM Lesson l WHERE l.chapter.curriculum.id = :curriculumId AND l.isFreePreview = true ORDER BY l.chapter.orderIndex ASC, l.orderIndex ASC")
    List<Lesson> findFreePreviewLessonsByCurriculumId(@Param("curriculumId") Long curriculumId);

    @Query("SELECT l FROM Lesson l WHERE l.chapter.curriculum.id = :curriculumId ORDER BY l.chapter.orderIndex ASC, l.orderIndex ASC")
    List<Lesson> findAllByCurriculumId(@Param("curriculumId") Long curriculumId);
}
