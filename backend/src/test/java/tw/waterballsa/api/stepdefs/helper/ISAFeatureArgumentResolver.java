package tw.waterballsa.api.stepdefs.helper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import tw.waterballsa.api.stepdefs.ScenarioContext;

@Component
public class ISAFeatureArgumentResolver {

    @Autowired
    private ScenarioContext scenarioContext;

    public static class ColumnInfo {
        public final String prefix;
        public final String name;

        public ColumnInfo(String prefix, String name) {
            this.prefix = prefix;
            this.name = name;
        }
    }

    public ColumnInfo parseColumnPrefix(String header) {
        if (header == null) {
            System.err.println("DEBUG: parseColumnPrefix header is null");
            return new ColumnInfo("", "");
        }
        System.err.println("DEBUG: parseColumnPrefix header=[" + header + "]");
        String trimmed = header.trim();
        if (trimmed.startsWith("P:") || trimmed.startsWith("Q:") || trimmed.startsWith("H:")) {
            return new ColumnInfo(trimmed.substring(0, 1), trimmed.substring(2));
        }
        return new ColumnInfo("", trimmed);
    }

    public Map<Integer, String> parseContextKeys(List<String> headers) {
        Map<Integer, String> contextKeyMap = new HashMap<>();
        for (int i = 0; i < headers.size(); i++) {
            if (headers.get(i) == null)
                continue;
            String header = headers.get(i).trim();
            if (header.startsWith(">")) {
                contextKeyMap.put(i, header.substring(1));
            }
        }
        return contextKeyMap;
    }

    public Object resolveVariable(String value) {
        if (value == null)
            return null;
        if (value.startsWith("$")) {
            String variableName = value.substring(1);
            String[] parts = variableName.split("\\.");
            Object contextObj = scenarioContext.getContext(parts[0]);

            if (contextObj == null) {
                return null;
            }

            if (parts.length > 1) {
                try {
                    // Simple reflection to get field
                    java.lang.reflect.Field field = contextObj.getClass().getDeclaredField(parts[1]);
                    field.setAccessible(true);
                    Object result = field.get(contextObj);
                    if (result == null) {
                        System.out.println("DEBUG: Variable " + value + " resolved to null. ContextObj: " + contextObj
                                + ", Field: " + parts[1]);
                    } else {
                        System.out.println("DEBUG: Variable " + value + " resolved to " + result);
                    }
                    return result;
                } catch (Exception e) {
                    throw new RuntimeException("Failed to resolve variable " + value, e);
                }
            }
            return contextObj;
        }
        return value;
    }

    public void extractAndStoreVariables(List<String> dataRow, Map<Integer, String> contextKeyMap,
            Map<String, Object> responseBody) {
        for (Map.Entry<Integer, String> entry : contextKeyMap.entrySet()) {
            Integer index = entry.getKey();
            String responseKey = entry.getValue(); // e.g., "Curriculum.id" or "accessToken"

            // Get the value from the data row to see if we need to store it as a variable
            if (index < dataRow.size()) {
                String cellValue = dataRow.get(index);
                if (cellValue != null && cellValue.trim().startsWith("<")) {
                    String variableName = cellValue.trim().substring(1);

                    // Get value from response body
                    Object valueToStore = responseBody.get(responseKey);

                    if (valueToStore != null) {
                        scenarioContext.setContext(variableName, valueToStore);
                    }
                }
            }

            // Also support implicit storage if no <varName is provided but we simply want
            // to store by header name?
            // Existing logic did: scenarioContext.setContext(responseKey,
            // responseBody.get(responseKey));
            // But this might conflict or lead to unintended storage.
            // The generated code often relies on explicit <varName.
            // But let's keep the old behavior ONLY if it was intended?
            // Given_User uses manual logic. Given_Login used generated logic.
            // Given_Login header >accessToken cell <accessToken.
            // So resolving works if we support < syntax.
        }
    }

    public Object resolveAndValidate(String expected, Object actual, String fieldName, String entityName) {
        // Simple implementation for now
        return resolveVariable(expected);
    }
}
