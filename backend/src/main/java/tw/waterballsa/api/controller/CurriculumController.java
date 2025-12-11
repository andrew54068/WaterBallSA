package tw.waterballsa.api.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tw.waterballsa.api.dto.response.CurriculumDto;
import tw.waterballsa.api.dto.response.PaginatedCurriculumResponse;
import tw.waterballsa.application.service.CurriculumService;

@RestController
@RequestMapping("/curriculums")
public class CurriculumController {

    @Autowired
    private CurriculumService curriculumService;

    @GetMapping
    public ResponseEntity<PaginatedCurriculumResponse> getAllCurriculums(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {
        PaginatedCurriculumResponse response = curriculumService.getAllCurriculums(page, size, sort);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CurriculumDto> getCurriculumById(@PathVariable Integer id) {
        CurriculumDto curriculum = curriculumService.getCurriculumById(id);
        return ResponseEntity.ok(curriculum);
    }

    @GetMapping("/search")
    public ResponseEntity<PaginatedCurriculumResponse> searchCurriculums(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {
        PaginatedCurriculumResponse response = curriculumService.searchCurriculums(q, page, size, sort);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/free")
    public ResponseEntity<PaginatedCurriculumResponse> getFreeCurriculums(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {
        PaginatedCurriculumResponse response = curriculumService.getFreeCurriculums(page, size, sort);
        return ResponseEntity.ok(response);
    }
}
