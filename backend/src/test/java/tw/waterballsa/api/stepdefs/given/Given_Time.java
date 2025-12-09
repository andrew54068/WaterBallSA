package tw.waterballsa.api.stepdefs.given;

import io.cucumber.java.en.Given;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import tw.waterballsa.api.common.TimeProvider;
import tw.waterballsa.api.stepdefs.helper.ISAFeatureArgumentResolver;

import java.time.LocalDateTime;

import static org.mockito.Mockito.when;

public class Given_Time {

    @Autowired
    private TimeProvider timeProvider; // This should be a MockBean in CucumberConfig

    @Autowired
    private ISAFeatureArgumentResolver resolver;

    @Given("現在的時間是 {string}")
    public void currentTimeIs(String timeStr) {
        Object resolved = resolver.resolveVariable(timeStr);
        String resolvedStr = resolved.toString();
        System.err.println("DEBUG: Given_Time input=[" + timeStr + "]");
        System.err.println("DEBUG: Given_Time resolvedStr=[" + resolvedStr + "]");

        // Manually handle @time functionality to avoid regex issues
        String cleanStr = resolvedStr.replace("\"", "").replace("'", "");
        if (cleanStr.startsWith("@time")) {
            int start = cleanStr.indexOf("(") + 1;
            int end = cleanStr.lastIndexOf(")");
            if (start > 0 && end > start) {
                resolvedStr = cleanStr.substring(start, end);
            }
        }

        System.out.println("DEBUG: Parsed Date: " + resolvedStr);

        LocalDateTime time;
        if (resolved instanceof LocalDateTime) {
            time = (LocalDateTime) resolved;
        } else {
            // Append default time if only date is provided
            if (!resolvedStr.contains("T") && !resolvedStr.contains(" ")) {
                resolvedStr += "T00:00:00";
            }
            try {
                time = LocalDateTime.parse(resolvedStr);
            } catch (Exception e) {
                System.out.println("DEBUG: Failed to parse: " + resolvedStr);
                throw e;
            }
        }

        when(timeProvider.now()).thenReturn(time);
    }
}
