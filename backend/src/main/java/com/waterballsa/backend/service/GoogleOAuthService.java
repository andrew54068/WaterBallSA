package com.waterballsa.backend.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.waterballsa.backend.exception.UnauthorizedException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Collections;

/**
 * Service for verifying Google OAuth ID tokens.
 *
 * Uses Google's API client library to validate ID tokens received from frontend.
 */
@Service
@Slf4j
public class GoogleOAuthService {

    private final GoogleIdTokenVerifier verifier;

    public GoogleOAuthService(@Value("${spring.security.oauth2.client.registration.google.client-id}") String clientId) {
        this.verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                .setAudience(Collections.singletonList(clientId))
                .build();
    }

    /**
     * Verifies a Google ID token and extracts user information.
     *
     * @param idTokenString the Google ID token from frontend
     * @return GoogleUserInfo containing user details
     * @throws UnauthorizedException if token is invalid
     */
    public GoogleUserInfo verifyToken(String idTokenString) {
        try {
            GoogleIdToken idToken = verifier.verify(idTokenString);

            if (idToken == null) {
                log.error("Invalid Google ID token");
                throw new UnauthorizedException("Invalid Google ID token");
            }

            GoogleIdToken.Payload payload = idToken.getPayload();

            // Get user information from payload
            String googleId = payload.getSubject();
            String email = payload.getEmail();
            boolean emailVerified = payload.getEmailVerified();
            String name = (String) payload.get("name");
            String pictureUrl = (String) payload.get("picture");

            if (!emailVerified) {
                log.error("Email not verified for user: {}", email);
                throw new UnauthorizedException("Email not verified");
            }

            log.info("Successfully verified Google token for user: {}", email);

            return GoogleUserInfo.builder()
                    .googleId(googleId)
                    .email(email)
                    .name(name)
                    .pictureUrl(pictureUrl)
                    .emailVerified(emailVerified)
                    .build();

        } catch (Exception e) {
            log.error("Error verifying Google ID token: {}", e.getMessage());
            throw new UnauthorizedException("Failed to verify Google ID token", e);
        }
    }

    /**
     * DTO for Google user information extracted from ID token.
     */
    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class GoogleUserInfo {
        private String googleId;
        private String email;
        private String name;
        private String pictureUrl;
        private boolean emailVerified;
    }
}
