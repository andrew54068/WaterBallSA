package tw.waterballsa.api.stepdefs;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class Authenticator {

    @Value("${jwt.secret:your-256-bit-secret-key-for-jwt-token-generation-please-change-in-production}")
    private String secret;

    @Value("${jwt.access-token-expiration:900000}") // 15 minutes
    private Long accessTokenExpiration;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Generate a JWT access token for testing purposes
     * @param userId The user ID to include in the token
     * @param email The email to include in the token claims
     * @return JWT access token
     */
    public String generateAccessToken(Long userId, String email) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("email", email);
        return createToken(claims, userId.toString(), accessTokenExpiration);
    }

    /**
     * Generate a JWT access token with just user ID
     * @param userId The user ID to include in the token
     * @return JWT access token
     */
    public String generateAccessToken(Long userId) {
        return generateAccessToken(userId, "test@test.com");
    }

    /**
     * Generate a JWT token for a specific user ID string (for variable resolution)
     * @param userIdStr The user ID string (e.g., from scenario context)
     * @return JWT access token
     */
    public String generateTokenForUserId(String userIdStr) {
        Long userId = Long.parseLong(userIdStr);
        return generateAccessToken(userId);
    }

    /**
     * Generate a JWT token for a user ID (handles Object type from scenario context)
     * @param userId The user ID as an Object (can be Long, Integer, or String)
     * @return JWT access token, or null if userId is null
     */
    public String getToken(Object userId) {
        if (userId == null) {
            return null;
        }
        Long userIdLong = (userId instanceof Number)
            ? ((Number) userId).longValue()
            : Long.parseLong(userId.toString());
        return generateAccessToken(userIdLong);
    }

    private String createToken(Map<String, Object> claims, String subject, Long expiration) {
        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey())
                .compact();
    }
}
