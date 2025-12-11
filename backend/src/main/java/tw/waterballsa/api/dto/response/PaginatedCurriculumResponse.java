package tw.waterballsa.api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaginatedCurriculumResponse {
    private List<CurriculumDto> content;
    private Integer totalPages;
    private Long totalElements;
    private Integer size;
    private Integer number;
}
