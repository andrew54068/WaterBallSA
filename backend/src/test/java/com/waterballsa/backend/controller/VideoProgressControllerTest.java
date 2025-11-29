package com.waterballsa.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.waterballsa.backend.dto.SaveProgressRequest;
import com.waterballsa.backend.repository.VideoProgressRepository;
import com.waterballsa.backend.service.VideoProgressService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for VideoProgressController
 * Tests REST API endpoints with Spring Security
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class VideoProgressControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private VideoProgressService videoProgressService;

    @Autowired
    private VideoProgressRepository videoProgressRepository;

    private Long userId;
    private Long lessonId;

    @BeforeEach
    void setUp() {
        userId = 1L;
        lessonId = 100L;
        videoProgressRepository.deleteAll();
    }

    @Test
    @DisplayName("Should save progress when authenticated")
    void shouldSaveProgressWhenAuthenticated() throws Exception {
        // Given
        SaveProgressRequest request = new SaveProgressRequest();
        request.setCurrentTimeSeconds(60.0);
        request.setDurationSeconds(120.0);
        request.setCompletionPercentage(50);
        request.setIsCompleted(false);

        // When & Then
        mockMvc.perform(post("/api/lessons/{lessonId}/progress", lessonId)
                        .with(authentication(org.springframework.security.core.context.SecurityContextHolder
                                .getContext().getAuthentication() != null ?
                                org.springframework.security.core.context.SecurityContextHolder
                                        .getContext().getAuthentication() :
                                new org.springframework.security.authentication.TestingAuthenticationToken(userId, null)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId", is(userId.intValue())))
                .andExpect(jsonPath("$.lessonId", is(lessonId.intValue())))
                .andExpect(jsonPath("$.currentTimeSeconds", is(60.0)))
                .andExpect(jsonPath("$.durationSeconds", is(120.0)))
                .andExpect(jsonPath("$.completionPercentage", is(50)))
                .andExpect(jsonPath("$.isCompleted", is(false)));
    }

    @Test
    @DisplayName("Should return 401 when not authenticated")
    void shouldReturn401WhenNotAuthenticated() throws Exception {
        // Given
        SaveProgressRequest request = new SaveProgressRequest();
        request.setCurrentTimeSeconds(60.0);
        request.setDurationSeconds(120.0);
        request.setCompletionPercentage(50);
        request.setIsCompleted(false);

        // When & Then
        mockMvc.perform(post("/api/lessons/{lessonId}/progress", lessonId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Should get progress when exists")
    void shouldGetProgressWhenExists() throws Exception {
        // Given - Save progress first
        SaveProgressRequest request = SaveProgressRequest.builder()
                .currentTimeSeconds(60.0)
                .durationSeconds(120.0)
                .completionPercentage(50)
                .isCompleted(false)
                .build();
        videoProgressService.saveProgress(userId, lessonId, request);

        // When & Then
        mockMvc.perform(get("/api/lessons/{lessonId}/progress", lessonId)
                        .with(authentication(new org.springframework.security.authentication.TestingAuthenticationToken(userId, null))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId", is(userId.intValue())))
                .andExpect(jsonPath("$.lessonId", is(lessonId.intValue())))
                .andExpect(jsonPath("$.currentTimeSeconds", is(60.0)))
                .andExpect(jsonPath("$.durationSeconds", is(120.0)))
                .andExpect(jsonPath("$.completionPercentage", is(50)));
    }

    @Test
    @DisplayName("Should return 404 when progress not found")
    void shouldReturn404WhenProgressNotFound() throws Exception {
        // When & Then
        mockMvc.perform(get("/api/lessons/{lessonId}/progress", 999L)
                        .with(authentication(new org.springframework.security.authentication.TestingAuthenticationToken(userId, null))))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Should get chapter progress when lessons have progress")
    void shouldGetChapterProgressWhenExists() throws Exception {
        // Given - Save progress for multiple lessons in a chapter
        Long chapterId = 10L;

        SaveProgressRequest request1 = SaveProgressRequest.builder()
                .currentTimeSeconds(60.0)
                .durationSeconds(120.0)
                .completionPercentage(50)
                .isCompleted(false)
                .build();
        videoProgressService.saveProgress(userId, 100L, request1);

        SaveProgressRequest request2 = SaveProgressRequest.builder()
                .currentTimeSeconds(30.0)
                .durationSeconds(60.0)
                .completionPercentage(50)
                .isCompleted(false)
                .build();
        videoProgressService.saveProgress(userId, 101L, request2);

        SaveProgressRequest request3 = SaveProgressRequest.builder()
                .currentTimeSeconds(90.0)
                .durationSeconds(90.0)
                .completionPercentage(100)
                .isCompleted(true)
                .build();
        videoProgressService.saveProgress(userId, 102L, request3);

        // When & Then
        mockMvc.perform(get("/api/lessons/chapters/{chapterId}/progress", chapterId)
                        .with(authentication(new org.springframework.security.authentication.TestingAuthenticationToken(userId, null))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(3)))
                .andExpect(jsonPath("$[0].userId", is(userId.intValue())))
                .andExpect(jsonPath("$[1].userId", is(userId.intValue())))
                .andExpect(jsonPath("$[2].userId", is(userId.intValue())));
    }

    @Test
    @DisplayName("Should return empty array when no chapter progress")
    void shouldReturnEmptyArrayWhenNoChapterProgress() throws Exception {
        // When & Then
        mockMvc.perform(get("/api/lessons/chapters/{chapterId}/progress", 999L)
                        .with(authentication(new org.springframework.security.authentication.TestingAuthenticationToken(userId, null))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    @DisplayName("Should mark video as completed when threshold reached")
    void shouldMarkVideoAsCompletedWhenThresholdReached() throws Exception {
        // Given - Long video at 95% completion
        SaveProgressRequest request = new SaveProgressRequest();
        request.setCurrentTimeSeconds(114.0);
        request.setDurationSeconds(120.0);
        request.setCompletionPercentage(95);
        request.setIsCompleted(true);

        // When & Then
        mockMvc.perform(post("/api/lessons/{lessonId}/progress", lessonId)
                        .with(authentication(new org.springframework.security.authentication.TestingAuthenticationToken(userId, null)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isCompleted", is(true)))
                .andExpect(jsonPath("$.completedAt", notNullValue()));
    }

    @Test
    @DisplayName("Should update progress when saving multiple times")
    void shouldUpdateProgressWhenSavingMultipleTimes() throws Exception {
        // Given - Initial save
        SaveProgressRequest request1 = new SaveProgressRequest();
        request1.setCurrentTimeSeconds(30.0);
        request1.setDurationSeconds(120.0);
        request1.setCompletionPercentage(25);
        request1.setIsCompleted(false);

        mockMvc.perform(post("/api/lessons/{lessonId}/progress", lessonId)
                        .with(authentication(new org.springframework.security.authentication.TestingAuthenticationToken(userId, null)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request1)))
                .andExpect(status().isOk());

        // When - Update progress
        SaveProgressRequest request2 = new SaveProgressRequest();
        request2.setCurrentTimeSeconds(60.0);
        request2.setDurationSeconds(120.0);
        request2.setCompletionPercentage(50);
        request2.setIsCompleted(false);

        // Then
        mockMvc.perform(post("/api/lessons/{lessonId}/progress", lessonId)
                        .with(authentication(new org.springframework.security.authentication.TestingAuthenticationToken(userId, null)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request2)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currentTimeSeconds", is(60.0)))
                .andExpect(jsonPath("$.completionPercentage", is(50)));

        // Verify - Get progress should return updated values
        mockMvc.perform(get("/api/lessons/{lessonId}/progress", lessonId)
                        .with(authentication(new org.springframework.security.authentication.TestingAuthenticationToken(userId, null))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currentTimeSeconds", is(60.0)));
    }

    @Test
    @DisplayName("Should validate request fields")
    void shouldValidateRequestFields() throws Exception {
        // Given - Invalid request (negative time)
        SaveProgressRequest request = new SaveProgressRequest();
        request.setCurrentTimeSeconds(-10.0);
        request.setDurationSeconds(120.0);
        request.setCompletionPercentage(0);
        request.setIsCompleted(false);

        // When & Then - Should return 400 Bad Request
        mockMvc.perform(post("/api/lessons/{lessonId}/progress", lessonId)
                        .with(authentication(new org.springframework.security.authentication.TestingAuthenticationToken(userId, null)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Should handle zero progress correctly")
    void shouldHandleZeroProgressCorrectly() throws Exception {
        // Given
        SaveProgressRequest request = new SaveProgressRequest();
        request.setCurrentTimeSeconds(0.0);
        request.setDurationSeconds(120.0);
        request.setCompletionPercentage(0);
        request.setIsCompleted(false);

        // When & Then
        mockMvc.perform(post("/api/lessons/{lessonId}/progress", lessonId)
                        .with(authentication(new org.springframework.security.authentication.TestingAuthenticationToken(userId, null)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currentTimeSeconds", is(0.0)))
                .andExpect(jsonPath("$.completionPercentage", is(0)))
                .andExpect(jsonPath("$.isCompleted", is(false)));
    }

    @Test
    @DisplayName("Should handle concurrent progress saves")
    void shouldHandleConcurrentProgressSaves() throws Exception {
        // Given - Multiple rapid saves (simulating 10-second intervals)
        SaveProgressRequest request1 = new SaveProgressRequest();
        request1.setCurrentTimeSeconds(10.0);
        request1.setDurationSeconds(120.0);
        request1.setCompletionPercentage(8);
        request1.setIsCompleted(false);

        SaveProgressRequest request2 = new SaveProgressRequest();
        request2.setCurrentTimeSeconds(20.0);
        request2.setDurationSeconds(120.0);
        request2.setCompletionPercentage(16);
        request2.setIsCompleted(false);

        SaveProgressRequest request3 = new SaveProgressRequest();
        request3.setCurrentTimeSeconds(30.0);
        request3.setDurationSeconds(120.0);
        request3.setCompletionPercentage(25);
        request3.setIsCompleted(false);

        // When - Save all three rapidly
        mockMvc.perform(post("/api/lessons/{lessonId}/progress", lessonId)
                        .with(authentication(new org.springframework.security.authentication.TestingAuthenticationToken(userId, null)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request1)))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/lessons/{lessonId}/progress", lessonId)
                        .with(authentication(new org.springframework.security.authentication.TestingAuthenticationToken(userId, null)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request2)))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/lessons/{lessonId}/progress", lessonId)
                        .with(authentication(new org.springframework.security.authentication.TestingAuthenticationToken(userId, null)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request3)))
                .andExpect(status().isOk());

        // Then - Final state should be the latest save
        mockMvc.perform(get("/api/lessons/{lessonId}/progress", lessonId)
                        .with(authentication(new org.springframework.security.authentication.TestingAuthenticationToken(userId, null))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currentTimeSeconds", is(30.0)))
                .andExpect(jsonPath("$.completionPercentage", is(25)));
    }
}
