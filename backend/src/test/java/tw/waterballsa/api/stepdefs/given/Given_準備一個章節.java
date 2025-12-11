package tw.waterballsa.api.stepdefs.given;

import io.cucumber.datatable.DataTable;
import io.cucumber.java.en.Given;
import org.springframework.beans.factory.annotation.Autowired;
import tw.waterballsa.api.entity.Chapter;
import tw.waterballsa.api.entity.Curriculum;
import tw.waterballsa.api.repository.ChapterRepository;
import tw.waterballsa.api.repository.CurriculumRepository;
import tw.waterballsa.api.stepdefs.helper.ISAFeatureArgumentResolver;

import java.util.List;
import java.util.Map;

public class Given_準備一個章節 {

    @Autowired
    private ChapterRepository chapterRepository;

    @Autowired
    private CurriculumRepository curriculumRepository;

    @Autowired
    private ISAFeatureArgumentResolver resolver;

    @Given("準備一個章節, with table:")
    public void prepareChapter(DataTable dataTable) {
        List<Map<String, String>> rows = dataTable.asMaps(String.class, String.class);
        List<String> headers = dataTable.row(0);

        for (Map<String, String> row : rows) {
            Chapter.ChapterBuilder builder = Chapter.builder();

            // Resolve curriculum
            if (row.containsKey("curriculumId")) {
                Object resolved = resolver.resolveVariable(row.get("curriculumId"));
                Long curriculumId = resolver.convertValue(resolved.toString(), Long.class);
                Curriculum curriculum = curriculumRepository.findById(curriculumId)
                        .orElseThrow(() -> new RuntimeException("Curriculum not found: " + curriculumId));
                builder.curriculum(curriculum);
            }

            if (row.containsKey("title")) {
                Object resolved = resolver.resolveVariable(row.get("title"));
                builder.title(resolved != null ? resolved.toString() : null);
            }

            if (row.containsKey("description")) {
                Object resolved = resolver.resolveVariable(row.get("description"));
                builder.description(resolved != null ? resolved.toString() : null);
            }

            if (row.containsKey("orderIndex")) {
                Object resolved = resolver.resolveVariable(row.get("orderIndex"));
                builder.orderIndex(resolver.convertValue(resolved.toString(), Integer.class));
            } else {
                // Auto-increment order index if not specified
                builder.orderIndex(0);
            }

            // Save entity
            Chapter chapter = chapterRepository.save(builder.build());

            // Extract and store variables
            List<String> dataRow = dataTable.row(rows.indexOf(row) + 1);
            for (int i = 0; i < headers.size(); i++) {
                String header = headers.get(i);
                if (header.startsWith(">")) {
                    String varName = header.substring(1).trim();
                    if (varName.contains(".id") || varName.equals("id")) {
                        resolver.storeVariable(varName, chapter.getId());
                    }
                } else if (header.startsWith("<")) {
                    String varName = header.substring(1).trim();
                    resolver.storeVariable(varName, chapter.getId());
                }
            }
        }
    }
}
