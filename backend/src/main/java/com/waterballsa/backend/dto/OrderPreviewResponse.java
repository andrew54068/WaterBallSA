package com.waterballsa.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO for order preview (curriculum details before purchase).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderPreviewResponse {

    private CurriculumDto curriculum;
    private List<ChapterDto> chapters;
    private BigDecimal originalPrice;
    private Integer totalChapters;
    private Integer totalLessons;
}
