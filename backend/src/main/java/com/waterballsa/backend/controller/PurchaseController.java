package com.waterballsa.backend.controller;

import com.waterballsa.backend.dto.OwnershipCheckResponse;
import com.waterballsa.backend.dto.PurchaseRequest;
import com.waterballsa.backend.dto.PurchaseResponse;
import com.waterballsa.backend.service.PurchaseService;
import com.waterballsa.backend.util.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for purchase endpoints.
 *
 * Handles:
 * - Creating purchases (simplified mock payment in Phase 2)
 * - Checking curriculum ownership
 * - Retrieving purchase history
 */
@RestController
@RequestMapping("/api/purchases")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Purchases", description = "Purchase and ownership management endpoints")
public class PurchaseController {

    private final PurchaseService purchaseService;
    private final JwtUtil jwtUtil;

    @PostMapping
    @Operation(summary = "Create a purchase",
               description = "Purchase a curriculum (simplified mock payment in Phase 2)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Purchase created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request"),
            @ApiResponse(responseCode = "401", description = "Not authenticated"),
            @ApiResponse(responseCode = "404", description = "Curriculum not found"),
            @ApiResponse(responseCode = "409", description = "User already owns this curriculum")
    })
    public ResponseEntity<PurchaseResponse> createPurchase(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody PurchaseRequest request
    ) {
        log.info("POST /api/purchases - curriculum: {}", request.getCurriculumId());

        // Extract user ID from JWT token
        String token = authHeader.substring(7); // Remove "Bearer " prefix
        Long userId = jwtUtil.extractUserId(token);

        PurchaseResponse response = purchaseService.createPurchase(userId, request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/my-purchases")
    @Operation(summary = "Get user's purchases",
               description = "Retrieve all purchases for the authenticated user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Purchases retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Not authenticated")
    })
    public ResponseEntity<Page<PurchaseResponse>> getMyPurchases(
            @RequestHeader("Authorization") String authHeader,
            @Parameter(description = "Page number (0-indexed)")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size")
            @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field")
            @RequestParam(defaultValue = "purchasedAt") String sortBy,
            @Parameter(description = "Sort direction (asc/desc)")
            @RequestParam(defaultValue = "desc") String direction
    ) {
        log.info("GET /api/purchases/my-purchases - page: {}, size: {}", page, size);

        // Extract user ID from JWT token
        String token = authHeader.substring(7);
        Long userId = jwtUtil.extractUserId(token);

        Sort.Direction sortDirection = direction.equalsIgnoreCase("asc") ?
                Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));

        Page<PurchaseResponse> purchases = purchaseService.getUserPurchases(userId, pageable);

        return ResponseEntity.ok(purchases);
    }

    @GetMapping("/check-ownership/{curriculumId}")
    @Operation(summary = "Check curriculum ownership",
               description = "Check if the authenticated user owns a specific curriculum")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Ownership check completed"),
            @ApiResponse(responseCode = "401", description = "Not authenticated"),
            @ApiResponse(responseCode = "404", description = "Curriculum not found")
    })
    public ResponseEntity<OwnershipCheckResponse> checkOwnership(
            @RequestHeader("Authorization") String authHeader,
            @Parameter(description = "Curriculum ID")
            @PathVariable Long curriculumId
    ) {
        log.info("GET /api/purchases/check-ownership/{}", curriculumId);

        // Extract user ID from JWT token
        String token = authHeader.substring(7);
        Long userId = jwtUtil.extractUserId(token);

        OwnershipCheckResponse response = purchaseService.checkOwnership(userId, curriculumId);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get purchase by ID",
               description = "Retrieve a specific purchase (must belong to authenticated user)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Purchase found"),
            @ApiResponse(responseCode = "401", description = "Not authenticated"),
            @ApiResponse(responseCode = "403", description = "Purchase does not belong to user"),
            @ApiResponse(responseCode = "404", description = "Purchase not found")
    })
    public ResponseEntity<PurchaseResponse> getPurchaseById(
            @RequestHeader("Authorization") String authHeader,
            @Parameter(description = "Purchase ID")
            @PathVariable Long id
    ) {
        log.info("GET /api/purchases/{}", id);

        // Extract user ID from JWT token
        String token = authHeader.substring(7);
        Long userId = jwtUtil.extractUserId(token);

        PurchaseResponse response = purchaseService.getPurchaseById(id, userId);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/completed")
    @Operation(summary = "Get completed purchases",
               description = "Retrieve only completed purchases for the authenticated user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Completed purchases retrieved"),
            @ApiResponse(responseCode = "401", description = "Not authenticated")
    })
    public ResponseEntity<Page<PurchaseResponse>> getCompletedPurchases(
            @RequestHeader("Authorization") String authHeader,
            @Parameter(description = "Page number (0-indexed)")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size")
            @RequestParam(defaultValue = "10") int size
    ) {
        log.info("GET /api/purchases/completed - page: {}, size: {}", page, size);

        // Extract user ID from JWT token
        String token = authHeader.substring(7);
        Long userId = jwtUtil.extractUserId(token);

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "purchasedAt"));

        Page<PurchaseResponse> purchases = purchaseService.getCompletedPurchases(userId, pageable);

        return ResponseEntity.ok(purchases);
    }
}
