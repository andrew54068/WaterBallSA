package tw.waterballsa.api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderPreviewResponse {
    private CurriculumInfo curriculum;
    private List<ChapterInfo> chapters;
    private BigDecimal originalPrice;
    private Integer totalChapters;
    private Integer totalLessons;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CurriculumInfo {
        private Integer id;
        private String title;
        private BigDecimal price;
        private String currency;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChapterInfo {
        private Integer id;
        private String title;
        private List<LessonInfo> lessons;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LessonInfo {
        private Integer id;
        private String title;
        private String lessonType;
        private Boolean isFreePreview;
    }
}
