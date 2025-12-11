package tw.waterballsa.api.stepdefs;

import io.cucumber.java.After;
import org.springframework.beans.factory.annotation.Autowired;
import tw.waterballsa.api.repository.*;

/**
 * Hook to clean up database between Cucumber scenarios
 */
public class DatabaseCleanupHook {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CurriculumRepository curriculumRepository;

    @Autowired
    private ChapterRepository chapterRepository;

    @Autowired
    private LessonRepository lessonRepository;

    @Autowired
    private PurchaseRepository purchaseRepository;

    @Autowired
    private VideoProgressRepository videoProgressRepository;

    @Autowired
    private CouponRepository couponRepository;

    @Autowired
    private ScenarioContext scenarioContext;

    /**
     * Clean up database after each scenario to ensure test isolation
     */
    @After(order = 1)
    public void cleanupDatabase() {
        // Delete in correct order to respect foreign key constraints
        videoProgressRepository.deleteAll();
        purchaseRepository.deleteAll();
        lessonRepository.deleteAll();
        chapterRepository.deleteAll();
        curriculumRepository.deleteAll();
        couponRepository.deleteAll();
        userRepository.deleteAll();
    }

    /**
     * Clear scenario context after each scenario
     */
    @After(order = 2)
    public void clearScenarioContext() {
        if (scenarioContext != null) {
            scenarioContext.clear();
        }
    }
}
