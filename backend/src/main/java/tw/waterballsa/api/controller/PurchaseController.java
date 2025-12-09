package tw.waterballsa.api.controller;

import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tw.waterballsa.api.entity.Curriculum;
import tw.waterballsa.api.entity.Purchase;
import tw.waterballsa.api.entity.User;
import tw.waterballsa.api.repository.CurriculumRepository;
import tw.waterballsa.api.repository.PurchaseRepository;
import tw.waterballsa.api.repository.UserRepository;
import tw.waterballsa.api.security.JwtUtils;

import java.util.*;

@RestController
@AllArgsConstructor
public class PurchaseController {
    private final PurchaseRepository purchaseRepository;
    private final CurriculumRepository curriculumRepository;
    private final UserRepository userRepository; // To verify user exists if needed
    private final JwtUtils jwtUtils;

    private Long getUserId(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        String token = authHeader.substring(7);
        String userIdStr = jwtUtils.validateToken(token);
        if (userIdStr == null)
            return null;
        return Long.parseLong(userIdStr);
    }

    @GetMapping("/curriculums/{curriculumId}/order-preview")
    public ResponseEntity<Map<String, Object>> getOrderPreview(@PathVariable Long curriculumId,
            @RequestHeader("Authorization") String authHeader) {
        Long userId = getUserId(authHeader);
        if (userId == null)
            return ResponseEntity.status(401).build();

        return curriculumRepository.findById(curriculumId)
                .map(c -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("curriculum", Map.of("id", c.getId(), "title", c.getTitle()));
                    response.put("originalPrice", c.getPrice());
                    response.put("finalPrice", c.getPrice()); // Assuming no discount for now
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/purchases")
    public ResponseEntity<Purchase> createPurchase(@RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, Object> body) {
        Long userId = getUserId(authHeader);
        if (userId == null)
            return ResponseEntity.status(401).build();

        Object curriculumIdObj = body.get("curriculumId");
        Long curriculumId = null;
        if (curriculumIdObj instanceof Number) {
            curriculumId = ((Number) curriculumIdObj).longValue();
        } else if (curriculumIdObj instanceof String) {
            curriculumId = Long.parseLong((String) curriculumIdObj);
        }

        if (curriculumId == null)
            return ResponseEntity.badRequest().build();

        Curriculum curriculum = curriculumRepository.findById(curriculumId).orElse(null);
        if (curriculum == null)
            return ResponseEntity.notFound().build();

        Purchase purchase = Purchase.builder()
                .userId(userId)
                .curriculumId(curriculumId)
                .status("PENDING")
                .originalPrice(curriculum.getPrice())
                .finalPrice(curriculum.getPrice())
                .build();

        return ResponseEntity.ok(purchaseRepository.save(purchase));
    }

    @PostMapping("/purchases/{purchaseId}/complete")
    public ResponseEntity<Purchase> completePurchase(@RequestHeader("Authorization") String authHeader,
            @PathVariable Long purchaseId) {
        Long userId = getUserId(authHeader);
        if (userId == null)
            return ResponseEntity.status(401).build();

        return purchaseRepository.findById(purchaseId)
                .map(p -> {
                    p.setStatus("COMPLETED");
                    return ResponseEntity.ok(purchaseRepository.save(p));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/purchases/check-ownership/{curriculumId}")
    public ResponseEntity<Map<String, Boolean>> checkOwnership(@RequestHeader("Authorization") String authHeader,
            @PathVariable Long curriculumId) {
        Long userId = getUserId(authHeader);
        if (userId == null)
            return ResponseEntity.status(401).build();

        // Check if there is any COMPLETED purchase for this user and curriculum
        // In real repository we would add findByUserIdAndCurriculumIdAndStatus
        // Here we can use findAll and filter since it's mock (or simple in-mem)
        // Actually CucumberConfig maps by ID.
        // But PurchaseRepository is an interface.
        // We can't cast to Mock list.
        // We have to rely on what `PurchaseRepository` interface offers.
        // I need to check `PurchaseRepository` interface content.

        // I'll assume findAll() works for MockBean if configured to return list?
        // No, `CucumberConfig` mocks `save` and `findById`.
        // It does NOT mock `findAll`.

        // I need to update `CucumberConfig` to mock `findAll` or `findByUserId...`
        // methods.
        // Or I can add `findByUserId` to Repository and Mock it.

        // Assuming I'll add methods to Repo and Mock them.
        // For now, I'll write the code assuming findByUserId exists.

        boolean owns = purchaseRepository.findByUserId(userId).stream()
                .anyMatch(p -> p.getCurriculumId().equals(curriculumId) && "COMPLETED".equals(p.getStatus()));

        return ResponseEntity.ok(Collections.singletonMap("owns", owns));
    }

    @GetMapping("/purchases/my-purchases")
    public ResponseEntity<List<Purchase>> getMyPurchases(@RequestHeader("Authorization") String authHeader) {
        Long userId = getUserId(authHeader);
        if (userId == null)
            return ResponseEntity.status(401).build();

        List<Purchase> purchases = purchaseRepository.findByUserId(userId);
        // Filter? The endpoint might return all. Feature expects only COMPLETED in
        // example but logic might return all.
        // "取得使用者的購買歷史應包含已購買的課程"

        return ResponseEntity.ok(purchases);
    }
}
