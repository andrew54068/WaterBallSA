package tw.waterballsa.api.stepdefs.given;

import io.cucumber.java.en.Given;
import io.cucumber.datatable.DataTable;
import org.springframework.beans.factory.annotation.Autowired;
import tw.waterballsa.api.entity.Chapter;
import tw.waterballsa.api.repository.ChapterRepository;
import tw.waterballsa.api.stepdefs.helper.ISAFeatureArgumentResolver;
import tw.waterballsa.api.stepdefs.ScenarioContext;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class Given_Chapter {
    @Autowired
    private ChapterRepository chapterRepository;
    @Autowired
    private ISAFeatureArgumentResolver resolver;
    @Autowired
    private ScenarioContext scenarioContext;

    @Given("準備一個章節, with table:")
    public void prepareChapter(DataTable dataTable) {
        List<Map<String, String>> rows = dataTable.asMaps(String.class, String.class);
        List<String> headers = new ArrayList<>(dataTable.row(0));
        Map<Integer, String> contextKeyMap = resolver.parseContextKeys(headers);

        for (Map<String, String> row : rows) {
            String curriculumIdStr = resolver.resolveVariable(row.get("curriculumId")).toString();
            Long curriculumId = Long.parseLong(curriculumIdStr);
            String title = row.get("title");
            String orderIndexStr = row.get("orderIndex");
            Integer orderIndex = orderIndexStr != null ? Integer.parseInt(orderIndexStr) : 0;

            Chapter chapter = Chapter.builder()
                    .curriculumId(curriculumId)
                    .title(title)
                    .orderIndex(orderIndex)
                    .build();

            Chapter saved = chapterRepository.save(chapter);

            List<String> dataRowValues = new ArrayList<>();
            for (String header : headers) {
                dataRowValues.add(row.get(header));
            }

            Map<String, Object> actualData = new java.util.HashMap<>();
            actualData.put("Chapter.id", saved.getId());
            actualData.put("curriculumId", saved.getCurriculumId());
            actualData.put("title", saved.getTitle());

            // Deduce entity name from headers, e.g., >Chapter1.id -> save Chapter1 object
            // and id
            for (String header : headers) {
                if (header.startsWith(">") && header.endsWith(".id")) {
                    String key = header.substring(1); // Chapter1.id
                    actualData.put(key, saved.getId());

                    String entityName = key.substring(0, key.lastIndexOf("."));
                    scenarioContext.setContext(entityName, saved);
                }
            }

            resolver.extractAndStoreVariables(dataRowValues, contextKeyMap, actualData);
            scenarioContext.setContext("Chapter", saved);
        }
    }
}
