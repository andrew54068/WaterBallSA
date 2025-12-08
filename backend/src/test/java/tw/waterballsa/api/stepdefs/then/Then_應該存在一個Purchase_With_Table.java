package tw.waterballsa.api.stepdefs.then;

import io.cucumber.java.en.Then;
import io.cucumber.datatable.DataTable;
import org.springframework.beans.factory.annotation.Autowired;
import static org.junit.jupiter.api.Assertions.*;
import java.math.BigDecimal;
import java.util.*;
import java.lang.reflect.*;
import tw.waterballsa.api.repository.PurchaseRepository;
import tw.waterballsa.api.entity.Purchase;
import tw.waterballsa.api.stepdefs.helper.ISAFeatureArgumentResolver;

public class Then_應該存在一個Purchase_With_Table {
    @Autowired
    private PurchaseRepository repository;

    @Autowired
    private ISAFeatureArgumentResolver resolver;

    @Then("應該存在一個Purchase, with table:")
    public void validate(DataTable dataTable) throws Exception {
        List<Map<String, String>> rows = dataTable.asMaps(String.class, String.class);

        for (Map<String, String> row : rows) {
            String id = Objects.requireNonNull(row.get("id"), "DataTable 必須包含欄位: id");
            
            // Resolve variable first before parsing
Object resolvedid = resolver.resolveVariable(id);
Long idLong = (resolvedid instanceof Number)
    ? ((Number) resolvedid).longValue()
    : Long.parseLong(resolvedid.toString());
            
            Purchase actual = repository.findById(idLong)
                    .orElseThrow(() -> new AssertionError("Purchase with id=" + id + " should exist"));

            // === validate field: id ===
            if (row.containsKey("id")) {
                String expected = row.get("id");
                Object v = actual.getId();
                assertNotNull(v, "Purchase.id should not be null");
                long actualLong = (v instanceof Number) ? ((Number) v).longValue() : Long.parseLong(String.valueOf(v));
                long expectedLong = Long.parseLong(resolvedid.toString());
                assertEquals(expectedLong, actualLong, "Purchase.id should match");
            }
            
            // === validate field: userId ===
            if (row.containsKey("userId")) {
                String expected = row.get("userId");
                Object v = actual.getUserId();
                
                Object resolved = resolver.resolveAndValidate(expected, v, "userId", "Purchase");
                if (resolved != null) {
                    assertNotNull(v, "Purchase.userId should not be null");
                    int actualInt = (v instanceof Number) ? ((Number) v).intValue() : Integer.parseInt(String.valueOf(v));
                    int expectedInt = Integer.parseInt(resolved.toString());
                    assertEquals(expectedInt, actualInt, "Purchase.userId should match");
                }
            }
            
            // === validate field: curriculumId ===
            if (row.containsKey("curriculumId")) {
                String expected = row.get("curriculumId");
                Object v = actual.getCurriculumId();
                
                Object resolved = resolver.resolveAndValidate(expected, v, "curriculumId", "Purchase");
                if (resolved != null) {
                    assertNotNull(v, "Purchase.curriculumId should not be null");
                    int actualInt = (v instanceof Number) ? ((Number) v).intValue() : Integer.parseInt(String.valueOf(v));
                    int expectedInt = Integer.parseInt(resolved.toString());
                    assertEquals(expectedInt, actualInt, "Purchase.curriculumId should match");
                }
            }
            
            // === validate field: originalPrice ===
            if (row.containsKey("originalPrice")) {
                String expected = row.get("originalPrice");
                Object v = actual.getOriginalPrice();
                
                Object resolved = resolver.resolveAndValidate(expected, v, "originalPrice", "Purchase");
                if (resolved != null) {
                    assertNotNull(v, "Purchase.originalPrice should not be null");
                    BigDecimal actualNum = new BigDecimal(String.valueOf(v));
                    BigDecimal expectedNum = new BigDecimal(resolved.toString());
                    assertEquals(0, expectedNum.compareTo(actualNum), "Purchase.originalPrice should match");
                }
            }
            
            // === validate field: finalPrice ===
            if (row.containsKey("finalPrice")) {
                String expected = row.get("finalPrice");
                Object v = actual.getFinalPrice();
                
                Object resolved = resolver.resolveAndValidate(expected, v, "finalPrice", "Purchase");
                if (resolved != null) {
                    assertNotNull(v, "Purchase.finalPrice should not be null");
                    BigDecimal actualNum = new BigDecimal(String.valueOf(v));
                    BigDecimal expectedNum = new BigDecimal(resolved.toString());
                    assertEquals(0, expectedNum.compareTo(actualNum), "Purchase.finalPrice should match");
                }
            }
            
            // === validate field: couponCode ===
            if (row.containsKey("couponCode")) {
                String expected = row.get("couponCode");
                Object v = actual.getCouponCode();
                
                Object resolved = resolver.resolveAndValidate(expected, v, "couponCode", "Purchase");
                if (resolved != null) {
                    if (resolved.toString() == null || resolved.toString().isEmpty()) {
                        assertNull(v, "Purchase.couponCode should be null");
                    } else {
                        // Normalize LocalTime format: "09:00" -> "09:00:00"
                        String actualStr = (v instanceof java.time.LocalTime) 
                            ? ((java.time.LocalTime) v).format(java.time.format.DateTimeFormatter.ofPattern("HH:mm:ss"))
                            : (v == null) ? null : String.valueOf(v);
                        String expectedStr = (resolved instanceof java.time.LocalTime)
                            ? ((java.time.LocalTime) resolved).format(java.time.format.DateTimeFormatter.ofPattern("HH:mm:ss"))
                            : resolved.toString();
                        assertEquals(expectedStr, actualStr, "Purchase.couponCode should match");
                    }
                }
            }
            
            // === validate field: status ===
            if (row.containsKey("status")) {
                String expected = row.get("status");
                Object v = actual.getStatus();
                
                Object resolved = resolver.resolveAndValidate(expected, v, "status", "Purchase");
                if (resolved != null) {
                    assertNotNull(v, "Purchase.status should not be null");
                    String actualStr = (v instanceof Enum<?>) ? ((Enum<?>) v).name() : String.valueOf(v);
                    assertEquals(resolved.toString(), actualStr, "Purchase.status should match");
                }
            }
            
            // === validate field: purchasedAt ===
            if (row.containsKey("purchasedAt")) {
                String expected = row.get("purchasedAt");
                Object v = actual.getPurchasedAt();
                
                Object resolved = resolver.resolveAndValidate(expected, v, "purchasedAt", "Purchase");
                if (resolved != null) {
                    if (resolved.toString() == null || resolved.toString().isEmpty()) {
                        assertNull(v, "Purchase.purchasedAt should be null");
                    } else {
                        // Normalize LocalTime format: "09:00" -> "09:00:00"
                        String actualStr = (v instanceof java.time.LocalTime) 
                            ? ((java.time.LocalTime) v).format(java.time.format.DateTimeFormatter.ofPattern("HH:mm:ss"))
                            : (v == null) ? null : String.valueOf(v);
                        String expectedStr = (resolved instanceof java.time.LocalTime)
                            ? ((java.time.LocalTime) resolved).format(java.time.format.DateTimeFormatter.ofPattern("HH:mm:ss"))
                            : resolved.toString();
                        assertEquals(expectedStr, actualStr, "Purchase.purchasedAt should match");
                    }
                }
            }
        }
    }
}