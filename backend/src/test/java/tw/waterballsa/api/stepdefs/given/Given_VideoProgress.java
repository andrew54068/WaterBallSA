package tw.waterballsa.api.stepdefs.given;

import io.cucumber.java.en.Given;
import io.cucumber.datatable.DataTable;
import org.springframework.beans.factory.annotation.Autowired;
import tw.waterballsa.api.entity.VideoProgress;
import tw.waterballsa.api.repository.VideoProgressRepository;
import tw.waterballsa.api.stepdefs.helper.ISAFeatureArgumentResolver;
import tw.waterballsa.api.stepdefs.ScenarioContext;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class Given_VideoProgress {
    @Autowired
    private VideoProgressRepository videoProgressRepository;
    @Autowired
    private ISAFeatureArgumentResolver resolver;
    @Autowired
    private ScenarioContext scenarioContext;

    @Given("準備一個VideoProgress, with table:")
    public void prepareVideoProgress(DataTable dataTable) {
        List<Map<String, String>> rows = dataTable.asMaps(String.class, String.class);
        List<String> headers = new ArrayList<>(dataTable.row(0));
        Map<Integer, String> contextKeyMap = resolver.parseContextKeys(headers);

        for (Map<String, String> row : rows) {
            String userIdStr = resolver.resolveVariable(row.get("userId")).toString();
            Long userId = Long.parseLong(userIdStr);

            String lessonIdStr = resolver.resolveVariable(row.get("lessonId")).toString();
            Long lessonId = Long.parseLong(lessonIdStr);

            String currentTimeStr = row.get("currentTimeSeconds");
            BigDecimal currentTime = currentTimeStr != null ? new BigDecimal(currentTimeStr) : BigDecimal.ZERO;

            String isCompletedStr = row.get("isCompleted");
            Boolean isCompleted = isCompletedStr != null ? Boolean.parseBoolean(isCompletedStr) : false;

            String durationStr = row.get("durationSeconds");
            BigDecimal duration = durationStr != null ? new BigDecimal(durationStr) : new BigDecimal("100.0");

            String completionStr = row.get("completionPercentage");
            BigDecimal completion = completionStr != null ? new BigDecimal(completionStr) : BigDecimal.ZERO;

            VideoProgress progress = VideoProgress.builder()
                    .userId(userId)
                    .lessonId(lessonId)
                    .currentTimeSeconds(currentTime)
                    .durationSeconds(duration)
                    .completionPercentage(completion)
                    .isCompleted(isCompleted)
                    .build();

            VideoProgress saved = videoProgressRepository.save(progress);

            List<String> dataRowValues = new ArrayList<>();
            for (String header : headers) {
                dataRowValues.add(row.get(header));
            }

            Map<String, Object> actualData = new java.util.HashMap<>();
            actualData.put("VideoProgress.id", saved.getId());
            actualData.put("userId", saved.getUserId());
            actualData.put("lessonId", saved.getLessonId());

            resolver.extractAndStoreVariables(dataRowValues, contextKeyMap, actualData);
            scenarioContext.setContext("VideoProgress", saved);
        }
    }
}
