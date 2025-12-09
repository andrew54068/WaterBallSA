package tw.waterballsa.api.stepdefs.then;

import io.cucumber.java.en.Then;
import io.cucumber.datatable.DataTable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.MvcResult;
import tw.waterballsa.api.stepdefs.ScenarioContext;
import tw.waterballsa.api.stepdefs.helper.ISAFeatureArgumentResolver;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

public class Then_回應列表包含Purchase {
    @Autowired
    private ScenarioContext scenarioContext;
    @Autowired
    private ISAFeatureArgumentResolver resolver;
    @Autowired
    private ObjectMapper objectMapper;

    @Then("回應列表包含Purchase, with table:")
    public void responseListContainsPurchase(DataTable dataTable) throws Exception {
        MvcResult result = scenarioContext.getLastResponse();
        assertNotNull(result, "Response should not be null");

        String content = result.getResponse().getContentAsString();
        List<Map<String, Object>> responseList = objectMapper.readValue(content,
                new TypeReference<List<Map<String, Object>>>() {
                });

        List<Map<String, String>> expectedRows = dataTable.asMaps(String.class, String.class);

        for (Map<String, String> expectedRow : expectedRows) {
            String expectedCurriculumIdVar = expectedRow.get("curriculumId");
            Long expectedCurriculumId = Long.parseLong(resolver.resolveVariable(expectedCurriculumIdVar).toString());

            String expectedStatus = expectedRow.get("status");

            boolean found = responseList.stream().anyMatch(actual -> {
                Object actualCurriculumIdObj = actual.get("curriculumId");
                // JSON numbers can be Integer or Long
                Long actualCurriculumId = ((Number) actualCurriculumIdObj).longValue();

                String actualStatus = (String) actual.get("status");

                boolean match = true;
                if (expectedCurriculumId != null)
                    match &= expectedCurriculumId.equals(actualCurriculumId);
                if (expectedStatus != null)
                    match &= expectedStatus.equals(actualStatus);
                // Check other fields if needed, e.g. prices

                return match;
            });

            assertTrue(found, "Expected purchase with curriculumId=" + expectedCurriculumId + " status="
                    + expectedStatus + " not found in response.");
        }
    }
}
