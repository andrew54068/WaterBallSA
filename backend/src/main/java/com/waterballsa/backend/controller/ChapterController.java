package com.waterballsa.backend.controller;

import com.waterballsa.backend.dto.ChapterDto;
import com.waterballsa.backend.service.ChapterService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for chapter endpoints.
 *
 * Provides public access to browse and view chapters.
 */
@RestController
@RequestMapping("/api/chapters")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Chapters", description = "Chapter management endpoints")
public class ChapterController {

    private final ChapterService chapterService;

    @GetMapping("/{id}")
    @Operation(summary = "Get chapter by ID",
               description = "Retrieve a specific chapter with its lessons")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Chapter found"),
            @ApiResponse(responseCode = "404", description = "Chapter not found")
    })
    public ResponseEntity<ChapterDto> getChapterById(
            @Parameter(description = "Chapter ID")
            @PathVariable Long id
    ) {
        log.info("GET /api/chapters/{}", id);
        ChapterDto chapter = chapterService.getChapterById(id);
        return ResponseEntity.ok(chapter);
    }

    @GetMapping("/curriculum/{curriculumId}")
    @Operation(summary = "Get chapters by curriculum",
               description = "Retrieve all published chapters for a curriculum")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved chapters")
    })
    public ResponseEntity<List<ChapterDto>> getChaptersByCurriculum(
            @Parameter(description = "Curriculum ID")
            @PathVariable Long curriculumId
    ) {
        log.info("GET /api/chapters/curriculum/{}", curriculumId);
        List<ChapterDto> chapters = chapterService.getChaptersByCurriculum(curriculumId);
        return ResponseEntity.ok(chapters);
    }

    @GetMapping("/curriculum/{curriculumId}/count")
    @Operation(summary = "Count chapters",
               description = "Get total count of published chapters in a curriculum")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Count retrieved successfully")
    })
    public ResponseEntity<Long> countChapters(
            @Parameter(description = "Curriculum ID")
            @PathVariable Long curriculumId
    ) {
        log.info("GET /api/chapters/curriculum/{}/count", curriculumId);
        long count = chapterService.countChaptersByCurriculum(curriculumId);
        return ResponseEntity.ok(count);
    }
}
