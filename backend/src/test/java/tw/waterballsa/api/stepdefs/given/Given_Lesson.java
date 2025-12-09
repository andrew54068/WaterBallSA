package tw.waterballsa.api.stepdefs.given;

import io.cucumber.java.en.Given;
import io.cucumber.datatable.DataTable;
import org.springframework.beans.factory.annotation.Autowired;
import tw.waterballsa.api.entity.Lesson;
import tw.waterballsa.api.repository.LessonRepository;
import tw.waterballsa.api.stepdefs.helper.ISAFeatureArgumentResolver;
import tw.waterballsa.api.stepdefs.ScenarioContext;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class Given_Lesson {
    @Autowired
    private LessonRepository lessonRepository;
    @Autowired
    private ISAFeatureArgumentResolver resolver;
    @Autowired
    private ScenarioContext scenarioContext;

    @Given("準備一個Lesson, with table:")
    public void prepareLesson(DataTable dataTable) {
        List<Map<String, String>> rows = dataTable.asMaps(String.class, String.class);
        List<String> headers = new ArrayList<>(dataTable.row(0));
        Map<Integer, String> contextKeyMap = resolver.parseContextKeys(headers);

        for (Map<String, String> row : rows) {
            String chapterIdStr = resolver.resolveVariable(row.get("chapterId")).toString();
            Long chapterId = Long.parseLong(chapterIdStr);
            String title = row.get("title");
            String lessonTypeStr = row.get("lessonType");
            Lesson.LessonType lessonType = lessonTypeStr != null ? Lesson.LessonType.valueOf(lessonTypeStr) : null;
            String orderIndexStr = row.get("orderIndex");
            Integer orderIndex = orderIndexStr != null ? Integer.parseInt(orderIndexStr) : null;

            String isFreePreviewStr = row.get("isFreePreview");
            boolean isFreePreview = (isFreePreviewStr != null) && Boolean.parseBoolean(isFreePreviewStr);

            String durationStr = row.get("durationMinutes");
            Integer duration = durationStr != null ? Integer.parseInt(durationStr) : null;

            Lesson lesson = Lesson.builder()
                    .chapterId(chapterId)
                    .title(title)
                    .lessonType(lessonType)
                    .orderIndex(orderIndex)
                    .isFreePreview(isFreePreview)
                    .duration(duration)
                    .build();

            Lesson saved = lessonRepository.save(lesson);

            List<String> dataRowValues = new ArrayList<>();
            for (String header : headers) {
                dataRowValues.add(row.get(header));
            }

            Map<String, Object> actualData = new java.util.HashMap<>();
            actualData.put("Lesson.id", saved.getId());

            // Deduce entity name from headers, e.g., >Lesson1.id -> save Lesson1 object and
            // id
            for (String header : headers) {
                if (header.startsWith(">") && header.endsWith(".id")) {
                    String key = header.substring(1); // Lesson1.id
                    actualData.put(key, saved.getId());

                    String entityName = key.substring(0, key.lastIndexOf("."));
                    scenarioContext.setContext(entityName, saved);
                }
            }

            resolver.extractAndStoreVariables(dataRowValues, contextKeyMap, actualData);
            scenarioContext.setContext("Lesson", saved);
        }
    }
}
