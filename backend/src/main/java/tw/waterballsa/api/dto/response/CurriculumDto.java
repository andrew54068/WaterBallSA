package tw.waterballsa.api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CurriculumDto {
    private Integer id;
    private String title;
    private String description;
    private String thumbnailUrl;
    private String instructorName;
    private BigDecimal price;
    private String currency;
    private String difficultyLevel;
    private Integer estimatedDurationHours;
    private Boolean isPublished;
    private LocalDateTime publishedAt;
    private LocalDateTime createdAt;
    private List<ChapterDto> chapters;
}
