package tw.waterballsa.api.stepdefs.given;

import io.cucumber.java.en.Given;
import io.cucumber.datatable.DataTable;
import org.springframework.beans.factory.annotation.Autowired;
import tw.waterballsa.api.entity.Purchase;
import tw.waterballsa.api.repository.PurchaseRepository;
import tw.waterballsa.api.stepdefs.helper.ISAFeatureArgumentResolver;

import java.time.LocalDateTime;
import java.util.*;

public class Given_準備一個Purchase {
    @Autowired
    private PurchaseRepository purchaseRepository;
    @Autowired
    private ISAFeatureArgumentResolver resolver;
    @Autowired
    private tw.waterballsa.api.stepdefs.ScenarioContext scenarioContext;

    @Given("準備一個Purchase, with table:")
    public void preparePurchase(DataTable dataTable) {
        List<Map<String, String>> rows = dataTable.asMaps(String.class, String.class);
        List<String> headers = new ArrayList<>(dataTable.row(0));
        Map<Integer, String> contextKeyMap = resolver.parseContextKeys(headers);

        for (Map<String, String> row : rows) {
            String userIdVar = row.get("userId");
            Object userIdObj = resolver.resolveVariable(userIdVar);
            Long userId = Long.parseLong(userIdObj.toString());

            String curriculumIdVar = row.get("curriculumId");
            Object curriculumIdObj = resolver.resolveVariable(curriculumIdVar);
            Long curriculumId = Long.parseLong(curriculumIdObj.toString());

            String status = row.getOrDefault("status", "PENDING");
            Double originalPrice = row.containsKey("originalPrice") ? Double.parseDouble(row.get("originalPrice"))
                    : 0.0;
            Double finalPrice = row.containsKey("finalPrice") ? Double.parseDouble(row.get("finalPrice")) : 0.0;
            String couponCode = row.get("couponCode");

            Purchase purchase = Purchase.builder()
                    .userId(userId)
                    .curriculumId(curriculumId)
                    .status(status)
                    .originalPrice(originalPrice)
                    .finalPrice(finalPrice)
                    .couponCode(couponCode)
                    .purchasedAt(LocalDateTime.now())
                    .build();

            Purchase saved = purchaseRepository.save(purchase);

            // Handle VAR-System extraction
            List<String> dataRowValues = new ArrayList<>();
            for (String header : headers) {
                dataRowValues.add(row.get(header));
            }

            Map<String, Object> actualData = new HashMap<>();
            // Keys must match column headers minus '>'
            actualData.put("Purchase.id", saved.getId());
            actualData.put("userId", saved.getUserId());
            actualData.put("curriculumId", saved.getCurriculumId());
            actualData.put("status", saved.getStatus());
            actualData.put("originalPrice", saved.getOriginalPrice());
            actualData.put("finalPrice", saved.getFinalPrice());

            resolver.extractAndStoreVariables(dataRowValues, contextKeyMap, actualData);

            // Dynamically store object based on header prefix if present (e.g.
            // >PendingPurchase.id -> PendingPurchase)
            // Or fallback to "Purchase"
            scenarioContext.setContext("Purchase", saved);

            for (String header : headers) {
                String key = header.trim();
                if (key.startsWith(">")) {
                    String cleanKey = key.substring(1);
                    if (cleanKey.contains(".")) {
                        String type = cleanKey.split("\\.")[0];
                        scenarioContext.setContext(type, saved);
                    }
                }
            }
        }
    }
}
