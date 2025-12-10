package tw.waterballsa.api.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "lessons")
public class Lesson {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long chapterId;
    private String title;
    private String description;

    @Enumerated(EnumType.STRING)
    private LessonType lessonType;

    private String contentUrl;
    @Column(columnDefinition = "jsonb")
    private String contentMetadata;

    private Integer orderIndex;
    private Boolean isFreePreview;
    private Integer durationMinutes; // Minutes

    @Column(name = "created_at", insertable = false, updatable = false)
    private java.time.LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private java.time.LocalDateTime updatedAt;

    public enum LessonType {
        VIDEO, ARTICLE
    }
}
