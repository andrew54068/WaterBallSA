package com.waterballsa.backend.dto;

import com.waterballsa.backend.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for User entity.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDto {

    private Long id;
    private String email;
    private String name;
    private String profilePictureUrl;
    private Integer totalExp;
    private Integer currentLevel;
    private Integer globalRank;
    private LocalDateTime createdAt;
    private LocalDateTime lastLoginAt;

    /**
     * Converts a User entity to UserDto.
     *
     * @param user the user entity
     * @return UserDto instance
     */
    public static UserDto from(User user) {
        return UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .profilePictureUrl(user.getProfilePictureUrl())
                .totalExp(user.getTotalExp())
                .currentLevel(user.getCurrentLevel())
                .globalRank(user.getGlobalRank())
                .createdAt(user.getCreatedAt())
                .lastLoginAt(user.getLastLoginAt())
                .build();
    }
}
