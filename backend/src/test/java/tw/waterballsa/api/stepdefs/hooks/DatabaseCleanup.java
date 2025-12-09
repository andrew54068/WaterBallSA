package tw.waterballsa.api.stepdefs.hooks;

import io.cucumber.java.After;
import org.springframework.beans.factory.annotation.Autowired;
import tw.waterballsa.api.repository.*;

public class DatabaseCleanup {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PurchaseRepository purchaseRepository;
    @Autowired
    private VideoProgressRepository videoProgressRepository;
    @Autowired
    private CurriculumRepository curriculumRepository;
    @Autowired
    private CouponRepository couponRepository;
    @Autowired
    private ChapterRepository chapterRepository;
    @Autowired
    private LessonRepository lessonRepository;

    @After
    public void cleanup() {
        // Delete child entities first to avoid foreign key constraints (if any)
        videoProgressRepository.deleteAll();
        purchaseRepository.deleteAll();
        couponRepository.deleteAll();

        lessonRepository.deleteAll();
        chapterRepository.deleteAll();
        curriculumRepository.deleteAll();

        userRepository.deleteAll();
    }
}
