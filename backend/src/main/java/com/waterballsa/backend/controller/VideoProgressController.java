package com.waterballsa.backend.controller;

import com.waterballsa.backend.dto.SaveProgressRequest;
import com.waterballsa.backend.dto.VideoProgressDto;
import com.waterballsa.backend.service.VideoProgressService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lessons")
@RequiredArgsConstructor
@Tag(name = "Video Progress", description = "Video playback progress tracking API")
public class VideoProgressController {

    private final VideoProgressService videoProgressService;

    @PostMapping("/{lessonId}/progress")
    @Operation(summary = "Save video progress", description = "Save or update user's video playback progress for a lesson")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Progress saved successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request data"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - JWT token required"),
            @ApiResponse(responseCode = "404", description = "Lesson not found")
    })
    public ResponseEntity<VideoProgressDto> saveProgress(
            @Parameter(description = "Lesson ID") @PathVariable Long lessonId,
            @Valid @RequestBody SaveProgressRequest request,
            Authentication authentication) {

        Long userId = (Long) authentication.getPrincipal();

        VideoProgressDto progress = videoProgressService.saveProgress(userId, lessonId, request);
        return ResponseEntity.ok(progress);
    }

    @GetMapping("/{lessonId}/progress")
    @Operation(summary = "Get video progress", description = "Retrieve user's video playback progress for a lesson")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Progress retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - JWT token required"),
            @ApiResponse(responseCode = "404", description = "Progress not found")
    })
    public ResponseEntity<VideoProgressDto> getProgress(
            @Parameter(description = "Lesson ID") @PathVariable Long lessonId,
            Authentication authentication) {

        Long userId = (Long) authentication.getPrincipal();

        VideoProgressDto progress = videoProgressService.getProgress(userId, lessonId);

        if (progress == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(progress);
    }

    @GetMapping("/chapters/{chapterId}/progress")
    @Operation(summary = "Get chapter progress", description = "Retrieve user's video progress for all lessons in a chapter")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Progress retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - JWT token required")
    })
    public ResponseEntity<List<VideoProgressDto>> getChapterProgress(
            @Parameter(description = "Chapter ID") @PathVariable Long chapterId,
            Authentication authentication) {

        Long userId = (Long) authentication.getPrincipal();

        List<VideoProgressDto> progressList = videoProgressService.getChapterProgress(userId, chapterId);
        return ResponseEntity.ok(progressList);
    }
}
