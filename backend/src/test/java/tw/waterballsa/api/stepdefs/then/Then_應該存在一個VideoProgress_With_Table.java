package tw.waterballsa.api.stepdefs.then;

import io.cucumber.java.en.Then;
import io.cucumber.datatable.DataTable;
import org.springframework.beans.factory.annotation.Autowired;
import static org.junit.jupiter.api.Assertions.*;
import java.math.BigDecimal;
import java.util.*;
import java.lang.reflect.*;
import tw.waterballsa.api.repository.VideoProgressRepository;
import tw.waterballsa.api.entity.VideoProgress;
import tw.waterballsa.api.stepdefs.helper.ISAFeatureArgumentResolver;

public class Then_應該存在一個VideoProgress_With_Table {
    @Autowired
    private VideoProgressRepository repository;

    @Autowired
    private ISAFeatureArgumentResolver resolver;

    @Then("應該存在一個VideoProgress, with table:")
    public void validate(DataTable dataTable) throws Exception {
        List<Map<String, String>> rows = dataTable.asMaps(String.class, String.class);

        for (Map<String, String> row : rows) {
            VideoProgress actual;

            // Support lookup by id OR userId+lessonId
            if (row.containsKey("id")) {
                String id = row.get("id");
                Object resolvedid = resolver.resolveVariable(id);
                Long idLong = (resolvedid instanceof Number)
                    ? ((Number) resolvedid).longValue()
                    : Long.parseLong(resolvedid.toString());

                actual = repository.findById(idLong)
                        .orElseThrow(() -> new AssertionError("VideoProgress with id=" + id + " should exist"));
            } else {
                // Look up by userId + lessonId (unique together)
                String userIdStr = Objects.requireNonNull(row.get("userId"), "DataTable 必須包含 userId 或 id");
                String lessonIdStr = Objects.requireNonNull(row.get("lessonId"), "DataTable 必須包含 lessonId 當使用 userId 查詢時");

                Object resolvedUserId = resolver.resolveVariable(userIdStr);
                Object resolvedLessonId = resolver.resolveVariable(lessonIdStr);

                Long userId = (resolvedUserId instanceof Number)
                    ? ((Number) resolvedUserId).longValue()
                    : Long.parseLong(resolvedUserId.toString());
                Long lessonId = (resolvedLessonId instanceof Number)
                    ? ((Number) resolvedLessonId).longValue()
                    : Long.parseLong(resolvedLessonId.toString());

                actual = repository.findByUserIdAndLessonId(userId, lessonId)
                        .orElseThrow(() -> new AssertionError("VideoProgress with userId=" + userId + " and lessonId=" + lessonId + " should exist"));
            }

            // === validate field: id ===
            if (row.containsKey("id")) {
                String expected = row.get("id");
                Object v = actual.getId();
                Object resolvedExpected = resolver.resolveVariable(expected);
                assertNotNull(v, "VideoProgress.id should not be null");
                long actualLong = (v instanceof Number) ? ((Number) v).longValue() : Long.parseLong(String.valueOf(v));
                long expectedLong = Long.parseLong(resolvedExpected.toString());
                assertEquals(expectedLong, actualLong, "VideoProgress.id should match");
            }
            
            // === validate field: userId ===
            if (row.containsKey("userId")) {
                String expected = row.get("userId");
                Object v = actual.getUserId();
                
                Object resolved = resolver.resolveAndValidate(expected, v, "userId", "VideoProgress");
                if (resolved != null) {
                    assertNotNull(v, "VideoProgress.userId should not be null");
                    int actualInt = (v instanceof Number) ? ((Number) v).intValue() : Integer.parseInt(String.valueOf(v));
                    int expectedInt = Integer.parseInt(resolved.toString());
                    assertEquals(expectedInt, actualInt, "VideoProgress.userId should match");
                }
            }
            
            // === validate field: lessonId ===
            if (row.containsKey("lessonId")) {
                String expected = row.get("lessonId");
                Object v = actual.getLessonId();
                
                Object resolved = resolver.resolveAndValidate(expected, v, "lessonId", "VideoProgress");
                if (resolved != null) {
                    assertNotNull(v, "VideoProgress.lessonId should not be null");
                    int actualInt = (v instanceof Number) ? ((Number) v).intValue() : Integer.parseInt(String.valueOf(v));
                    int expectedInt = Integer.parseInt(resolved.toString());
                    assertEquals(expectedInt, actualInt, "VideoProgress.lessonId should match");
                }
            }
            
            // === validate field: currentTimeSeconds ===
            if (row.containsKey("currentTimeSeconds")) {
                String expected = row.get("currentTimeSeconds");
                Object v = actual.getCurrentTimeSeconds();
                
                Object resolved = resolver.resolveAndValidate(expected, v, "currentTimeSeconds", "VideoProgress");
                if (resolved != null) {
                    assertNotNull(v, "VideoProgress.currentTimeSeconds should not be null");
                    BigDecimal actualNum = new BigDecimal(String.valueOf(v));
                    BigDecimal expectedNum = new BigDecimal(resolved.toString());
                    assertEquals(0, expectedNum.compareTo(actualNum), "VideoProgress.currentTimeSeconds should match");
                }
            }
            
            // === validate field: durationSeconds ===
            if (row.containsKey("durationSeconds")) {
                String expected = row.get("durationSeconds");
                Object v = actual.getDurationSeconds();
                
                Object resolved = resolver.resolveAndValidate(expected, v, "durationSeconds", "VideoProgress");
                if (resolved != null) {
                    assertNotNull(v, "VideoProgress.durationSeconds should not be null");
                    BigDecimal actualNum = new BigDecimal(String.valueOf(v));
                    BigDecimal expectedNum = new BigDecimal(resolved.toString());
                    assertEquals(0, expectedNum.compareTo(actualNum), "VideoProgress.durationSeconds should match");
                }
            }
            
            // === validate field: completionPercentage ===
            if (row.containsKey("completionPercentage")) {
                String expected = row.get("completionPercentage");
                Object v = actual.getCompletionPercentage();
                
                Object resolved = resolver.resolveAndValidate(expected, v, "completionPercentage", "VideoProgress");
                if (resolved != null) {
                    assertNotNull(v, "VideoProgress.completionPercentage should not be null");
                    BigDecimal actualNum = new BigDecimal(String.valueOf(v));
                    BigDecimal expectedNum = new BigDecimal(resolved.toString());
                    assertEquals(0, expectedNum.compareTo(actualNum), "VideoProgress.completionPercentage should match");
                }
            }
            
            // === validate field: isCompleted ===
            if (row.containsKey("isCompleted")) {
                String expected = row.get("isCompleted");
                Object v = actual.getIsCompleted();
                
                Object resolved = resolver.resolveAndValidate(expected, v, "isCompleted", "VideoProgress");
                if (resolved != null) {
                    if (resolved.toString() == null || resolved.toString().isEmpty()) {
                        assertNull(v, "VideoProgress.isCompleted should be null");
                    } else {
                        boolean actualBool = (v instanceof Boolean) ? ((Boolean) v).booleanValue() : Boolean.parseBoolean(String.valueOf(v));
                        boolean expectedBool = Boolean.parseBoolean(resolved.toString());
                        assertEquals(expectedBool, actualBool, "VideoProgress.isCompleted should match");
                    }
                }
            }
            
            // === validate field: completedAt ===
            if (row.containsKey("completedAt")) {
                String expected = row.get("completedAt");
                Object v = actual.getCompletedAt();
                
                Object resolved = resolver.resolveAndValidate(expected, v, "completedAt", "VideoProgress");
                if (resolved != null) {
                    if (resolved.toString() == null || resolved.toString().isEmpty()) {
                        assertNull(v, "VideoProgress.completedAt should be null");
                    } else {
                        // Normalize LocalTime format: "09:00" -> "09:00:00"
                        String actualStr = (v instanceof java.time.LocalTime) 
                            ? ((java.time.LocalTime) v).format(java.time.format.DateTimeFormatter.ofPattern("HH:mm:ss"))
                            : (v == null) ? null : String.valueOf(v);
                        String expectedStr = (resolved instanceof java.time.LocalTime)
                            ? ((java.time.LocalTime) resolved).format(java.time.format.DateTimeFormatter.ofPattern("HH:mm:ss"))
                            : resolved.toString();
                        assertEquals(expectedStr, actualStr, "VideoProgress.completedAt should match");
                    }
                }
            }
        }
    }
}