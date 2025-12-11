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
 * Step definitions for validating list/array responses
 */
public class Then_回應列表包含_With_Table {

    @Autowired
    private ScenarioContext scenarioContext;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ISAFeatureArgumentResolver resolver;

    @Then("回應列表包含Curriculum, with table:")
    public void validateCurriculumList(DataTable dataTable) throws Exception {
        validateListResponse(dataTable, "content");
    }

    @Then("回應列表包含Curriculum單元, with table:")
    public void validateLessonList(DataTable dataTable) throws Exception {
        validateListResponse(dataTable, "lessons");
    }

    @Then("回應列表包含章節, with table:")
    public void validateChapterList(DataTable dataTable) throws Exception {
        validateListResponse(dataTable, null); // Root is array
    }

    @Then("回應列表包含Purchase, with table:")
    public void validatePurchaseList(DataTable dataTable) throws Exception {
        validateListResponse(dataTable, "content");
    }

    @Then("回應列表包含進度, with table:")
    public void validateProgressList(DataTable dataTable) throws Exception {
        validateListResponse(dataTable, null); // Root is array
    }

    @Then("回應列表不包含Purchase, with table:")
    public void validatePurchaseListNotContains(DataTable dataTable) throws Exception {
        validateListResponse(dataTable, "content", false);
    }

    private void validateListResponse(DataTable dataTable, String arrayFieldName) throws Exception {
        validateListResponse(dataTable, arrayFieldName, true);
    }

    /**
     * Generic method to validate list/array responses
     * 
     * @param dataTable      Expected data table
     * @param arrayFieldName Field name containing the array, or null if root is
     *                       array
     * @param shouldContain  true if expecting items to exist, false if expecting
     *                       them NOT to exist
     */
    private void validateListResponse(DataTable dataTable, String arrayFieldName, boolean shouldContain)
            throws Exception {
        MvcResult result = scenarioContext.getLastResponse();
        assertNotNull(result, "No HTTP response found in context");

        String responseBody = result.getResponse().getContentAsString();
        assertNotNull(responseBody, "Response body should not be null");

        JsonNode jsonResponse = objectMapper.readTree(responseBody);

        // Get the array node
        JsonNode arrayNode;
        if (jsonResponse.isArray()) {
            arrayNode = jsonResponse;
        } else if (arrayFieldName != null) {
            arrayNode = jsonResponse.get(arrayFieldName);
            // If checking for non-existence, missing array is fine (implies empty/not
            // found)
            if (arrayNode == null && !shouldContain) {
                return;
            }
            assertNotNull(arrayNode, "Array field '" + arrayFieldName + "' should exist in response");
        } else {
            arrayNode = jsonResponse;
        }

        if (arrayNode == null && !shouldContain)
            return;

        assertTrue(arrayNode.isArray(), "Response should be an array");

        List<Map<String, String>> expectedRows = dataTable.asMaps(String.class, String.class);

        // Validate each expected row
        for (Map<String, String> expectedRow : expectedRows) {
            boolean found = false;

            for (JsonNode item : arrayNode) {
                boolean allFieldsMatch = true;

                for (Map.Entry<String, String> entry : expectedRow.entrySet()) {
                    String fieldName = entry.getKey();
                    String expectedValue = entry.getValue();

                    // Resolve variable
                    Object resolvedExpected = resolver.resolveVariable(expectedValue);
                    String expectedStr = resolvedExpected != null ? resolvedExpected.toString() : null;

                    // Get actual value from item
                    JsonNode actualNode = item.get(fieldName);
                    if (actualNode == null) {
                        allFieldsMatch = false;
                        break;
                    }

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
                    if (!String.valueOf(expectedStr).equals(String.valueOf(actualStr))) {
                        allFieldsMatch = false;
                        break;
                    }
                }

                if (allFieldsMatch) {
                    found = true;
                    break;
                }
            }

            if (shouldContain) {
                assertTrue(found, "Expected item not found in response array: " + expectedRow);
            } else {
                assertFalse(found, "Item should NOT be found in response array: " + expectedRow);
            }
        }
    }
}
