package tw.waterballsa.api.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import tw.waterballsa.api.dto.request.CreatePurchaseRequest;
import tw.waterballsa.api.dto.response.OrderPreviewResponse;
import tw.waterballsa.api.dto.response.OwnershipCheckResponse;
import tw.waterballsa.api.dto.response.PaginatedPurchasesResponse;
import tw.waterballsa.api.dto.response.PurchaseResponse;
import tw.waterballsa.application.service.PurchaseService;

@RestController
public class PurchaseController {

    @Autowired
    private PurchaseService purchaseService;

    @GetMapping("/curriculums/{curriculumId}/order-preview")
    public ResponseEntity<OrderPreviewResponse> getOrderPreview(
            @PathVariable Integer curriculumId,
            Authentication authentication) {
        Integer userId = Integer.parseInt(authentication.getName());
        OrderPreviewResponse response = purchaseService.getOrderPreview(userId, curriculumId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/purchases/check-ownership/{curriculumId}")
    public ResponseEntity<OwnershipCheckResponse> checkOwnership(
            @PathVariable Integer curriculumId,
            Authentication authentication) {
        Integer userId = Integer.parseInt(authentication.getName());
        OwnershipCheckResponse response = purchaseService.checkOwnership(userId, curriculumId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/purchases")
    public ResponseEntity<PurchaseResponse> createPurchase(
            @Valid @RequestBody CreatePurchaseRequest request,
            Authentication authentication) {
        Integer userId = Integer.parseInt(authentication.getName());
        PurchaseResponse response = purchaseService.createPurchase(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/purchases/{purchaseId}/complete")
    public ResponseEntity<PurchaseResponse> completePurchase(
            @PathVariable Integer purchaseId,
            Authentication authentication) {
        Integer userId = Integer.parseInt(authentication.getName());
        PurchaseResponse response = purchaseService.completePurchase(userId, purchaseId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/purchases/my-purchases")
    public ResponseEntity<PaginatedPurchasesResponse> getMyPurchases(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String direction,
            Authentication authentication) {
        Integer userId = Integer.parseInt(authentication.getName());
        PaginatedPurchasesResponse response = purchaseService.getMyPurchases(userId, page, size, sortBy, direction);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/purchases/completed")
    public ResponseEntity<PaginatedPurchasesResponse> getCompletedPurchases(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        Integer userId = Integer.parseInt(authentication.getName());
        PaginatedPurchasesResponse response = purchaseService.getCompletedPurchases(userId, page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/purchases/{purchaseId}")
    public ResponseEntity<PurchaseResponse> getPurchaseById(
            @PathVariable Integer purchaseId,
            Authentication authentication) {
        Integer userId = Integer.parseInt(authentication.getName());
        PurchaseResponse response = purchaseService.getPurchaseById(userId, purchaseId);
        return ResponseEntity.ok(response);
    }
}
