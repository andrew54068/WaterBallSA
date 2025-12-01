package com.waterballsa.backend.config;

import com.waterballsa.backend.security.JwtAuthenticationEntryPoint;
import com.waterballsa.backend.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Security configuration for the application.
 *
 * Configures:
 * - JWT-based authentication
 * - CORS settings
 * - Public and protected endpoints
 * - Stateless session management
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                        .requestMatchers("/actuator/health", "/actuator/info").permitAll()

                        // Public read access to curriculums (browse without auth)
                        .requestMatchers(HttpMethod.GET, "/api/curriculums/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/chapters/**").permitAll()

                        // Public read access to lessons (but ownership will be checked by service layer)
                        .requestMatchers(HttpMethod.GET, "/api/lessons/**").permitAll()

                        // Video progress endpoints require authentication
                        .requestMatchers("/api/video-progress/**").authenticated()

                        // Purchase endpoints require authentication
                        .requestMatchers("/api/purchases/**").authenticated()

                        // All other endpoints require authentication
                        .anyRequest().authenticated()
                )
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Use setAllowedOriginPatterns to support wildcards for ngrok
        configuration.setAllowedOriginPatterns(List.of(
                "http://localhost:*",        // Allow all localhost ports
                "https://localhost:*",       // Allow all localhost HTTPS ports
                "https://waterballsa.com",
                "https://water-ball-sa.vercel.app",
                "https://*.ngrok-free.app",  // Allow all ngrok URLs
                "https://*.ngrok.io"         // Allow legacy ngrok URLs
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
