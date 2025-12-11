package tw.waterballsa.api.stepdefs.given;

import io.cucumber.datatable.DataTable;
import io.cucumber.java.en.Given;
import org.springframework.beans.factory.annotation.Autowired;
import tw.waterballsa.api.entity.Chapter;
import tw.waterballsa.api.entity.Lesson;
import tw.waterballsa.api.repository.ChapterRepository;
import tw.waterballsa.api.repository.LessonRepository;
import tw.waterballsa.api.stepdefs.helper.ISAFeatureArgumentResolver;

import java.util.List;
import java.util.Map;

public class Given_準備一個Lesson {

    @Autowired
    private LessonRepository lessonRepository;

    @Autowired
    private ChapterRepository chapterRepository;

    @Autowired
    private ISAFeatureArgumentResolver resolver;

    @Given("準備一個Lesson, with table:")
    public void prepareLesson(DataTable dataTable) {
        List<Map<String, String>> rows = dataTable.asMaps(String.class, String.class);
        List<String> headers = dataTable.row(0);

        for (Map<String, String> row : rows) {
            Lesson.LessonBuilder builder = Lesson.builder();

            // Resolve chapter
            if (row.containsKey("chapterId")) {
                Object resolved = resolver.resolveVariable(row.get("chapterId"));
                Long chapterId = resolver.convertValue(resolved.toString(), Long.class);
                Chapter chapter = chapterRepository.findById(chapterId)
                        .orElseThrow(() -> new RuntimeException("Chapter not found: " + chapterId));
                builder.chapter(chapter);
            }

            if (row.containsKey("title")) {
                Object resolved = resolver.resolveVariable(row.get("title"));
                builder.title(resolved != null ? resolved.toString() : null);
            }

            if (row.containsKey("description")) {
                Object resolved = resolver.resolveVariable(row.get("description"));
                builder.description(resolved != null ? resolved.toString() : null);
            }

            if (row.containsKey("lessonType")) {
                Object resolved = resolver.resolveVariable(row.get("lessonType"));
                if (resolved != null) {
                    builder.lessonType(Lesson.LessonType.valueOf(resolved.toString()));
                }
            }

            if (row.containsKey("contentUrl")) {
                Object resolved = resolver.resolveVariable(row.get("contentUrl"));
                builder.contentUrl(resolved != null ? resolved.toString() : null);
            }

            if (row.containsKey("orderIndex")) {
                Object resolved = resolver.resolveVariable(row.get("orderIndex"));
                builder.orderIndex(resolver.convertValue(resolved.toString(), Integer.class));
            } else {
                // Auto-increment order index if not specified
                builder.orderIndex(0);
            }

            if (row.containsKey("durationMinutes")) {
                Object resolved = resolver.resolveVariable(row.get("durationMinutes"));
                if (resolved != null && !resolved.toString().isEmpty()) {
                    builder.durationMinutes(resolver.convertValue(resolved.toString(), Integer.class));
                }
            }

            if (row.containsKey("isFreePreview")) {
                Object resolved = resolver.resolveVariable(row.get("isFreePreview"));
                builder.isFreePreview(resolver.convertValue(resolved.toString(), Boolean.class));
            }

            // Save entity
            Lesson lesson = lessonRepository.save(builder.build());

            // Extract and store variables
            List<String> dataRow = dataTable.row(rows.indexOf(row) + 1);
            for (int i = 0; i < headers.size(); i++) {
                String header = headers.get(i);
                if (header.startsWith(">")) {
                    String varName = header.substring(1).trim();
                    if (varName.contains(".id") || varName.equals("id")) {
                        resolver.storeVariable(varName, lesson.getId());
                    }
                } else if (header.startsWith("<")) {
                    String varName = header.substring(1).trim();
                    resolver.storeVariable(varName, lesson.getId());
                }
            }
        }
    }
}
