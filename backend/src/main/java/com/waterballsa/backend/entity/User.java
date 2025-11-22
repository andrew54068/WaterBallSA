package com.waterballsa.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * User entity representing platform users authenticated via Google OAuth.
 *
 * Users can:
 * - Browse and access purchased curriculum content
 * - Submit assignments and earn experience points
 * - Progress through levels and compete on leaderboards
 */
@Entity
@Table(name = "users", indexes = {
        @Index(name = "idx_users_google_id", columnList = "google_id"),
        @Index(name = "idx_users_email", columnList = "email"),
        @Index(name = "idx_users_global_rank", columnList = "global_rank")
})
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Google ID is required")
    @Column(name = "google_id", nullable = false, unique = true)
    private String googleId;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    @Column(nullable = false, unique = true)
    private String email;

    @NotBlank(message = "Name is required")
    @Column(nullable = false)
    private String name;

    @Column(name = "profile_picture_url", length = 500)
    private String profilePictureUrl;

    // Gamification fields (Phase 3)
    @NotNull
    @PositiveOrZero(message = "Total EXP must be non-negative")
    @Column(name = "total_exp", nullable = false)
    @Builder.Default
    private Integer totalExp = 0;

    @NotNull
    @Column(name = "current_level", nullable = false)
    @Builder.Default
    private Integer currentLevel = 1;

    @Column(name = "global_rank")
    private Integer globalRank;

    // Audit fields
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    /**
     * Updates the last login timestamp to current time.
     */
    public void updateLastLogin() {
        this.lastLoginAt = LocalDateTime.now();
    }

    /**
     * Adds experience points to the user's total and recalculates level if needed.
     *
     * @param exp the experience points to add
     */
    public void addExperience(int exp) {
        if (exp < 0) {
            throw new IllegalArgumentException("Experience points must be non-negative");
        }
        this.totalExp += exp;
        recalculateLevel();
    }

    /**
     * Recalculates the user's level based on total experience.
     * Formula: level = floor(sqrt(totalExp / 100)) + 1
     */
    private void recalculateLevel() {
        this.currentLevel = (int) Math.floor(Math.sqrt(this.totalExp / 100.0)) + 1;
    }
}
