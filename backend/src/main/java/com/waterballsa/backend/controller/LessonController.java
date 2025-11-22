package com.waterballsa.backend.controller;

import com.waterballsa.backend.dto.LessonDto;
import com.waterballsa.backend.entity.LessonType;
import com.waterballsa.backend.service.LessonService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for lesson endpoints.
 *
 * Provides public access to browse and view lessons.
 */
@RestController
@RequestMapping("/api/lessons")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Lessons", description = "Lesson management endpoints")
public class LessonController {

    private final LessonService lessonService;

    @GetMapping("/{id}")
    @Operation(summary = "Get lesson by ID",
               description = "Retrieve a specific lesson")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lesson found"),
            @ApiResponse(responseCode = "404", description = "Lesson not found")
    })
    public ResponseEntity<LessonDto> getLessonById(
            @Parameter(description = "Lesson ID")
            @PathVariable Long id
    ) {
        log.info("GET /api/lessons/{}", id);
        LessonDto lesson = lessonService.getLessonById(id);
        return ResponseEntity.ok(lesson);
    }

    @GetMapping("/chapter/{chapterId}")
    @Operation(summary = "Get lessons by chapter",
               description = "Retrieve all published lessons for a chapter")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved lessons")
    })
    public ResponseEntity<List<LessonDto>> getLessonsByChapter(
            @Parameter(description = "Chapter ID")
            @PathVariable Long chapterId
    ) {
        log.info("GET /api/lessons/chapter/{}", chapterId);
        List<LessonDto> lessons = lessonService.getLessonsByChapter(chapterId);
        return ResponseEntity.ok(lessons);
    }

    @GetMapping("/curriculum/{curriculumId}/free-preview")
    @Operation(summary = "Get free preview lessons",
               description = "Retrieve all free preview lessons for a curriculum")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved free preview lessons")
    })
    public ResponseEntity<List<LessonDto>> getFreePreviewLessons(
            @Parameter(description = "Curriculum ID")
            @PathVariable Long curriculumId
    ) {
        log.info("GET /api/lessons/curriculum/{}/free-preview", curriculumId);
        List<LessonDto> lessons = lessonService.getFreePreviewLessons(curriculumId);
        return ResponseEntity.ok(lessons);
    }

    @GetMapping("/curriculum/{curriculumId}/videos")
    @Operation(summary = "Get video lessons",
               description = "Retrieve all video lessons for a curriculum")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved video lessons")
    })
    public ResponseEntity<List<LessonDto>> getVideoLessons(
            @Parameter(description = "Curriculum ID")
            @PathVariable Long curriculumId
    ) {
        log.info("GET /api/lessons/curriculum/{}/videos", curriculumId);
        List<LessonDto> lessons = lessonService.getVideoLessons(curriculumId);
        return ResponseEntity.ok(lessons);
    }

    @GetMapping("/type/{type}")
    @Operation(summary = "Get lessons by type",
               description = "Retrieve lessons filtered by type (VIDEO, ARTICLE, SURVEY)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved lessons"),
            @ApiResponse(responseCode = "400", description = "Invalid lesson type")
    })
    public ResponseEntity<Page<LessonDto>> getLessonsByType(
            @Parameter(description = "Lesson type")
            @PathVariable LessonType type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        log.info("GET /api/lessons/type/{}", type);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "orderIndex"));
        Page<LessonDto> lessons = lessonService.getLessonsByType(type, pageable);
        return ResponseEntity.ok(lessons);
    }

    @GetMapping("/curriculum/{curriculumId}/duration")
    @Operation(summary = "Get total duration",
               description = "Calculate total duration of all lessons in a curriculum")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Duration calculated successfully")
    })
    public ResponseEntity<Long> getTotalDuration(
            @Parameter(description = "Curriculum ID")
            @PathVariable Long curriculumId
    ) {
        log.info("GET /api/lessons/curriculum/{}/duration", curriculumId);
        Long duration = lessonService.calculateTotalDuration(curriculumId);
        return ResponseEntity.ok(duration);
    }

    @GetMapping("/chapter/{chapterId}/count")
    @Operation(summary = "Count lessons",
               description = "Get total count of published lessons in a chapter")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Count retrieved successfully")
    })
    public ResponseEntity<Long> countLessons(
            @Parameter(description = "Chapter ID")
            @PathVariable Long chapterId
    ) {
        log.info("GET /api/lessons/chapter/{}/count", chapterId);
        long count = lessonService.countLessonsByChapter(chapterId);
        return ResponseEntity.ok(count);
    }
}
