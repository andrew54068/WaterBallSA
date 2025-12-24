package tw.waterballsa.api.stepdefs;

import io.cucumber.java.Before;
import io.cucumber.spring.CucumberContextConfiguration;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Cucumber Spring Configuration
 * This class configures the Spring Boot test context for Cucumber tests
 */
@CucumberContextConfiguration
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class CucumberSpringConfiguration {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ScenarioContext scenarioContext;

    /**
     * Clear scenario context before each scenario
     */
    @Before
    public void setUp() {
        if (scenarioContext != null) {
            scenarioContext.clear();
        }
    }
}
