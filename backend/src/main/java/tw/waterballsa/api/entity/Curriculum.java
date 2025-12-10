package tw.waterballsa.api.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.OneToMany;
import jakarta.persistence.FetchType;
import jakarta.persistence.OrderBy;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Enumerated;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "curriculums")
public class Curriculum {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;
    private String instructorName;
    private String description;
    private String thumbnailUrl;
    private Double price;
    private String currency; // 'TWD'
    @Enumerated(jakarta.persistence.EnumType.STRING)
    private DifficultyLevel difficultyLevel; // Enum? Or String?
    private Integer estimatedDurationHours;
    private Boolean isPublished;
    private java.time.LocalDateTime publishedAt;

    @jakarta.persistence.Column(name = "created_at", insertable = false, updatable = false)
    private java.time.LocalDateTime createdAt;

    @jakarta.persistence.Column(name = "updated_at", insertable = false, updatable = false)
    private java.time.LocalDateTime updatedAt;

    public enum DifficultyLevel {
        BEGINNER, INTERMEDIATE, ADVANCED
    }

    @OneToMany(mappedBy = "curriculum", fetch = FetchType.EAGER)
    @OrderBy("orderIndex ASC")
    private java.util.List<Chapter> chapters;
}
