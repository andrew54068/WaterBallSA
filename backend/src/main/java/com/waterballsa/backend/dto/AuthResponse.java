package com.waterballsa.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for authentication response containing JWT tokens and user information.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {

    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private Long expiresIn;
    private UserDto user;

    /**
     * Creates an AuthResponse with Bearer token type.
     *
     * @param accessToken the JWT access token
     * @param refreshToken the JWT refresh token
     * @param expiresIn expiration time in milliseconds
     * @param user the user information
     * @return AuthResponse instance
     */
    public static AuthResponse of(String accessToken, String refreshToken, Long expiresIn, UserDto user) {
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(expiresIn)
                .user(user)
                .build();
    }
}
