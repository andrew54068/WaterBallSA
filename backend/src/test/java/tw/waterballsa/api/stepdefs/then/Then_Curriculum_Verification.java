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
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

public class Then_Curriculum_Verification {

    @Autowired
    private ScenarioContext scenarioContext;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ISAFeatureArgumentResolver resolver;

    @Then("^課程 (.+) 應包含章節, with table:$")
    public void 課程_id_應包含章節_with_table(String curriculumIdVar, DataTable dataTable) throws Exception {
        // 1. Get Response
        MvcResult result = scenarioContext.getLastResponse();
        assertNotNull(result, "No HTTP response found in context");
        String responseBody = result.getResponse().getContentAsString();
        JsonNode rootNode = objectMapper.readTree(responseBody);

        // 2. Resolve Curriculum ID
        Object resolved = resolver.resolveVariable(curriculumIdVar);
        String expectedCurriculumId = resolved != null ? resolved.toString() : curriculumIdVar;

        // 3. Find target curriculum in response (support both Page<Curriculum> and
        // single Curriculum)
        JsonNode targetCurriculum = null;
        if (rootNode.has("content") && rootNode.get("content").isArray()) {
            // Page<Curriculum>
            for (JsonNode node : rootNode.get("content")) {
                if (node.has("id") && node.get("id").asText().equals(expectedCurriculumId)) {
                    targetCurriculum = node;
                    break;
                }
            }
        } else if (rootNode.isArray()) {
            // List<Curriculum>
            for (JsonNode node : rootNode) {
                if (node.has("id") && node.get("id").asText().equals(expectedCurriculumId)) {
                    targetCurriculum = node;
                    break;
                }
            }
        } else if (rootNode.has("id") && rootNode.get("id").asText().equals(expectedCurriculumId)) {
            // Single Curriculum
            targetCurriculum = rootNode;
        }

        assertNotNull(targetCurriculum, "Curriculum with id " + expectedCurriculumId + " not found in response");

        // 4. Validate Chapters
        validateListResponse(targetCurriculum.get("chapters"), dataTable);
    }

    @Then("^章節 (.+) 應包含單元, with table:$")
    public void 章節_id_應包含單元_with_table(String chapterIdVar, DataTable dataTable) throws Exception {
        // 1. Get Response
        MvcResult result = scenarioContext.getLastResponse();
        assertNotNull(result, "No HTTP response found in context");
        String responseBody = result.getResponse().getContentAsString();
        JsonNode rootNode = objectMapper.readTree(responseBody);

        // 2. Resolve Chapter ID
        Object resolved = resolver.resolveVariable(chapterIdVar);
        String expectedChapterId = resolved != null ? resolved.toString() : chapterIdVar;

        // 3. Find target chapter (Deep search in curriculums -> chapters)
        JsonNode targetChapter = findChapterRecursive(rootNode, expectedChapterId);
        assertNotNull(targetChapter, "Chapter with id " + expectedChapterId + " not found in response");

        // 4. Validate Lessons
        validateListResponse(targetChapter.get("lessons"), dataTable);
    }

    private JsonNode findChapterRecursive(JsonNode node, String chapterId) {
        if (node.isArray()) {
            for (JsonNode item : node) {
                JsonNode found = findChapterRecursive(item, chapterId);
                if (found != null)
                    return found;
            }
        } else if (node.isObject()) {
            // Check if this node is the chapter
            if (node.has("id") && node.get("id").asText().equals(chapterId)) {
                // Weak check: assume it's a chapter if it matches ID.
                // Ideally we should know context, but ID is unique enough for tests.
                return node;
            }

            // Search in "content" (Page), "chapters" fields
            if (node.has("content")) {
                JsonNode found = findChapterRecursive(node.get("content"), chapterId);
                if (found != null)
                    return found;
            }
            if (node.has("chapters")) {
                JsonNode found = findChapterRecursive(node.get("chapters"), chapterId);
                if (found != null)
                    return found;
            }
        }
        return null;
    }

    private void validateListResponse(JsonNode arrayNode, DataTable dataTable) throws Exception {
        assertNotNull(arrayNode, "Expected list field is missing (null)");
        assertTrue(arrayNode.isArray(), "Field should be an array but was: " + arrayNode.getNodeType());

        List<Map<String, String>> expectedRows = dataTable.asMaps(String.class, String.class);
        for (Map<String, String> expectedRow : expectedRows) {
            boolean found = false;
            for (JsonNode item : arrayNode) {
                if (matches(item, expectedRow)) {
                    found = true;
                    break;
                }
            }
            assertTrue(found, "Expected item not found in list: " + expectedRow + ". Actual list: " + arrayNode);
        }
    }

    private boolean matches(JsonNode item, Map<String, String> expectedRow) {
        for (Map.Entry<String, String> entry : expectedRow.entrySet()) {
            String fieldName = entry.getKey();
            String expectedValue = entry.getValue();

            Object resolvedExpected = resolver.resolveVariable(expectedValue);
            String expectedStr = resolvedExpected != null ? resolvedExpected.toString() : null;

            JsonNode actualNode = item.get(fieldName);
            if (actualNode == null)
                return false;

            String actualStr = actualNode.isNull() ? null
                    : actualNode.isBoolean() ? String.valueOf(actualNode.asBoolean()) : actualNode.asText();

            if (!String.valueOf(expectedStr).equals(String.valueOf(actualStr))) {
                return false;
            }
        }
        return true;
    }
}
