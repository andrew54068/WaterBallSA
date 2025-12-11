package tw.waterballsa.api.stepdefs.given;

import io.cucumber.datatable.DataTable;
import io.cucumber.java.en.Given;
import org.springframework.beans.factory.annotation.Autowired;
import tw.waterballsa.api.entity.Lesson;
import tw.waterballsa.api.entity.User;
import tw.waterballsa.api.entity.VideoProgress;
import tw.waterballsa.api.repository.LessonRepository;
import tw.waterballsa.api.repository.UserRepository;
import tw.waterballsa.api.repository.VideoProgressRepository;
import tw.waterballsa.api.stepdefs.helper.ISAFeatureArgumentResolver;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class Given_準備一個VideoProgress {

    @Autowired
    private VideoProgressRepository videoProgressRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LessonRepository lessonRepository;

    @Autowired
    private ISAFeatureArgumentResolver resolver;

    @Given("準備一個VideoProgress, with table:")
    public void prepareVideoProgress(DataTable dataTable) {
        List<Map<String, String>> rows = dataTable.asMaps(String.class, String.class);
        List<String> headers = dataTable.row(0);

        for (Map<String, String> row : rows) {
            VideoProgress.VideoProgressBuilder builder = VideoProgress.builder();

            // Resolve user
            if (row.containsKey("userId")) {
                Object resolved = resolver.resolveVariable(row.get("userId"));
                Long userId = resolver.convertValue(resolved.toString(), Long.class);
                User user = userRepository.findById(userId)
                        .orElseThrow(() -> new RuntimeException("User not found: " + userId));
                builder.user(user);
            }

            // Resolve lesson
            if (row.containsKey("lessonId")) {
                Object resolved = resolver.resolveVariable(row.get("lessonId"));
                Long lessonId = resolver.convertValue(resolved.toString(), Long.class);
                Lesson lesson = lessonRepository.findById(lessonId)
                        .orElseThrow(() -> new RuntimeException("Lesson not found: " + lessonId));
                builder.lesson(lesson);
            }

            if (row.containsKey("currentTimeSeconds")) {
                Object resolved = resolver.resolveVariable(row.get("currentTimeSeconds"));
                builder.currentTimeSeconds(resolver.convertValue(resolved.toString(), BigDecimal.class));
            }

            if (row.containsKey("durationSeconds")) {
                Object resolved = resolver.resolveVariable(row.get("durationSeconds"));
                builder.durationSeconds(resolver.convertValue(resolved.toString(), BigDecimal.class));
            }

            if (row.containsKey("completionPercentage")) {
                Object resolved = resolver.resolveVariable(row.get("completionPercentage"));
                builder.completionPercentage(resolver.convertValue(resolved.toString(), BigDecimal.class));
            }

            if (row.containsKey("isCompleted")) {
                Object resolved = resolver.resolveVariable(row.get("isCompleted"));
                builder.isCompleted(resolver.convertValue(resolved.toString(), Boolean.class));
            }

            if (row.containsKey("completedAt")) {
                Object resolved = resolver.resolveVariable(row.get("completedAt"));
                if (resolved != null) {
                    builder.completedAt(resolver.convertValue(resolved.toString(), LocalDateTime.class));
                }
            }

            // If durationSeconds is not provided, default to 600 seconds (10 minutes)
            VideoProgress progress = builder.build();
            if (progress.getDurationSeconds() == null) {
                progress.setDurationSeconds(new BigDecimal("600.0"));
            }

            // Save entity
            VideoProgress videoProgress = videoProgressRepository.save(progress);

            // Extract and store variables
            List<String> dataRow = dataTable.row(rows.indexOf(row) + 1);
            for (int i = 0; i < headers.size(); i++) {
                String header = headers.get(i);
                if (header.startsWith(">")) {
                    String varName = header.substring(1).trim();
                    if (varName.contains(".id") || varName.equals("id")) {
                        resolver.storeVariable(varName, videoProgress.getId());
                    }
                } else if (header.startsWith("<")) {
                    String varName = header.substring(1).trim();
                    resolver.storeVariable(varName, videoProgress.getId());
                }
            }
        }
    }
}
