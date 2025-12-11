package tw.waterballsa.api.stepdefs.given;

import io.cucumber.datatable.DataTable;
import io.cucumber.java.en.Given;
import org.springframework.beans.factory.annotation.Autowired;
import tw.waterballsa.api.stepdefs.Authenticator;
import tw.waterballsa.api.stepdefs.ScenarioContext;
import tw.waterballsa.api.stepdefs.helper.ISAFeatureArgumentResolver;

import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Given step definitions for login state
 * Handles patterns like:
 * - (UID="$User.id") 已經登入
 * - 已經登入, with table:
 */
public class Given_已經登入 {

    @Autowired
    private Authenticator authenticator;

    @Autowired
    private ScenarioContext scenarioContext;

    @Autowired
    private ISAFeatureArgumentResolver resolver;

    private static final Pattern UID_PATTERN = Pattern.compile("\\(UID=\"([^\"]+)\"\\)");

    /**
     * Handle login with inline UID parameter
     * Example: Given (UID="$User.id") 已經登入
     */
    @Given("\\(UID={string}\\) 已經登入")
    public void loginWithUid(String uidExpression) {
        // Resolve the UID variable
        Object resolvedUid = resolver.resolveVariable(uidExpression);
        Long userId = resolver.convertValue(resolvedUid.toString(), Long.class);

        // Generate JWT token for this user
        String token = authenticator.generateAccessToken(userId);

        // Store token in scenario context for subsequent API calls
        scenarioContext.setVariable("AUTH_TOKEN_" + userId, token);
        scenarioContext.setVariable("CURRENT_USER_ID", userId);
    }

    /**
     * Handle login with table containing refresh token or other parameters
     * Example: Given 已經登入, with table:
     *   | >refreshToken |
     *   | <refreshToken |
     */
    @Given("已經登入, with table:")
    public void loginWithTable(DataTable dataTable) {
        List<Map<String, String>> rows = dataTable.asMaps(String.class, String.class);
        List<String> headers = dataTable.row(0);

        for (Map<String, String> row : rows) {
            // Extract context keys for variable storage
            Map<Integer, String> contextKeyMap = resolver.parseContextKeys(headers);

            // If a userId is provided in the table, use it
            Long userId = null;
            if (row.containsKey("userId")) {
                Object resolved = resolver.resolveVariable(row.get("userId"));
                userId = resolver.convertValue(resolved.toString(), Long.class);
            } else {
                // Use current user ID from context
                Object currentUserId = scenarioContext.getVariable("CURRENT_USER_ID");
                if (currentUserId != null) {
                    userId = resolver.convertValue(currentUserId.toString(), Long.class);
                } else {
                    // Default to user ID 1 if not specified
                    userId = 1L;
                }
            }

            // Generate tokens
            String accessToken = authenticator.generateAccessToken(userId);

            // Store token in scenario context
            scenarioContext.setVariable("AUTH_TOKEN_" + userId, accessToken);
            scenarioContext.setVariable("CURRENT_USER_ID", userId);

            // Extract and store variables from table (for refreshToken, etc.)
            List<String> dataRow = dataTable.row(rows.indexOf(row) + 1);
            for (int i = 0; i < headers.size(); i++) {
                String header = headers.get(i);
                if (header.startsWith(">")) {
                    String varName = header.substring(1).trim();
                    if ("refreshToken".equals(varName)) {
                        // Generate and store refresh token if needed
                        scenarioContext.setVariable(varName, accessToken);
                    }
                } else if (header.startsWith("<")) {
                    String varName = header.substring(1).trim();
                    String value = dataRow.get(i);
                    if (value != null && !value.trim().isEmpty()) {
                        Object resolved = resolver.resolveVariable(value);
                        scenarioContext.setVariable(varName, resolved);
                    } else {
                        // Store the access token as the variable
                        scenarioContext.setVariable(varName, accessToken);
                    }
                }
            }
        }
    }

    /**
     * Get authentication token for a specific user ID
     * This is called by When steps that have (UID="...") prefix
     */
    public String getTokenForUser(String uidExpression) {
        Object resolvedUid = resolver.resolveVariable(uidExpression);
        Long userId = resolver.convertValue(resolvedUid.toString(), Long.class);

        // Check if token already exists in context
        String token = (String) scenarioContext.getVariable("AUTH_TOKEN_" + userId);
        if (token == null) {
            // Generate new token if not found
            token = authenticator.generateAccessToken(userId);
            scenarioContext.setVariable("AUTH_TOKEN_" + userId, token);
        }

        return token;
    }
}
