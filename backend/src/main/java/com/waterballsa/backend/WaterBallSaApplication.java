package com.waterballsa.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * Main Spring Boot application class for WaterBallSA platform.
 *
 * This application provides a RESTful API for an online learning platform
 * with features including:
 * - Google OAuth authentication
 * - Curriculum and lesson management
 * - Purchase and payment processing
 * - Assignment submission and grading
 * - Gamification with EXP and leaderboards
 */
@SpringBootApplication
@EnableJpaAuditing
public class WaterBallSaApplication {

    public static void main(String[] args) {
        SpringApplication.run(WaterBallSaApplication.class, args);
    }
}
