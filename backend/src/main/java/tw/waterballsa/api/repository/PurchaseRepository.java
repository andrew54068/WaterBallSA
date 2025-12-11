package tw.waterballsa.api.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tw.waterballsa.api.entity.Purchase;

import java.util.Optional;

@Repository
public interface PurchaseRepository extends JpaRepository<Purchase, Long> {

    @Query("SELECT p FROM Purchase p WHERE p.user.id = :userId AND p.curriculum.id = :curriculumId AND p.status = 'COMPLETED'")
    Optional<Purchase> findCompletedPurchaseByUserIdAndCurriculumId(@Param("userId") Long userId, @Param("curriculumId") Long curriculumId);

    @Query("SELECT p FROM Purchase p WHERE p.user.id = :userId ORDER BY p.createdAt DESC")
    Page<Purchase> findByUserId(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT p FROM Purchase p WHERE p.user.id = :userId AND p.status = 'COMPLETED' ORDER BY p.purchasedAt DESC")
    Page<Purchase> findCompletedPurchasesByUserId(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT CASE WHEN COUNT(p) > 0 THEN true ELSE false END FROM Purchase p WHERE p.user.id = :userId AND p.curriculum.id = :curriculumId AND p.status = 'COMPLETED'")
    boolean existsCompletedPurchaseByUserIdAndCurriculumId(@Param("userId") Long userId, @Param("curriculumId") Long curriculumId);

    @Query("SELECT CASE WHEN COUNT(p) > 0 THEN true ELSE false END FROM Purchase p WHERE p.user.id = :userId AND p.curriculum.id = :curriculumId AND p.status = :status")
    boolean existsByUserIdAndCurriculumIdAndStatus(@Param("userId") Long userId, @Param("curriculumId") Long curriculumId, @Param("status") Purchase.PurchaseStatus status);

    @Query("SELECT p FROM Purchase p WHERE p.user.id = :userId AND p.status = :status")
    Page<Purchase> findByUserIdAndStatus(@Param("userId") Long userId, @Param("status") Purchase.PurchaseStatus status, Pageable pageable);
}
