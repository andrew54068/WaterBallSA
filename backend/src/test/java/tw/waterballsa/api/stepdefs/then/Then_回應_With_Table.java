package tw.waterballsa.api.stepdefs.then;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.cucumber.datatable.DataTable;
import io.cucumber.java.en.Then;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.MvcResult;
import tw.waterballsa.api.stepdefs.ScenarioContext;
import tw.waterballsa.api.stepdefs.helper.ISAFeatureArgumentResolver;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Common step definition for validating HTTP response with table data
 */
public class Then_回應_With_Table {

    @Autowired
    private ScenarioContext scenarioContext;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ISAFeatureArgumentResolver resolver;

    @Then("回應, with table:")
    public void validateResponse(DataTable dataTable) throws Exception {
        MvcResult result = scenarioContext.getLastResponse();
        assertNotNull(result, "No HTTP response found in context");

        String responseBody = result.getResponse().getContentAsString();

        // Handle empty response body for logout and other status-only responses
        if (responseBody == null || responseBody.trim().isEmpty()) {
            return;
        }

        JsonNode jsonResponse = objectMapper.readTree(responseBody);
        List<Map<String, String>> rows = dataTable.asMaps(String.class, String.class);
        List<String> headers = dataTable.row(0);

        // Parse context keys for variable extraction (handle > prefix)
        Map<Integer, String> contextKeyMap = resolver.parseContextKeys(headers);

        for (Map<String, String> row : rows) {
            for (Map.Entry<String, String> entry : row.entrySet()) {
                String fieldName = entry.getKey();
                String expectedValue = entry.getValue();

                // Skip VAR-System columns (columns with < or > prefix in header)
                if (fieldName.startsWith("<") || fieldName.startsWith(">")) {
                    continue;
                }

                // Get actual value from JSON response
                JsonNode actualNode = jsonResponse.get(fieldName);

                if (actualNode != null) {
                    Object resolvedExpected = resolver.resolveVariable(expectedValue);
                    String expectedStr = resolvedExpected != null ? resolvedExpected.toString() : null;

                    // Convert JSON node to appropriate type for comparison
                    String actualStr;
                    if (actualNode.isNull()) {
                        actualStr = null;
                    } else if (actualNode.isNumber()) {
                        actualStr = actualNode.asText();
                    } else if (actualNode.isBoolean()) {
                        actualStr = String.valueOf(actualNode.asBoolean());
                    } else {
                        actualStr = actualNode.asText();
                    }

                    // Compare values
                    assertEquals(expectedStr, actualStr,
                        String.format("Field '%s' should match. Expected: %s, Actual: %s",
                            fieldName, expectedStr, actualStr));
                }
            }

            // Extract and store variables from response (handle < symbol in headers)
            if (!contextKeyMap.isEmpty()) {
                List<String> dataRow = dataTable.row(rows.indexOf(row) + 1);

                // Convert JsonNode to Map for variable extraction
                Map<String, Object> responseMap = objectMapper.convertValue(jsonResponse, Map.class);

                resolver.extractAndStoreVariables(dataRow, contextKeyMap, responseMap);
            }
        }
    }
}
