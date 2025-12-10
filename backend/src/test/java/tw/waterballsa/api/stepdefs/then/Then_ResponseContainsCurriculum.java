package tw.waterballsa.api.stepdefs.then;

import io.cucumber.java.en.Then;
import io.cucumber.datatable.DataTable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.MvcResult;
import tw.waterballsa.api.stepdefs.ScenarioContext;
import tw.waterballsa.api.stepdefs.helper.ISAFeatureArgumentResolver;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import java.util.Map;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

import org.springframework.stereotype.Component;

public class Then_ResponseContainsCurriculum {

    @Autowired
    private ScenarioContext context;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ISAFeatureArgumentResolver resolver;

    @Then("^回應列表包含Curriculum, with table:$")
    public void responseListContains(DataTable dataTable) throws Exception {
        verifyList(dataTable, true);
    }

    @Then("回應列表不包含Curriculum, with table:")
    public void responseListNotContains(DataTable dataTable) throws Exception {
        verifyList(dataTable, false);
    }

    // Generic verification for lists
    private void verifyList(DataTable dataTable, boolean shouldExist) throws Exception {
        MvcResult result = context.getLastResponse();
        assertNotNull(result, "No response found");

        String content = result.getResponse().getContentAsString(java.nio.charset.StandardCharsets.UTF_8);
        JsonNode root = objectMapper.readTree(content);
        JsonNode listNode = root;

        // Handle paged response structure (PageImpl)
        if (root.has("content") && root.get("content").isArray()) {
            listNode = root.get("content");
        }

        assertNotNull(listNode, "Response content/root is null");
        assertTrue(listNode.isArray(), "Response is not a list or Page");

        List<Map<String, String>> expectations = dataTable.asMaps();

        for (Map<String, String> expectedRow : expectations) {
            boolean found = false;
            for (JsonNode item : listNode) {
                if (matches(item, expectedRow)) {
                    found = true;
                    break;
                }
            }
            if (shouldExist) {
                assertTrue(found, "Expected item not found: " + expectedRow);
            } else {
                assertFalse(found, "Item should not exist: " + expectedRow);
            }
        }
    }

    private boolean matches(JsonNode item, Map<String, String> expectedRow) {
        for (Map.Entry<String, String> entry : expectedRow.entrySet()) {
            String path = entry.getKey();
            Object resolved = resolver.resolveVariable(entry.getValue());
            String expectedVal = resolved != null ? resolved.toString() : null;

            if (expectedVal == null)
                continue;

            String actualVal = resolvePath(item, path);
            if (actualVal == null)
                return false;

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

    private String resolvePath(JsonNode root, String path) {
        JsonNode current = root;
        String[] segments = path.split("\\.");
        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("(\\w+)(?:\\[(\\d+)\\])?");

        for (String segment : segments) {
            java.util.regex.Matcher matcher = pattern.matcher(segment);
            if (!matcher.matches()) {
                if (current.has(segment)) {
                    current = current.get(segment);
                    continue;
                }
                return null;
            }

            String key = matcher.group(1);
            if (!current.has(key)) return null;
            current = current.get(key);

            String indexStr = matcher.group(2);
            if (indexStr != null) {
                if (!current.isArray()) return null;
                int index = Integer.parseInt(indexStr);
                if (index < 0 || index >= current.size()) return null;
                current = current.get(index);
            }
        }
        return current.isValueNode() ? current.asText() : current.toString();
    }
}
