package tw.waterballsa.api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LessonDto {
    private Integer id;
    private Integer chapterId;
    private String title;
    private String description;
    private String lessonType;
    private String contentUrl;
    private Map<String, Object> contentMetadata;
    private Integer orderIndex;
    private Integer durationMinutes;
    private Boolean isFreePreview;
    private Boolean isCompleted;
    private LocalDateTime createdAt;
}
