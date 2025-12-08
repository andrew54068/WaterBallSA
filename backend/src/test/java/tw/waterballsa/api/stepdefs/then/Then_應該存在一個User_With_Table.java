package tw.waterballsa.api.stepdefs.then;

import io.cucumber.java.en.Then;
import io.cucumber.datatable.DataTable;
import org.springframework.beans.factory.annotation.Autowired;
import static org.junit.jupiter.api.Assertions.*;
import java.math.BigDecimal;
import java.util.*;
import java.lang.reflect.*;
import tw.waterballsa.api.repository.UserRepository;
import tw.waterballsa.api.entity.User;
import tw.waterballsa.api.stepdefs.helper.ISAFeatureArgumentResolver;

public class Then_應該存在一個User_With_Table {
    @Autowired
    private UserRepository repository;

    @Autowired
    private ISAFeatureArgumentResolver resolver;

    @Then("應該存在一個User, with table:")
    public void validate(DataTable dataTable) throws Exception {
        List<Map<String, String>> rows = dataTable.asMaps(String.class, String.class);

        for (Map<String, String> row : rows) {
            String id = Objects.requireNonNull(row.get("id"), "DataTable 必須包含欄位: id");
            
            // Resolve variable first before parsing
Object resolvedid = resolver.resolveVariable(id);
Long idLong = (resolvedid instanceof Number)
    ? ((Number) resolvedid).longValue()
    : Long.parseLong(resolvedid.toString());
            
            User actual = repository.findById(idLong)
                    .orElseThrow(() -> new AssertionError("User with id=" + id + " should exist"));

            // === validate field: id ===
            if (row.containsKey("id")) {
                String expected = row.get("id");
                Object v = actual.getId();
                assertNotNull(v, "User.id should not be null");
                long actualLong = (v instanceof Number) ? ((Number) v).longValue() : Long.parseLong(String.valueOf(v));
                long expectedLong = Long.parseLong(resolvedid.toString());
                assertEquals(expectedLong, actualLong, "User.id should match");
            }
            
            // === validate field: googleId ===
            if (row.containsKey("googleId")) {
                String expected = row.get("googleId");
                Object v = actual.getGoogleId();
                
                Object resolved = resolver.resolveAndValidate(expected, v, "googleId", "User");
                if (resolved != null) {
                    assertNotNull(v, "User.googleId should not be null");
                    // Normalize LocalTime format: "09:00" -> "09:00:00"
                    String actualStr = (v instanceof java.time.LocalTime) 
                        ? ((java.time.LocalTime) v).format(java.time.format.DateTimeFormatter.ofPattern("HH:mm:ss"))
                        : (v == null) ? null : String.valueOf(v);
                    String expectedStr = (resolved instanceof java.time.LocalTime)
                        ? ((java.time.LocalTime) resolved).format(java.time.format.DateTimeFormatter.ofPattern("HH:mm:ss"))
                        : resolved.toString();
                    assertEquals(expectedStr, actualStr, "User.googleId should match");
                }
            }
            
            // === validate field: email ===
            if (row.containsKey("email")) {
                String expected = row.get("email");
                Object v = actual.getEmail();
                
                Object resolved = resolver.resolveAndValidate(expected, v, "email", "User");
                if (resolved != null) {
                    assertNotNull(v, "User.email should not be null");
                    // Normalize LocalTime format: "09:00" -> "09:00:00"
                    String actualStr = (v instanceof java.time.LocalTime) 
                        ? ((java.time.LocalTime) v).format(java.time.format.DateTimeFormatter.ofPattern("HH:mm:ss"))
                        : (v == null) ? null : String.valueOf(v);
                    String expectedStr = (resolved instanceof java.time.LocalTime)
                        ? ((java.time.LocalTime) resolved).format(java.time.format.DateTimeFormatter.ofPattern("HH:mm:ss"))
                        : resolved.toString();
                    assertEquals(expectedStr, actualStr, "User.email should match");
                }
            }
            
            // === validate field: name ===
            if (row.containsKey("name")) {
                String expected = row.get("name");
                Object v = actual.getName();
                
                Object resolved = resolver.resolveAndValidate(expected, v, "name", "User");
                if (resolved != null) {
                    assertNotNull(v, "User.name should not be null");
                    // Normalize LocalTime format: "09:00" -> "09:00:00"
                    String actualStr = (v instanceof java.time.LocalTime) 
                        ? ((java.time.LocalTime) v).format(java.time.format.DateTimeFormatter.ofPattern("HH:mm:ss"))
                        : (v == null) ? null : String.valueOf(v);
                    String expectedStr = (resolved instanceof java.time.LocalTime)
                        ? ((java.time.LocalTime) resolved).format(java.time.format.DateTimeFormatter.ofPattern("HH:mm:ss"))
                        : resolved.toString();
                    assertEquals(expectedStr, actualStr, "User.name should match");
                }
            }
            
            // === validate field: profilePicture ===
            if (row.containsKey("profilePicture")) {
                String expected = row.get("profilePicture");
                Object v = actual.getProfilePicture();
                
                Object resolved = resolver.resolveAndValidate(expected, v, "profilePicture", "User");
                if (resolved != null) {
                    if (resolved.toString() == null || resolved.toString().isEmpty()) {
                        assertNull(v, "User.profilePicture should be null");
                    } else {
                        // Normalize LocalTime format: "09:00" -> "09:00:00"
                        String actualStr = (v instanceof java.time.LocalTime) 
                            ? ((java.time.LocalTime) v).format(java.time.format.DateTimeFormatter.ofPattern("HH:mm:ss"))
                            : (v == null) ? null : String.valueOf(v);
                        String expectedStr = (resolved instanceof java.time.LocalTime)
                            ? ((java.time.LocalTime) resolved).format(java.time.format.DateTimeFormatter.ofPattern("HH:mm:ss"))
                            : resolved.toString();
                        assertEquals(expectedStr, actualStr, "User.profilePicture should match");
                    }
                }
            }
        }
    }
}