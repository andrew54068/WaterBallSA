package tw.waterballsa.api.stepdefs.given;

import io.cucumber.datatable.DataTable;
import io.cucumber.java.en.Given;
import org.springframework.beans.factory.annotation.Autowired;
import tw.waterballsa.api.entity.Curriculum;
import tw.waterballsa.api.entity.Purchase;
import tw.waterballsa.api.entity.User;
import tw.waterballsa.api.repository.CurriculumRepository;
import tw.waterballsa.api.repository.PurchaseRepository;
import tw.waterballsa.api.repository.UserRepository;
import tw.waterballsa.api.stepdefs.helper.ISAFeatureArgumentResolver;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class Given_準備一個Purchase {

    @Autowired
    private PurchaseRepository purchaseRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CurriculumRepository curriculumRepository;

    @Autowired
    private ISAFeatureArgumentResolver resolver;

    @Given("準備一個Purchase, with table:")
    public void preparePurchase(DataTable dataTable) {
        List<Map<String, String>> rows = dataTable.asMaps(String.class, String.class);
        List<String> headers = dataTable.row(0);

        for (Map<String, String> row : rows) {
            Purchase.PurchaseBuilder builder = Purchase.builder();

            // Resolve user
            if (row.containsKey("userId")) {
                Object resolved = resolver.resolveVariable(row.get("userId"));
                Long userId = resolver.convertValue(resolved.toString(), Long.class);
                User user = userRepository.findById(userId)
                        .orElseThrow(() -> new RuntimeException("User not found: " + userId));
                builder.user(user);
            }

            // Resolve curriculum
            if (row.containsKey("curriculumId")) {
                Object resolved = resolver.resolveVariable(row.get("curriculumId"));
                Long curriculumId = resolver.convertValue(resolved.toString(), Long.class);
                Curriculum curriculum = curriculumRepository.findById(curriculumId)
                        .orElseThrow(() -> new RuntimeException("Curriculum not found: " + curriculumId));
                builder.curriculum(curriculum);

                // Set prices from curriculum if not provided
                if (!row.containsKey("originalPrice")) {
                    builder.originalPrice(curriculum.getPrice());
                }
                if (!row.containsKey("finalPrice")) {
                    builder.finalPrice(curriculum.getPrice());
                }
            }

            if (row.containsKey("originalPrice")) {
                Object resolved = resolver.resolveVariable(row.get("originalPrice"));
                builder.originalPrice(resolver.convertValue(resolved.toString(), BigDecimal.class));
            }

            if (row.containsKey("finalPrice")) {
                Object resolved = resolver.resolveVariable(row.get("finalPrice"));
                builder.finalPrice(resolver.convertValue(resolved.toString(), BigDecimal.class));
            }

            if (row.containsKey("couponCode")) {
                Object resolved = resolver.resolveVariable(row.get("couponCode"));
                builder.couponCode(resolved != null ? resolved.toString() : null);
            }

            if (row.containsKey("status")) {
                Object resolved = resolver.resolveVariable(row.get("status"));
                if (resolved != null) {
                    builder.status(Purchase.PurchaseStatus.valueOf(resolved.toString()));
                }
            }

            // Set purchasedAt for COMPLETED purchases
            if (row.containsKey("purchasedAt")) {
                Object resolved = resolver.resolveVariable(row.get("purchasedAt"));
                if (resolved != null) {
                    builder.purchasedAt(resolver.convertValue(resolved.toString(), LocalDateTime.class));
                }
            } else if (row.containsKey("status") && "COMPLETED".equals(row.get("status"))) {
                builder.purchasedAt(LocalDateTime.now());
            }

            // Save entity
            Purchase purchase = purchaseRepository.save(builder.build());

            // Extract and store variables
            List<String> dataRow = dataTable.row(rows.indexOf(row) + 1);
            for (int i = 0; i < headers.size(); i++) {
                String header = headers.get(i);
                String dataValue = i < dataRow.size() ? dataRow.get(i) : null;

                // Check header for > prefix (output marker)
                if (header.startsWith(">")) {
                    String varName = header.substring(1).trim();
                    if (varName.contains(".id") || varName.equals("id")) {
                        resolver.storeVariable(varName, purchase.getId());
                    }
                }

                // Check data value for < prefix (variable storage marker)
                if (dataValue != null && dataValue.trim().startsWith("<")) {
                    String varName = dataValue.trim().substring(1).trim();
                    resolver.storeVariable(varName, purchase.getId());
                }
            }
        }
    }
}
