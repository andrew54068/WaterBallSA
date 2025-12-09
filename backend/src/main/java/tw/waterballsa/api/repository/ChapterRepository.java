package tw.waterballsa.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tw.waterballsa.api.entity.Chapter;
import java.util.List;

@Repository
public interface ChapterRepository extends JpaRepository<Chapter, Long> {
    List<Chapter> findByCurriculumId(Long curriculumId);

    List<Chapter> findByCurriculumIdOrderByOrderIndex(Long curriculumId);
}
