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

    @Enumerated(EnumType.STRING)
    private LessonType lessonType;

    private Integer orderIndex;
    private Boolean isFreePreview;
    private Integer duration; // Minutes

    public enum LessonType {
        VIDEO, ARTICLE
    }
}
