package com.waterballsa.backend.controller;

import com.waterballsa.backend.dto.AuthRequest;
import com.waterballsa.backend.dto.AuthResponse;
import com.waterballsa.backend.dto.RefreshTokenRequest;
import com.waterballsa.backend.dto.UserDto;
import com.waterballsa.backend.service.AuthenticationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for authentication endpoints.
 *
 * Handles:
 * - Google OAuth login
 * - JWT token refresh
 * - Current user retrieval
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Authentication", description = "Authentication and authorization endpoints")
public class AuthController {

    private final AuthenticationService authenticationService;

    @PostMapping("/google")
    @Operation(summary = "Authenticate with Google OAuth",
               description = "Exchange Google ID token for JWT access and refresh tokens")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully authenticated"),
            @ApiResponse(responseCode = "401", description = "Invalid Google ID token"),
            @ApiResponse(responseCode = "400", description = "Invalid request")
    })
    public ResponseEntity<AuthResponse> authenticateWithGoogle(@Valid @RequestBody AuthRequest request) {
        log.info("Google authentication request received");
        AuthResponse response = authenticationService.authenticateWithGoogle(request.getGoogleIdToken());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token",
               description = "Get a new access token using a valid refresh token")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Token refreshed successfully"),
            @ApiResponse(responseCode = "401", description = "Invalid or expired refresh token")
    })
    public ResponseEntity<AuthResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        log.info("Token refresh request received");
        AuthResponse response = authenticationService.refreshAccessToken(request.getRefreshToken());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user",
               description = "Retrieve information about the currently authenticated user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User information retrieved"),
            @ApiResponse(responseCode = "401", description = "Not authenticated")
    })
    public ResponseEntity<UserDto> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        log.info("Get current user request received");

        // Extract token from "Bearer <token>" format
        String token = authHeader.substring(7);
        UserDto user = authenticationService.getCurrentUser(token);

        return ResponseEntity.ok(user);
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout",
               description = "Logout the current user (client should discard tokens)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Logged out successfully")
    })
    public ResponseEntity<Void> logout() {
        log.info("Logout request received");
        // In a stateless JWT setup, logout is handled on the client side by discarding tokens
        // For enhanced security, you could implement a token blacklist using Redis
        return ResponseEntity.ok().build();
    }
}
