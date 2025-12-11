package tw.waterballsa.api.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import tw.waterballsa.api.dto.request.SaveProgressRequest;
import tw.waterballsa.api.dto.response.VideoProgressDto;
import tw.waterballsa.application.service.VideoProgressService;

import java.util.List;

@RestController
@RequestMapping("/lessons")
public class VideoProgressController {

    @Autowired
    private VideoProgressService videoProgressService;

    @PostMapping("/{lessonId}/progress")
    public ResponseEntity<VideoProgressDto> saveProgress(
            @PathVariable Integer lessonId,
            @Valid @RequestBody SaveProgressRequest request,
            Authentication authentication) {
        Integer userId = Integer.parseInt(authentication.getName());
        VideoProgressDto progress = videoProgressService.saveOrUpdateProgress(userId, lessonId, request);
        return ResponseEntity.ok(progress);
    }

    @GetMapping("/{lessonId}/progress")
    public ResponseEntity<VideoProgressDto> getProgress(
            @PathVariable Integer lessonId,
            Authentication authentication) {
        Integer userId = Integer.parseInt(authentication.getName());
        VideoProgressDto progress = videoProgressService.getProgress(userId, lessonId);
        return ResponseEntity.ok(progress);
    }

    @GetMapping("/chapters/{chapterId}/progress")
    public ResponseEntity<List<VideoProgressDto>> getChapterProgress(
            @PathVariable Integer chapterId,
            Authentication authentication) {
        Integer userId = Integer.parseInt(authentication.getName());
        List<VideoProgressDto> progressList = videoProgressService.getChapterProgress(userId, chapterId);
        return ResponseEntity.ok(progressList);
    }
}
