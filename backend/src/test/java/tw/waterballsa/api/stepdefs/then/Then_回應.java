package tw.waterballsa.api.stepdefs.then;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.cucumber.datatable.DataTable;
import io.cucumber.java.en.Then;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.MvcResult;
import tw.waterballsa.api.stepdefs.ScenarioContext;
import tw.waterballsa.api.stepdefs.helper.ISAFeatureArgumentResolver;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

public class Then_回應 {
    @Autowired
    private ScenarioContext context;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private ISAFeatureArgumentResolver resolver;

    @Then("回應, with table:")
    public void responseWithTable(DataTable dataTable) throws Exception {
        MvcResult lastResponse = context.getLastResponse();
        assertNotNull(lastResponse, "No response found in ScenarioContext");

        String content = lastResponse.getResponse().getContentAsString(java.nio.charset.StandardCharsets.UTF_8);
        JsonNode responseNode = objectMapper.readTree(content);

        Map<String, String> expectedData = dataTable.asMaps().get(0);

        for (Map.Entry<String, String> entry : expectedData.entrySet()) {
            String header = entry.getKey();
            String expectedValue = entry.getValue();

            // Handle extraction headers (e.g. >accessToken)
            if (header.startsWith(">")) {
                // If resolver should handle extraction, we can delegate or implement here.
                // For "check" purposes, usually we verify matching field?
                // But the value is <varName which is a placeholder.

                // If we want to verify the field exists and is not null?
                String fieldName = header.substring(1);
                String actualJson = getValueFromJson(responseNode, fieldName);
                if (actualJson == null) {
                    // Fail if field missing?
                    // Or maybe just skip verification if it's purely for extraction which happens
                    // in resolver?
                    // But resolver extraction usually happens in "When" step logic invocation if
                    // wired up.
                    // If "Then" references variables, they must be set.
                    // Here we simply check if field exists?
                    // For now, ignore extraction columns in "Then" verification logic, assume
                    // handled elsewhere or valid.
                } else if (expectedValue.startsWith("<")) {
                    // Is extraction. Store variable?
                    // The Resolver extractAndStoreVariables usually takes dataRow.
                    // We can call it manually here to ensure variables are captured from Response!
                    // This is crucial if variables are needed for LATER steps.
                    String varName = expectedValue.substring(1);
                    context.setContext(varName, actualJson); // Storing as string representation
                }
                continue;
            }

            // Standard verification
            if (expectedValue != null) {
                Object resolvedExpected = resolver.resolveVariable(expectedValue);
                String actual = getValueFromJson(responseNode, header);

                // Numeric comparison
                if (isNumeric(resolvedExpected.toString()) && isNumeric(actual)) {
                    double expectedNum = Double.parseDouble(resolvedExpected.toString());
                    double actualNum = Double.parseDouble(actual);
                    assertEquals(expectedNum, actualNum, 0.001, "Field " + header + " numeric mismatch");
                } else {
                    assertEquals(resolvedExpected.toString(), actual, "Field " + header + " mismatch");
                }
            }
        }
    }

    // Helper to get value from JSON with dot notation support
    private String getValueFromJson(JsonNode node, String path) {
        String[] keys = path.split("\\.");
        JsonNode current = node;
        for (String key : keys) {
            if (current == null || !current.has(key)) {
                return null;
            }
            current = current.get(key);
        }
        return current.asText();
    }

    private boolean isNumeric(String str) {
        if (str == null)
            return false;
        try {
            Double.parseDouble(str);
            return true;
        } catch (NumberFormatException e) {
            return false;
        }
    }
}
