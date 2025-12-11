package tw.waterballsa.application.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tw.waterballsa.api.dto.request.GoogleLoginRequest;
import tw.waterballsa.api.dto.request.RefreshTokenRequest;
import tw.waterballsa.api.dto.response.AuthResponse;
import tw.waterballsa.api.dto.response.RefreshTokenResponse;
import tw.waterballsa.api.dto.response.UserDto;
import tw.waterballsa.api.entity.User;
import tw.waterballsa.api.exception.ResourceNotFoundException;
import tw.waterballsa.api.exception.UnauthorizedException;
import tw.waterballsa.api.repository.UserRepository;
import tw.waterballsa.api.security.GoogleTokenVerifier;
import tw.waterballsa.api.security.JwtUtil;

import java.util.Map;

@Service
public class AuthenticationService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GoogleTokenVerifier googleTokenVerifier;

    @Autowired
    private JwtUtil jwtUtil;

    @Transactional
    public AuthResponse loginWithGoogle(GoogleLoginRequest request) {
        // Verify Google ID token (or mock for testing)
        GoogleIdToken.Payload payload = googleTokenVerifier.verifyToken(request.getGoogleIdToken());

        String googleId = payload.getSubject();
        String email = payload.getEmail();
        String name = (String) payload.get("name");
        String profilePicture = (String) payload.get("picture");

        // Find or create user
        User user = userRepository.findByGoogleId(googleId)
                .orElseGet(() -> {
                    User newUser = User.builder()
                            .googleId(googleId)
                            .email(email)
                            .name(name)
                            .profilePicture(profilePicture)
                            .build();
                    return userRepository.save(newUser);
                });

        // Update user info if changed
        boolean updated = false;
        if (!user.getEmail().equals(email)) {
            user.setEmail(email);
            updated = true;
        }
        if (!user.getName().equals(name)) {
            user.setName(name);
            updated = true;
        }
        if (profilePicture != null && !profilePicture.equals(user.getProfilePicture())) {
            user.setProfilePicture(profilePicture);
            updated = true;
        }
        if (updated) {
            user = userRepository.save(user);
        }

        // Generate JWT tokens
        String accessToken = jwtUtil.generateAccessToken(user.getId());
        String refreshToken = jwtUtil.generateRefreshToken(user.getId());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtUtil.getAccessTokenExpirationInSeconds().intValue())
                .build();
    }

    public RefreshTokenResponse refreshToken(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();

        // Validate refresh token
        if (!jwtUtil.validateToken(refreshToken)) {
            throw new UnauthorizedException("Invalid or expired refresh token");
        }

        // Extract user ID from refresh token
        String userIdStr = jwtUtil.extractUsername(refreshToken);
        Long userId = Long.parseLong(userIdStr);

        // Verify user exists
        userRepository.findById(userId)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        // Generate new access token
        String newAccessToken = jwtUtil.generateAccessToken(userId);

        return RefreshTokenResponse.builder()
                .newAccessToken(newAccessToken)
                .tokenType("Bearer")
                .expiresIn(jwtUtil.getAccessTokenExpirationInSeconds().intValue())
                .build();
    }

    @Transactional(readOnly = true)
    public UserDto getCurrentUser(Integer userId) {
        User user = userRepository.findById(userId.longValue())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        return UserDto.builder()
                .id(user.getId().intValue())
                .googleId(user.getGoogleId())
                .email(user.getEmail())
                .name(user.getName())
                .profilePicture(user.getProfilePicture())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    public Map<String, String> logout(Integer userId) {
        // JWT tokens are stateless, so logout is handled client-side
        // This method returns a success message
        return Map.of("message", "Logout successful");
    }
}
