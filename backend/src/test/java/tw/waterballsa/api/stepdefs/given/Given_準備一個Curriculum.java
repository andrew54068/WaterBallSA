package tw.waterballsa.api.stepdefs.given;

import io.cucumber.java.en.Given;
import io.cucumber.datatable.DataTable;
import org.springframework.beans.factory.annotation.Autowired;
import tw.waterballsa.api.entity.Curriculum;
import tw.waterballsa.api.repository.CurriculumRepository;
import tw.waterballsa.api.stepdefs.helper.ISAFeatureArgumentResolver;
import tw.waterballsa.api.stepdefs.ScenarioContext;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class Given_準備一個Curriculum {
    @Autowired
    private CurriculumRepository curriculumRepository;
    // Map used to simulate DB for mocks if needed, but repository mock is already
    // defined in Config.
    // Instead we rely on the injected repository.
    @Autowired
    private ISAFeatureArgumentResolver resolver;
    @Autowired
    private ScenarioContext scenarioContext;

    @Given("準備一個Curriculum, with table:")
    public void prepareCurriculum(DataTable dataTable) {
        List<Map<String, String>> rows = dataTable.asMaps(String.class, String.class);
        List<String> headers = new ArrayList<>(dataTable.row(0));
        Map<Integer, String> contextKeyMap = resolver.parseContextKeys(headers);

        for (Map<String, String> row : rows) {
            String priceStr = row.get("price");
            // Default to 1000.0 (paid) if price is not specified to avoid polluting free
            // courses
            double price = (priceStr != null) ? Double.parseDouble(priceStr) : 1000.0;

            String isPublishedStr = row.get("isPublished");
            boolean isPublished = (isPublishedStr != null) && Boolean.parseBoolean(isPublishedStr);

            String diffStr = row.get("difficultyLevel");
            Curriculum.DifficultyLevel difficultyLevel = (diffStr != null) ? Curriculum.DifficultyLevel.valueOf(diffStr)
                    : Curriculum.DifficultyLevel.BEGINNER;

            String estimatedDurationHoursStr = row.get("estimatedDurationHours");
            Integer estimatedDurationHours = (estimatedDurationHoursStr != null)
                    ? Integer.parseInt(estimatedDurationHoursStr)
                    : 10;

            String publishedAtStr = row.get("publishedAt");
            java.time.LocalDateTime publishedAt = (publishedAtStr != null)
                    ? java.time.LocalDateTime.parse(publishedAtStr)
                    : null;

            Curriculum curriculum = Curriculum.builder()
                    .title(row.get("title"))
                    .instructorName(row.getOrDefault("instructorName", "Default Instructor"))
                    .description(row.getOrDefault("description", "Default Description"))
                    .thumbnailUrl(row.get("thumbnailUrl"))
                    .price(price)
                    .currency(row.get("currency"))
                    .difficultyLevel(difficultyLevel)
                    .estimatedDurationHours(estimatedDurationHours)
                    .isPublished(isPublished)
                    .publishedAt(publishedAt)
                    .build();

            Curriculum saved = curriculumRepository.save(curriculum);

            List<String> dataRowValues = new ArrayList<>();
            for (String header : headers) {
                dataRowValues.add(row.get(header));
            }

            Map<String, Object> actualData = new java.util.HashMap<>();

            // Check headers for dynamic entity extraction e.g. >JavaCourse.id
            for (String header : headers) {
                if (header.startsWith(">") && header.endsWith(".id")) {
                    String key = header.substring(1); // JavaCourse.id
                    actualData.put(key, saved.getId());

                    String entityName = key.substring(0, key.lastIndexOf("."));
                    scenarioContext.setContext(entityName, saved);
                }
            }

            // Fallback: ALWAYS set "Curriculum" context for backward compatibility
            // if test uses simple "Curriculum" reference without >JavaCourse.id
            scenarioContext.setContext("Curriculum", saved);
            actualData.put("Curriculum.id", saved.getId()); // fallback

            // Populate other fields for variable resolution if needed
            actualData.put("title", saved.getTitle());
            actualData.put("price", saved.getPrice());
            actualData.put("isPublished", saved.getIsPublished());

            resolver.extractAndStoreVariables(dataRowValues, contextKeyMap, actualData);
        }
    }
}
