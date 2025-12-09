package tw.waterballsa.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tw.waterballsa.api.entity.VideoProgress;

@Repository
public interface VideoProgressRepository extends JpaRepository<VideoProgress, Long> {
}
