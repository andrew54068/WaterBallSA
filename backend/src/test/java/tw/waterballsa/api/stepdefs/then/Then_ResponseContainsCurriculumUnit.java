package tw.waterballsa.api.stepdefs.then;

import io.cucumber.java.en.Then;
import io.cucumber.datatable.DataTable;
import org.springframework.beans.factory.annotation.Autowired;

public class Then_ResponseContainsCurriculumUnit {
    @Autowired
    private tw.waterballsa.api.stepdefs.ScenarioContext context;

    @Autowired
    private com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    @Autowired
    private tw.waterballsa.api.stepdefs.helper.ISAFeatureArgumentResolver resolver;

    @Autowired
    private Then_ResponseContainsCurriculum delegate;

    @Then("^回應列表包含Curriculum單元, with table:$")
    public void verify(DataTable dataTable) throws Exception {
        org.springframework.test.web.servlet.MvcResult result = context.getLastResponse();
        if (result == null)
            throw new AssertionError("No response found");

        String content = result.getResponse().getContentAsString(java.nio.charset.StandardCharsets.UTF_8);
        com.fasterxml.jackson.databind.JsonNode root = objectMapper.readTree(content);
        com.fasterxml.jackson.databind.JsonNode listNode = null;

        if (root.isArray()) {
            listNode = root;
        } else if (root.has("lessons") && root.get("lessons").isArray()) {
            listNode = root.get("lessons");
        } else if (root.has("content") && root.get("content").isArray()) { // Page
            listNode = root.get("content");
        }

        if (listNode == null || !listNode.isArray()) {
            // Fallback to delegate if strict array check is desired or if delegate has
            // other logic
            // But delegate throws exception if not array.
            // Check if root itself is the object and we are checking fields?
            // "Response is not a list or Page".
            throw new AssertionError("Response does not contain a list of units (lessons field missing or not array)");
        }

        java.util.List<java.util.Map<String, String>> expectations = dataTable.asMaps();

        for (java.util.Map<String, String> expectedRow : expectations) {
            boolean found = false;
            for (com.fasterxml.jackson.databind.JsonNode item : listNode) {
                if (matches(item, expectedRow)) {
                    found = true;
                    break;
                }
            }
            if (!found) { // shouldExist is implicitly true for "contains"
                throw new AssertionError("Expected item not found: " + expectedRow);
            }
        }
    }

    @Then("回應列表包含進度, with table:")
    public void verifyProgress(DataTable dataTable) throws Exception {
        delegate.responseListContains(dataTable);
    }

    private boolean matches(com.fasterxml.jackson.databind.JsonNode item, java.util.Map<String, String> expectedRow) {
        for (java.util.Map.Entry<String, String> entry : expectedRow.entrySet()) {
            String field = entry.getKey();
            Object resolved = resolver.resolveVariable(entry.getValue());
            String expectedVal = resolved != null ? resolved.toString() : null;

            if (expectedVal == null)
                continue;

            if (!item.has(field))
                return false;

            String actualVal = item.get(field).asText();
            if (!expectedVal.equals(actualVal)) {
                try {
                    double d1 = Double.parseDouble(expectedVal);
                    double d2 = Double.parseDouble(actualVal);
                    if (Math.abs(d1 - d2) > 0.001)
                        return false;
                } catch (NumberFormatException e) {
                    return false;
                }
            }
        }
        return true;
    }
}
