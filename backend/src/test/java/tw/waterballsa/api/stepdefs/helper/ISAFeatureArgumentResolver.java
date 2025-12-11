package tw.waterballsa.api.stepdefs.helper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import tw.waterballsa.api.stepdefs.ScenarioContext;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * ISA Feature Argument Resolver
 * Handles variable resolution, context extraction, and parameter parsing for Cucumber tests
 */
@Component
public class ISAFeatureArgumentResolver {

    @Autowired
    private ScenarioContext scenarioContext;

    // Pattern to match variable references like $userId or ${user.id}
    private static final Pattern VARIABLE_PATTERN = Pattern.compile("\\$\\{?([A-Za-z0-9_.]+)\\}?");

    // Pattern to match column prefixes (P:, Q:, H:)
    private static final Pattern PREFIX_PATTERN = Pattern.compile("^([PQH]):(.+)$");

    /**
     * Resolve a variable value from scenario context or return as-is
     * Supports patterns: $varName, ${varName}, $entity.field
     */
    public Object resolveVariable(String value) {
        if (value == null || value.trim().isEmpty()) {
            return value;
        }

        String trimmed = value.trim();

        // Handle quoted strings - remove quotes and return literal
        if (trimmed.startsWith("\"") && trimmed.endsWith("\"")) {
            return trimmed.substring(1, trimmed.length() - 1);
        }

        // Handle @time() function for LocalDateTime
        if (trimmed.matches("@time\\(\"([^\"]+)\"\\)")) {
            Pattern timePattern = Pattern.compile("@time\\(\"([^\"]+)\"\\)");
            Matcher timeMatcher = timePattern.matcher(trimmed);
            if (timeMatcher.matches()) {
                String dateStr = timeMatcher.group(1);
                try {
                    // Parse date string as LocalDateTime (assuming start of day if time not specified)
                    if (dateStr.length() == 10) { // yyyy-MM-dd format
                        return LocalDateTime.parse(dateStr + "T00:00:00");
                    } else {
                        return LocalDateTime.parse(dateStr);
                    }
                } catch (Exception e) {
                    // If parsing fails, return the original value
                    return trimmed;
                }
            }
        }

        // Handle variable references
        Matcher matcher = VARIABLE_PATTERN.matcher(trimmed);
        if (matcher.matches()) {
            String varName = matcher.group(1);
            Object resolved = scenarioContext.getVariable(varName);
            return resolved != null ? resolved : value;
        }

        // Check for partial variable reference in string
        if (trimmed.contains("$")) {
            StringBuffer result = new StringBuffer();
            Matcher partialMatcher = VARIABLE_PATTERN.matcher(trimmed);
            while (partialMatcher.find()) {
                String varName = partialMatcher.group(1);
                Object resolved = scenarioContext.getVariable(varName);
                String replacement = resolved != null ? resolved.toString() : partialMatcher.group(0);
                partialMatcher.appendReplacement(result, Matcher.quoteReplacement(replacement));
            }
            partialMatcher.appendTail(result);
            return result.toString();
        }

        // Try to parse as number
        try {
            if (trimmed.contains(".")) {
                return new BigDecimal(trimmed);
            } else {
                return Long.parseLong(trimmed);
            }
        } catch (NumberFormatException e) {
            // Not a number, continue
        }

        // Try to parse as boolean
        if ("true".equalsIgnoreCase(trimmed) || "false".equalsIgnoreCase(trimmed)) {
            return Boolean.parseBoolean(trimmed);
        }

        // Try to parse as LocalTime (HH:mm or HH:mm:ss)
        try {
            if (trimmed.matches("\\d{2}:\\d{2}(:\\d{2})?")) {
                if (trimmed.length() == 5) {
                    return LocalTime.parse(trimmed + ":00", DateTimeFormatter.ofPattern("HH:mm:ss"));
                } else {
                    return LocalTime.parse(trimmed, DateTimeFormatter.ofPattern("HH:mm:ss"));
                }
            }
        } catch (Exception e) {
            // Not a time, continue
        }

        return trimmed;
    }

    /**
     * Resolve and validate expected value against actual value
     * Handles special cases like null, empty, and type conversions
     */
    public Object resolveAndValidate(String expected, Object actual, String fieldName, String entityName) {
        Object resolved = resolveVariable(expected);

        // Handle null/empty expectations
        if (resolved == null || resolved.toString().isEmpty() || "null".equalsIgnoreCase(resolved.toString())) {
            return null;
        }

        // Handle wildcard (any value is acceptable)
        if ("*".equals(resolved.toString())) {
            return null; // Don't validate
        }

        return resolved;
    }

    /**
     * Parse context keys from header row
     * Identifies columns with < or > prefix for variable extraction/storage
     * @param headers List of column headers
     * @return Map of column index to variable name
     */
    public Map<Integer, String> parseContextKeys(List<String> headers) {
        Map<Integer, String> contextKeys = new HashMap<>();
        for (int i = 0; i < headers.size(); i++) {
            String headerValue = headers.get(i);
            if (headerValue == null || headerValue.trim().isEmpty()) {
                continue;
            }
            String header = headerValue.trim();
            if (header.startsWith("<") || header.startsWith(">")) {
                String varName = header.substring(1).trim();
                contextKeys.put(i, varName);
            }
        }
        return contextKeys;
    }

    /**
     * Extract variables from response and store in scenario context
     * @param dataRow The data row values
     * @param contextKeyMap Map of column index to variable name
     * @param responseData Response data from API call
     */
    public void extractAndStoreVariables(List<String> dataRow, Map<Integer, String> contextKeyMap, Map<String, Object> responseData) {
        for (Map.Entry<Integer, String> entry : contextKeyMap.entrySet()) {
            int columnIndex = entry.getKey();
            String varName = entry.getValue();

            if (columnIndex < dataRow.size()) {
                String dataValue = dataRow.get(columnIndex);
                Object extractedValue = null;

                // Extract from response if header starts with >
                if (responseData != null) {
                    // Handle "Entity.field" pattern (e.g., "Purchase.id")
                    String fieldName = varName;
                    String entityName = null;

                    if (varName.contains(".")) {
                        String[] parts = varName.split("\\.");
                        if (parts.length == 2) {
                            entityName = parts[0].toLowerCase(); // Extract "purchase" from "Purchase.id"
                            fieldName = parts[1]; // Extract "id" from "Purchase.id"
                        }
                    }

                    // Try: exact fieldName, entityField (e.g., "purchaseId"), then with entity prefix
                    if (responseData.containsKey(fieldName)) {
                        extractedValue = responseData.get(fieldName);
                        scenarioContext.setVariable(varName, extractedValue);
                    } else if (entityName != null) {
                        // Try entityFieldName pattern (e.g., "purchaseId")
                        String entityFieldName = entityName + fieldName.substring(0, 1).toUpperCase() + fieldName.substring(1);
                        if (responseData.containsKey(entityFieldName)) {
                            extractedValue = responseData.get(entityFieldName);
                            scenarioContext.setVariable(varName, extractedValue);
                        }
                    }
                }

                // Also store with the name from data row if it has < prefix
                if (dataValue != null && dataValue.trim().startsWith("<")) {
                    String dataVarName = dataValue.trim().substring(1).trim();
                    if (extractedValue != null) {
                        scenarioContext.setVariable(dataVarName, extractedValue); // Store as "purchaseId"
                    }
                }
            }
        }
    }

    /**
     * Parse column prefix (P:, Q:, H:) and extract name
     * @param column Column header
     * @return ColumnInfo with prefix and name
     */
    public ColumnInfo parseColumnPrefix(String column) {
        Matcher matcher = PREFIX_PATTERN.matcher(column.trim());
        if (matcher.matches()) {
            return new ColumnInfo(matcher.group(1), matcher.group(2));
        }
        return new ColumnInfo("", column.trim());
    }

    /**
     * Column information holder
     */
    public static class ColumnInfo {
        public final String prefix; // P, Q, H, or empty
        public final String name;   // Column name without prefix

        public ColumnInfo(String prefix, String name) {
            this.prefix = prefix;
            this.name = name;
        }
    }

    /**
     * Convert a string value to a specific type
     */
    public <T> T convertValue(String value, Class<T> targetType) {
        Object resolved = resolveVariable(value);

        if (resolved == null) {
            return null;
        }

        // Handle type conversions
        if (targetType == String.class) {
            return targetType.cast(resolved.toString());
        } else if (targetType == Long.class) {
            if (resolved instanceof Number) {
                return targetType.cast(((Number) resolved).longValue());
            }
            return targetType.cast(Long.parseLong(resolved.toString()));
        } else if (targetType == Integer.class) {
            if (resolved instanceof Number) {
                return targetType.cast(((Number) resolved).intValue());
            }
            return targetType.cast(Integer.parseInt(resolved.toString()));
        } else if (targetType == BigDecimal.class) {
            if (resolved instanceof BigDecimal) {
                return targetType.cast(resolved);
            }
            return targetType.cast(new BigDecimal(resolved.toString()));
        } else if (targetType == Boolean.class) {
            return targetType.cast(Boolean.parseBoolean(resolved.toString()));
        } else if (targetType == LocalTime.class) {
            if (resolved instanceof LocalTime) {
                return targetType.cast(resolved);
            }
            return targetType.cast(LocalTime.parse(resolved.toString(), DateTimeFormatter.ofPattern("HH:mm:ss")));
        } else if (targetType == LocalDateTime.class) {
            if (resolved instanceof LocalDateTime) {
                return targetType.cast(resolved);
            }
            return targetType.cast(LocalDateTime.parse(resolved.toString()));
        }

        return targetType.cast(resolved);
    }

    /**
     * Store a variable in scenario context
     */
    public void storeVariable(String key, Object value) {
        scenarioContext.setVariable(key, value);
    }

    /**
     * Get a variable from scenario context
     */
    public Object getVariable(String key) {
        return scenarioContext.getVariable(key);
    }
}
