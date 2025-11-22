package com.waterballsa.backend.util;

import com.waterballsa.backend.config.JwtProperties;
import com.waterballsa.backend.exception.UnauthorizedException;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

/**
 * Utility class for JWT token generation and validation.
 *
 * Provides methods to:
 * - Generate access and refresh tokens
 * - Validate and parse tokens
 * - Extract claims from tokens
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class JwtUtil {

    private final JwtProperties jwtProperties;

    /**
     * Generates an access token for a user.
     *
     * @param userId the user ID
     * @param email the user email
     * @return JWT access token
     */
    public String generateAccessToken(Long userId, String email) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("email", email);
        claims.put("type", "access");

        return createToken(claims, email, jwtProperties.getAccessTokenExpiration());
    }

    /**
     * Generates a refresh token for a user.
     *
     * @param userId the user ID
     * @param email the user email
     * @return JWT refresh token
     */
    public String generateRefreshToken(Long userId, String email) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("email", email);
        claims.put("type", "refresh");

        return createToken(claims, email, jwtProperties.getRefreshTokenExpiration());
    }

    /**
     * Validates a JWT token.
     *
     * @param token the JWT token to validate
     * @return true if token is valid
     * @throws UnauthorizedException if token is invalid or expired
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (ExpiredJwtException e) {
            log.error("JWT token is expired: {}", e.getMessage());
            throw new UnauthorizedException("Token has expired");
        } catch (UnsupportedJwtException e) {
            log.error("JWT token is unsupported: {}", e.getMessage());
            throw new UnauthorizedException("Unsupported token");
        } catch (MalformedJwtException e) {
            log.error("Invalid JWT token: {}", e.getMessage());
            throw new UnauthorizedException("Invalid token format");
        } catch (SecurityException e) {
            log.error("Invalid JWT signature: {}", e.getMessage());
            throw new UnauthorizedException("Invalid token signature");
        } catch (IllegalArgumentException e) {
            log.error("JWT claims string is empty: {}", e.getMessage());
            throw new UnauthorizedException("Token is empty");
        }
    }

    /**
     * Extracts user ID from token.
     *
     * @param token the JWT token
     * @return user ID
     */
    public Long extractUserId(String token) {
        return extractClaim(token, claims -> claims.get("userId", Long.class));
    }

    /**
     * Extracts email from token.
     *
     * @param token the JWT token
     * @return user email
     */
    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Extracts token type from token.
     *
     * @param token the JWT token
     * @return token type (access or refresh)
     */
    public String extractTokenType(String token) {
        return extractClaim(token, claims -> claims.get("type", String.class));
    }

    /**
     * Extracts expiration date from token.
     *
     * @param token the JWT token
     * @return expiration date
     */
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * Checks if token is expired.
     *
     * @param token the JWT token
     * @return true if token is expired
     */
    public boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    /**
     * Validates that token is a refresh token.
     *
     * @param token the JWT token
     * @throws UnauthorizedException if token is not a refresh token
     */
    public void validateRefreshToken(String token) {
        validateToken(token);
        String tokenType = extractTokenType(token);
        if (!"refresh".equals(tokenType)) {
            throw new UnauthorizedException("Token is not a refresh token");
        }
    }

    /**
     * Extracts a specific claim from token.
     *
     * @param token the JWT token
     * @param claimsResolver function to extract claim
     * @param <T> claim type
     * @return extracted claim
     */
    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Extracts all claims from token.
     *
     * @param token the JWT token
     * @return all claims
     */
    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * Creates a JWT token with claims and expiration.
     *
     * @param claims token claims
     * @param subject token subject (usually email)
     * @param expirationTime expiration time in milliseconds
     * @return JWT token
     */
    private String createToken(Map<String, Object> claims, String subject, Long expirationTime) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationTime);

        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * Gets the signing key for JWT tokens.
     *
     * @return signing key
     */
    private SecretKey getSigningKey() {
        byte[] keyBytes = jwtProperties.getSecret().getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
