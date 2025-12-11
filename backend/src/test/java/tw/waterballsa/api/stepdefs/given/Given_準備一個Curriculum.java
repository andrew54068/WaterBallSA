package tw.waterballsa.api.stepdefs.given;

import io.cucumber.datatable.DataTable;
import io.cucumber.java.en.Given;
import org.springframework.beans.factory.annotation.Autowired;
import tw.waterballsa.api.entity.Curriculum;
import tw.waterballsa.api.repository.CurriculumRepository;
import tw.waterballsa.api.stepdefs.helper.ISAFeatureArgumentResolver;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class Given_準備一個Curriculum {

    @Autowired
    private CurriculumRepository curriculumRepository;

    @Autowired
    private ISAFeatureArgumentResolver resolver;

    @Given("準備一個Curriculum, with table:")
    public void prepareCurriculum(DataTable dataTable) {
        List<Map<String, String>> rows = dataTable.asMaps(String.class, String.class);
        List<String> headers = dataTable.row(0);

        for (Map<String, String> row : rows) {
            Curriculum.CurriculumBuilder builder = Curriculum.builder();

            // Parse all fields
            if (row.containsKey("title")) {
                Object resolved = resolver.resolveVariable(row.get("title"));
                builder.title(resolved != null ? resolved.toString() : null);
            }

            if (row.containsKey("description")) {
                Object resolved = resolver.resolveVariable(row.get("description"));
                builder.description(resolved != null ? resolved.toString() : null);
            } else {
                // Default description if not provided
                builder.description("Default description");
            }

            if (row.containsKey("thumbnailUrl")) {
                Object resolved = resolver.resolveVariable(row.get("thumbnailUrl"));
                builder.thumbnailUrl(resolved != null ? resolved.toString() : null);
            }

            if (row.containsKey("instructorName")) {
                Object resolved = resolver.resolveVariable(row.get("instructorName"));
                builder.instructorName(resolved != null ? resolved.toString() : null);
            } else {
                builder.instructorName("Default Instructor");
            }

            if (row.containsKey("price")) {
                Object resolved = resolver.resolveVariable(row.get("price"));
                builder.price(resolver.convertValue(resolved.toString(), BigDecimal.class));
            } else {
                // Default price to 0 if not provided
                builder.price(BigDecimal.ZERO);
            }

            if (row.containsKey("currency")) {
                Object resolved = resolver.resolveVariable(row.get("currency"));
                builder.currency(resolved != null ? resolved.toString() : "TWD");
            }

            if (row.containsKey("difficultyLevel")) {
                Object resolved = resolver.resolveVariable(row.get("difficultyLevel"));
                if (resolved != null) {
                    builder.difficultyLevel(Curriculum.DifficultyLevel.valueOf(resolved.toString()));
                }
            } else {
                // Default difficulty level
                builder.difficultyLevel(Curriculum.DifficultyLevel.BEGINNER);
            }

            if (row.containsKey("estimatedDurationHours")) {
                Object resolved = resolver.resolveVariable(row.get("estimatedDurationHours"));
                builder.estimatedDurationHours(resolver.convertValue(resolved.toString(), Integer.class));
            } else {
                builder.estimatedDurationHours(10);
            }

            if (row.containsKey("isPublished")) {
                Object resolved = resolver.resolveVariable(row.get("isPublished"));
                builder.isPublished(resolver.convertValue(resolved.toString(), Boolean.class));
            }

            if (row.containsKey("publishedAt")) {
                Object resolved = resolver.resolveVariable(row.get("publishedAt"));
                if (resolved != null) {
                    builder.publishedAt(resolver.convertValue(resolved.toString(), LocalDateTime.class));
                }
            } else if (row.containsKey("isPublished") && Boolean.parseBoolean(row.get("isPublished"))) {
                builder.publishedAt(LocalDateTime.now());
            }

            // Save entity
            Curriculum curriculum = curriculumRepository.save(builder.build());

            // Extract and store variables
            List<String> dataRow = dataTable.row(rows.indexOf(row) + 1);
            for (int i = 0; i < headers.size(); i++) {
                String header = headers.get(i);
                if (header.startsWith(">")) {
                    String varName = header.substring(1).trim();
                    if (varName.contains(".id") || varName.equals("id")) {
                        resolver.storeVariable(varName, curriculum.getId());
                    }
                } else if (header.startsWith("<")) {
                    String varName = header.substring(1).trim();
                    resolver.storeVariable(varName, curriculum.getId());
                }
            }
        }
    }
}
