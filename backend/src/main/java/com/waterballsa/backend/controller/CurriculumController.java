package com.waterballsa.backend.controller;

import com.waterballsa.backend.dto.CurriculumDto;
import com.waterballsa.backend.entity.DifficultyLevel;
import com.waterballsa.backend.service.CurriculumService;
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

/**
 * REST controller for curriculum endpoints.
 *
 * Provides public access to browse and view curriculums.
 */
@RestController
@RequestMapping("/api/curriculums")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Curriculums", description = "Curriculum management endpoints")
public class CurriculumController {

    private final CurriculumService curriculumService;

    @GetMapping
    @Operation(summary = "Get all curriculums",
               description = "Retrieve all published curriculums with pagination")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved curriculums")
    })
    public ResponseEntity<Page<CurriculumDto>> getAllCurriculums(
            @Parameter(description = "Page number (0-indexed)")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size")
            @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field")
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Sort direction (asc/desc)")
            @RequestParam(defaultValue = "desc") String direction
    ) {
        log.info("GET /api/curriculums - page: {}, size: {}", page, size);

        Sort.Direction sortDirection = direction.equalsIgnoreCase("asc") ?
                Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));

        Page<CurriculumDto> curriculums = curriculumService.getAllPublishedCurriculums(pageable);
        return ResponseEntity.ok(curriculums);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get curriculum by ID",
               description = "Retrieve a specific curriculum with its chapters")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Curriculum found"),
            @ApiResponse(responseCode = "404", description = "Curriculum not found")
    })
    public ResponseEntity<CurriculumDto> getCurriculumById(
            @Parameter(description = "Curriculum ID")
            @PathVariable Long id
    ) {
        log.info("GET /api/curriculums/{}", id);
        CurriculumDto curriculum = curriculumService.getCurriculumById(id);
        return ResponseEntity.ok(curriculum);
    }

    @GetMapping("/search")
    @Operation(summary = "Search curriculums",
               description = "Search curriculums by title or description")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Search completed successfully")
    })
    public ResponseEntity<Page<CurriculumDto>> searchCurriculums(
            @Parameter(description = "Search term")
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        log.info("GET /api/curriculums/search?q={}", q);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<CurriculumDto> curriculums = curriculumService.searchCurriculums(q, pageable);
        return ResponseEntity.ok(curriculums);
    }

    @GetMapping("/difficulty/{level}")
    @Operation(summary = "Filter by difficulty",
               description = "Get curriculums filtered by difficulty level")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved curriculums"),
            @ApiResponse(responseCode = "400", description = "Invalid difficulty level")
    })
    public ResponseEntity<Page<CurriculumDto>> getCurriculumsByDifficulty(
            @Parameter(description = "Difficulty level (BEGINNER, INTERMEDIATE, ADVANCED, EXPERT)")
            @PathVariable DifficultyLevel level,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        log.info("GET /api/curriculums/difficulty/{}", level);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<CurriculumDto> curriculums = curriculumService.getCurriculumsByDifficulty(level, pageable);
        return ResponseEntity.ok(curriculums);
    }

    @GetMapping("/instructor/{name}")
    @Operation(summary = "Filter by instructor",
               description = "Get curriculums by instructor name")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved curriculums")
    })
    public ResponseEntity<Page<CurriculumDto>> getCurriculumsByInstructor(
            @Parameter(description = "Instructor name")
            @PathVariable String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        log.info("GET /api/curriculums/instructor/{}", name);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<CurriculumDto> curriculums = curriculumService.getCurriculumsByInstructor(name, pageable);
        return ResponseEntity.ok(curriculums);
    }

    @GetMapping("/free")
    @Operation(summary = "Get free curriculums",
               description = "Retrieve all free curriculums (price = 0)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved free curriculums")
    })
    public ResponseEntity<Page<CurriculumDto>> getFreeCurriculums(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        log.info("GET /api/curriculums/free");
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<CurriculumDto> curriculums = curriculumService.getFreeCurriculums(pageable);
        return ResponseEntity.ok(curriculums);
    }

    @GetMapping("/count")
    @Operation(summary = "Count curriculums",
               description = "Get total count of published curriculums")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Count retrieved successfully")
    })
    public ResponseEntity<Long> countCurriculums() {
        log.info("GET /api/curriculums/count");
        long count = curriculumService.countPublishedCurriculums();
        return ResponseEntity.ok(count);
    }
}
