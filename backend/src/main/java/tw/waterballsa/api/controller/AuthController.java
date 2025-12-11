package tw.waterballsa.api.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import tw.waterballsa.api.dto.request.GoogleLoginRequest;
import tw.waterballsa.api.dto.request.RefreshTokenRequest;
import tw.waterballsa.api.dto.response.AuthResponse;
import tw.waterballsa.api.dto.response.RefreshTokenResponse;
import tw.waterballsa.api.dto.response.UserDto;
import tw.waterballsa.application.service.AuthenticationService;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthenticationService authenticationService;

    @PostMapping("/google")
    public ResponseEntity<AuthResponse> loginWithGoogle(@Valid @RequestBody GoogleLoginRequest request) {
        AuthResponse response = authenticationService.loginWithGoogle(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<RefreshTokenResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        RefreshTokenResponse response = authenticationService.refreshToken(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser(Authentication authentication) {
        Integer userId = Integer.parseInt(authentication.getName());
        UserDto user = authenticationService.getCurrentUser(userId);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/logout")
    public ResponseEntity<java.util.Map<String, String>> logout(Authentication authentication) {
        Integer userId = Integer.parseInt(authentication.getName());
        java.util.Map<String, String> response = authenticationService.logout(userId);
        return ResponseEntity.ok(response);
    }
}
