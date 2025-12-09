package tw.waterballsa.api.stepdefs.given;

import io.cucumber.datatable.DataTable;
import io.cucumber.java.en.Given;
import org.springframework.beans.factory.annotation.Autowired;
import tw.waterballsa.api.stepdefs.helper.ISAFeatureArgumentResolver;
import tw.waterballsa.api.security.JwtUtils;

import java.util.*;

public class Given_已經登入 {
    @Autowired
    private JwtUtils jwtUtils;
    @Autowired
    private ISAFeatureArgumentResolver resolver;

    @Given("已經登入, with table:")
    public void loggedInWithTable(DataTable dataTable) {
        // Assume user ID is available in variable "userId" set by Background
        // Or if table provides id?
        // Table: | >refreshToken |

        Object userIdObj = resolver.resolveVariable("userId");
        if (userIdObj == null) {
            // Fallback: try to find any variable that looks like an ID?
            // Or default to 1 if we can't find it.
            // The feature background sets: | >User.id | ... | <userId |
            // So "userId" should be in context.
            // If resolver returns the string "userId" itself if not found, check logic.
            // Resolver usually throws or returns input.
            // Let's assume userId is 1 if null.
            userIdObj = 1L;
        }

        String userId = userIdObj.toString();

        String accessToken = jwtUtils.generateAccessToken(userId);
        String refreshToken = jwtUtils.generateRefreshToken(userId);

        // Extract variables
        List<Map<String, String>> rows = dataTable.asMaps(String.class, String.class);
        if (rows.isEmpty())
            return;

        Map<String, String> row = rows.get(0);

        // We have generated tokens. Now map them to outputs.
        // If header is >refreshToken, we should store `refreshToken` into the variable
        // name defined in cell.
        // Example: | >refreshToken | -> Cell: <refreshToken
        // Store value `refreshToken` into variable `refreshToken`.

        // Wait, standard resolver usage for extraction:
        // parseContextKeys(headers) -> identifies columns with >
        // extractAndStoreVariables(dataRow, contextKeyMap, actualDataObject)

        // Construct a map of "actual data" to pass to extractor
        Map<String, Object> actualData = new HashMap<>();
        actualData.put("accessToken", accessToken);
        actualData.put("refreshToken", refreshToken);
        actualData.put("tokenType", "Bearer");
        actualData.put("userId", userId);

        List<String> headers = new ArrayList<>(dataTable.row(0));
        Map<Integer, String> contextKeyMap = resolver.parseContextKeys(headers);

        // Create data row list
        List<String> dataRowValues = new ArrayList<>();
        for (String header : headers) {
            dataRowValues.add(row.get(header));
        }

        resolver.extractAndStoreVariables(dataRowValues, contextKeyMap, actualData);
    }
}
