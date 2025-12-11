package tw.waterballsa.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tw.waterballsa.api.entity.Chapter;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChapterRepository extends JpaRepository<Chapter, Long> {

    @Query("SELECT c FROM Chapter c LEFT JOIN FETCH c.lessons WHERE c.id = :id")
    Optional<Chapter> findByIdWithLessons(@Param("id") Long id);

    @Query("SELECT c FROM Chapter c WHERE c.curriculum.id = :curriculumId ORDER BY c.orderIndex ASC")
    List<Chapter> findByCurriculumIdOrderByOrderIndex(@Param("curriculumId") Long curriculumId);

    @Query("SELECT COUNT(c) FROM Chapter c WHERE c.curriculum.id = :curriculumId")
    Long countByCurriculumId(@Param("curriculumId") Long curriculumId);
}
