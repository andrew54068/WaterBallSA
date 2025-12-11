package tw.waterballsa.api.stepdefs.given;

import io.cucumber.java.en.Given;
import org.springframework.beans.factory.annotation.Autowired;
import tw.waterballsa.api.stepdefs.ScenarioContext;
import tw.waterballsa.api.stepdefs.helper.ISAFeatureArgumentResolver;

import java.time.LocalDateTime;

/**
 * Given step definition for mocking current time in tests
 */
public class Given_現在的時間是 {

    @Autowired
    private ScenarioContext scenarioContext;

    @Autowired
    private ISAFeatureArgumentResolver resolver;

    @Given("現在的時間是 {string}")
    public void setCurrentTime(String timeExpression) {
        // Resolve the time variable (handles @time(...) function)
        Object resolvedTime = resolver.resolveVariable(timeExpression);

        // Convert to LocalDateTime if needed
        LocalDateTime dateTime;
        if (resolvedTime instanceof LocalDateTime) {
            dateTime = (LocalDateTime) resolvedTime;
        } else {
            dateTime = resolver.convertValue(resolvedTime.toString(), LocalDateTime.class);
        }

        // Store in scenario context for use in coupon validation
        scenarioContext.setVariable("CURRENT_TIME", dateTime);
    }
}
