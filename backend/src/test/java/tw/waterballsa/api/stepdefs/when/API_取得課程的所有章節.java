package tw.waterballsa.api.stepdefs.when;

import io.cucumber.java.en.When;
import io.cucumber.datatable.DataTable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.*;
import com.fasterxml.jackson.core.type.TypeReference;
import tw.waterballsa.api.stepdefs.Authenticator;
import tw.waterballsa.api.stepdefs.helper.ISAFeatureArgumentResolver;
import java.util.*;
import java.util.regex.*;

public class API_取得課程的所有章節 {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private tw.waterballsa.api.stepdefs.ScenarioContext scenarioContext;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private Authenticator authenticator;

    @Autowired
    private ISAFeatureArgumentResolver resolver;

    // Hard-coded from OpenAPI spec during code generation
    private static final Set<String> PATH_PARAMS = Set.of("curriculumId");
    private static final Set<String> QUERY_PARAMS = Set.of();
    private static final Set<String> HEADER_PARAMS = Set.of();

    @When("^取得課程的所有章節, call table:$")
    public void invoke(DataTable dataTable) throws Exception {
        Map<String, String> row = dataTable.asMaps(String.class, String.class).get(0);
        List<String> headers = new ArrayList<>(dataTable.row(0));

        // 1. Parse context keys for VAR-System (handle > symbol)
        Map<Integer, String> contextKeyMap = resolver.parseContextKeys(headers);

        // 2. No authentication required for this API call
        String token = null;

        // 3. Parse column prefixes and categorize parameters
        Map<String, String> pathParams = new HashMap<>();
        Map<String, String> queryParams = new HashMap<>();
        Map<String, String> bodyParams = new HashMap<>();

        for (String header : headers) {
            String cleanHeader = header.trim();
            String value = row.get(header);

            if (value == null)
                continue;

            // Skip VAR-System extraction columns
            if (cleanHeader.startsWith("<") || cleanHeader.startsWith(">")) {
                continue;
            }

            ISAFeatureArgumentResolver.ColumnInfo columnInfo = resolver.parseColumnPrefix(cleanHeader);
            Object resolvedValue = resolver.resolveVariable(value);

            // Handle LocalTime objects - ensure they are serialized as "HH:mm:ss" format
            String actualValue;
            if (resolvedValue instanceof java.time.LocalTime) {
                actualValue = ((java.time.LocalTime) resolvedValue)
                        .format(java.time.format.DateTimeFormatter.ofPattern("HH:mm:ss"));
            } else {
                actualValue = resolvedValue != null ? resolvedValue.toString() : null;
            }

            // Case 1: 明確指定前綴 (P:/Q:/H:) - 直接分類
            if (!columnInfo.prefix.isEmpty()) {
                switch (columnInfo.prefix) {
                    case "P":
                        pathParams.put(columnInfo.name, actualValue);
                        break;
                    case "Q":
                        queryParams.put(columnInfo.name, actualValue);
                        break;
                    case "H":
                        // Headers are handled separately, skip for now
                        break;
                }
                continue; // 有明確前綴不放入 body
            }

            // Case 2: 無前綴 - 同名參數自動填寫 + body
            String paramName = columnInfo.name;
            if (PATH_PARAMS.contains(paramName) && !pathParams.containsKey(paramName)) {
                pathParams.put(paramName, actualValue);
            }
            if (QUERY_PARAMS.contains(paramName) && !queryParams.containsKey(paramName)) {
                queryParams.put(paramName, actualValue);
            }

            // 無前綴一律放入 body
            bodyParams.put(paramName, actualValue);
        }

        // 4. Build URL with path parameters
        String url = "/chapters/curriculum/{curriculumId}";
        for (Map.Entry<String, String> entry : pathParams.entrySet()) {
            url = url.replace("{" + entry.getKey() + "}", entry.getValue());
        }

        // 5. Build request
        MockHttpServletRequestBuilder request = MockMvcRequestBuilders.get(url);

        // 6. Add authentication header
        if (token != null && !token.isEmpty()) {
            request.header("Authorization", "Bearer " + token);
        }

        // 7. Add query parameters
        for (Map.Entry<String, String> entry : queryParams.entrySet()) {
            request.queryParam(entry.getKey(), entry.getValue());
        }

        // 8. Add request body
        if (!bodyParams.isEmpty()) {
            ObjectNode body = objectMapper.createObjectNode();
            for (Map.Entry<String, String> entry : bodyParams.entrySet()) {
                setJson(body, entry.getKey(), entry.getValue());
            }
            String json = objectMapper.writeValueAsString(body);
            request.contentType(MediaType.APPLICATION_JSON).content(json);
        }

        // 9. Execute request
        MvcResult result = mockMvc.perform(request).andReturn();

        // 10. Store response in scenario context
        scenarioContext.setLastResponse(result);

        // 11. Extract and store variables from response (handle < symbol)
        if (!contextKeyMap.isEmpty()) {
            String responseBody = result.getResponse().getContentAsString();
            if (responseBody != null && !responseBody.trim().isEmpty()) {
                try {
                    Map<String, Object> executionVariable = objectMapper.readValue(
                            responseBody,
                            new TypeReference<Map<String, Object>>() {
                            });

                    // Extract data row values for variable extraction
                    List<String> dataRow = new ArrayList<>();
                    for (String header : headers) {
                        dataRow.add(row.get(header));
                    }

                    resolver.extractAndStoreVariables(dataRow, contextKeyMap, executionVariable);
                } catch (Exception e) {
                    // If response is not a JSON object (e.g., array or empty), skip variable
                    // extraction
                }
            }
        }
    }

    // ----- Helpers: 將 "a.b[0].c" 路徑塞進 ObjectNode / ArrayNode -----
    private static final Pattern SEG = Pattern.compile("([A-Za-z0-9_]+)(?:\\[(\\d+)\\])?");

    private static void setJson(ObjectNode root, String path, String value) {
        if (path == null || path.isEmpty())
            return;
        String[] parts = path.split("\\.");
        ObjectNode curr = root;

        for (int i = 0; i < parts.length; i++) {
            Matcher m = SEG.matcher(parts[i]);
            if (!m.matches())
                throw new IllegalArgumentException("Bad path: " + path);
            String name = m.group(1);
            String idxStr = m.group(2);

            boolean last = (i == parts.length - 1);

            if (idxStr == null) {
                // object field
                if (last) {
                    curr.set(name, toNode(value));
                } else {
                    curr = curr.with(name);
                }
            } else {
                // array field
                ArrayNode arr = ensureArray(curr, name);
                int idx = Integer.parseInt(idxStr);
                ensureArraySize(arr, idx + 1);

                if (last) {
                    arr.set(idx, toNode(value));
                } else {
                    JsonNode elem = arr.get(idx);
                    if (!(elem instanceof ObjectNode)) {
                        ObjectNode child = JsonNodeFactory.instance.objectNode();
                        arr.set(idx, child);
                        curr = child;
                    } else {
                        curr = (ObjectNode) elem;
                    }
                }
            }
        }
    }

    private static ArrayNode ensureArray(ObjectNode parent, String field) {
        JsonNode n = parent.get(field);
        if (!(n instanceof ArrayNode)) {
            ArrayNode arr = JsonNodeFactory.instance.arrayNode();
            parent.set(field, arr);
            return arr;
        }
        return (ArrayNode) n;
    }

    private static void ensureArraySize(ArrayNode arr, int size) {
        while (arr.size() < size)
            arr.add(NullNode.instance);
    }

    private static JsonNode toNode(String v) {
        if (v == null)
            return NullNode.instance;
        String s = v.trim();
        if ("true".equalsIgnoreCase(s) || "false".equalsIgnoreCase(s)) {
            return BooleanNode.valueOf(Boolean.parseBoolean(s));
        }
        try {
            return IntNode.valueOf(Integer.parseInt(s));
        } catch (Exception ignore) {
        }
        try {
            return DoubleNode.valueOf(Double.parseDouble(s));
        } catch (Exception ignore) {
        }
        return TextNode.valueOf(v);
    }
}
