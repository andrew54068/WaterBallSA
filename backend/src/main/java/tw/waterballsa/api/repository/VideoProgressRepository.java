package tw.waterballsa.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tw.waterballsa.api.entity.VideoProgress;

import java.util.List;
import java.util.Optional;

@Repository
public interface VideoProgressRepository extends JpaRepository<VideoProgress, Long> {

    @Query("SELECT vp FROM VideoProgress vp WHERE vp.user.id = :userId AND vp.lesson.id = :lessonId")
    Optional<VideoProgress> findByUserIdAndLessonId(@Param("userId") Long userId, @Param("lessonId") Long lessonId);

    @Query("SELECT vp FROM VideoProgress vp WHERE vp.user.id = :userId AND vp.lesson.chapter.id = :chapterId")
    List<VideoProgress> findByUserIdAndChapterId(@Param("userId") Long userId, @Param("chapterId") Long chapterId);

    @Query("SELECT vp FROM VideoProgress vp WHERE vp.user.id = :userId")
    List<VideoProgress> findByUserId(@Param("userId") Long userId);
}
