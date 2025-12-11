package tw.waterballsa.api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChapterDto {
    private Integer id;
    private Integer curriculumId;
    private String title;
    private String description;
    private Integer orderIndex;
    private LocalDateTime createdAt;
    private List<LessonDto> lessons;
}
