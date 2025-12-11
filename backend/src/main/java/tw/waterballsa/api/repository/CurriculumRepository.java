package tw.waterballsa.api.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tw.waterballsa.api.entity.Curriculum;

import java.math.BigDecimal;
import java.util.Optional;

@Repository
public interface CurriculumRepository extends JpaRepository<Curriculum, Long> {

    @Query("SELECT c FROM Curriculum c LEFT JOIN FETCH c.chapters WHERE c.id = :id")
    Optional<Curriculum> findByIdWithChapters(@Param("id") Long id);

    @Query("SELECT c FROM Curriculum c WHERE c.isPublished = true")
    Page<Curriculum> findAllPublished(Pageable pageable);

    @Query("SELECT c FROM Curriculum c WHERE c.price = :price")
    Page<Curriculum> findByPrice(@Param("price") BigDecimal price, Pageable pageable);

    @Query("SELECT c FROM Curriculum c WHERE c.difficultyLevel = :level")
    Page<Curriculum> findByDifficultyLevel(@Param("level") Curriculum.DifficultyLevel level, Pageable pageable);

    @Query("SELECT c FROM Curriculum c WHERE LOWER(c.title) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(c.description) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Curriculum> searchByTitleOrDescription(@Param("query") String query, Pageable pageable);
}
