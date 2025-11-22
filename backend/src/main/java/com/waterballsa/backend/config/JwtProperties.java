package com.waterballsa.backend.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration properties for JWT token management.
 */
@Configuration
@ConfigurationProperties(prefix = "jwt")
@Data
public class JwtProperties {

    /**
     * Secret key for signing JWT tokens (minimum 256 bits).
     */
    private String secret;

    /**
     * Access token expiration time in milliseconds (default: 15 minutes).
     */
    private Long accessTokenExpiration = 900000L;

    /**
     * Refresh token expiration time in milliseconds (default: 7 days).
     */
    private Long refreshTokenExpiration = 604800000L;
}
