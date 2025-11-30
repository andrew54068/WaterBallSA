package com.waterballsa.backend.service;

import com.waterballsa.backend.config.JwtProperties;
import com.waterballsa.backend.dto.AuthResponse;
import com.waterballsa.backend.dto.UserDto;
import com.waterballsa.backend.entity.User;
import com.waterballsa.backend.exception.UnauthorizedException;
import com.waterballsa.backend.repository.UserRepository;
import com.waterballsa.backend.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Service for handling authentication operations.
 *
 * Provides methods for:
 * - Google OAuth login
 * - JWT token refresh
 * - User registration/login
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthenticationService {

    private final UserRepository userRepository;
    private final GoogleOAuthService googleOAuthService;
    private final JwtUtil jwtUtil;
    private final JwtProperties jwtProperties;

    /**
     * Authenticates a user with Google OAuth ID token.
     * Creates a new user if they don't exist, or updates existing user's last login.
     *
     * @param googleIdToken the Google ID token from frontend
     * @return AuthResponse with JWT tokens and user info
     * @throws UnauthorizedException if token verification fails
     */
    @Transactional
    public AuthResponse authenticateWithGoogle(String googleIdToken) {
        // Verify Google token and extract user info
        GoogleOAuthService.GoogleUserInfo googleUserInfo = googleOAuthService.verifyToken(googleIdToken);

        // Find or create user
        User user = userRepository.findByGoogleId(googleUserInfo.getGoogleId())
                .orElseGet(() -> createNewUser(googleUserInfo));

        // Update last login time
        user.updateLastLogin();
        user = userRepository.save(user);

        // Generate JWT tokens
        String accessToken = jwtUtil.generateAccessToken(user.getId(), user.getEmail());
        String refreshToken = jwtUtil.generateRefreshToken(user.getId(), user.getEmail());

        log.info("User authenticated successfully: {}", user.getEmail());

        return AuthResponse.of(
                accessToken,
                refreshToken,
                jwtProperties.getAccessTokenExpiration(),
                UserDto.from(user)
        );
    }

    /**
     * Refreshes access token using a valid refresh token.
     *
     * @param refreshToken the refresh token
     * @return AuthResponse with new access token
     * @throws UnauthorizedException if refresh token is invalid
     */
    @Transactional(readOnly = true)
    public AuthResponse refreshAccessToken(String refreshToken) {
        // Validate refresh token
        jwtUtil.validateRefreshToken(refreshToken);

        // Extract user info from token
        Long userId = jwtUtil.extractUserId(refreshToken);
        String email = jwtUtil.extractEmail(refreshToken);

        // Verify user still exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        // Generate new access token
        String newAccessToken = jwtUtil.generateAccessToken(user.getId(), user.getEmail());

        log.info("Access token refreshed for user: {}", user.getEmail());

        return AuthResponse.of(
                newAccessToken,
                refreshToken, // Keep same refresh token
                jwtProperties.getAccessTokenExpiration(),
                UserDto.from(user)
        );
    }

    /**
     * Gets current user information from JWT token.
     *
     * @param token the JWT access token
     * @return UserDto with user information
     * @throws UnauthorizedException if token is invalid or user not found
     */
    @Transactional(readOnly = true)
    public UserDto getCurrentUser(String token) {
        jwtUtil.validateToken(token);

        Long userId = jwtUtil.extractUserId(token);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        return UserDto.from(user);
    }

    /**
     * Creates a new user from Google OAuth information.
     *
     * @param googleUserInfo Google user information
     * @return created User entity
     */
    private User createNewUser(GoogleOAuthService.GoogleUserInfo googleUserInfo) {
        User user = User.builder()
                .googleId(googleUserInfo.getGoogleId())
                .email(googleUserInfo.getEmail())
                .name(googleUserInfo.getName())
                .profilePictureUrl(googleUserInfo.getPictureUrl())
                .totalExp(0)
                .currentLevel(1)
                .lastLoginAt(LocalDateTime.now())
                .build();

        user = userRepository.save(user);
        log.info("New user created: {}", user.getEmail());

        return user;
    }

    /**
     * Validates an access token.
     *
     * @param token the JWT access token
     * @return true if token is valid
     * @throws UnauthorizedException if token is invalid
     */
    public boolean validateToken(String token) {
        return jwtUtil.validateToken(token);
    }
}
