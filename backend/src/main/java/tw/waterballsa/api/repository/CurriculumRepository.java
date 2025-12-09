package tw.waterballsa.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tw.waterballsa.api.entity.Curriculum;

@Repository
public interface CurriculumRepository extends JpaRepository<Curriculum, Long> {
}
