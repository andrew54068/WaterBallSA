package tw.waterballsa.api.stepdefs.given;

import io.cucumber.datatable.DataTable;
import io.cucumber.java.en.Given;
import org.springframework.beans.factory.annotation.Autowired;
import tw.waterballsa.api.entity.User;
import tw.waterballsa.api.repository.UserRepository;
import tw.waterballsa.api.stepdefs.helper.ISAFeatureArgumentResolver;

import java.util.List;
import java.util.Map;

public class Given_準備一個User {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ISAFeatureArgumentResolver resolver;

    @Given("準備一個User, with table:")
    public void prepareUser(DataTable dataTable) {
        List<Map<String, String>> rows = dataTable.asMaps(String.class, String.class);
        List<String> headers = dataTable.row(0);

        for (Map<String, String> row : rows) {
            // Parse context keys for variable extraction
            Map<Integer, String> contextKeyMap = resolver.parseContextKeys(headers);

            User.UserBuilder builder = User.builder();

            // Parse all fields
            if (row.containsKey("googleId")) {
                Object resolved = resolver.resolveVariable(row.get("googleId"));
                builder.googleId(resolved != null ? resolved.toString() : null);
            }

            if (row.containsKey("email")) {
                Object resolved = resolver.resolveVariable(row.get("email"));
                builder.email(resolved != null ? resolved.toString() : null);
            }

            if (row.containsKey("name")) {
                Object resolved = resolver.resolveVariable(row.get("name"));
                builder.name(resolved != null ? resolved.toString() : null);
            }

            if (row.containsKey("profilePicture")) {
                Object resolved = resolver.resolveVariable(row.get("profilePicture"));
                builder.profilePicture(resolved != null ? resolved.toString() : null);
            }

            // Save entity
            User user = userRepository.save(builder.build());

            // Extract and store variables (handle > prefix in headers)
            for (Map.Entry<Integer, String> entry : contextKeyMap.entrySet()) {
                int columnIndex = entry.getKey();
                String varName = entry.getValue();

                if (columnIndex < headers.size()) {
                    String header = headers.get(columnIndex);
                    if (header.startsWith(">")) {
                        // Extract from entity
                        if (varName.contains(".")) {
                            String[] parts = varName.split("\\.");
                            if (parts.length == 2 && "id".equals(parts[1])) {
                                resolver.storeVariable(varName, user.getId());
                            }
                        } else if ("id".equals(varName)) {
                            resolver.storeVariable(varName, user.getId());
                        }
                    }
                }
            }

            // Also store with common naming patterns
            List<String> dataRow = dataTable.row(rows.indexOf(row) + 1);
            for (int i = 0; i < headers.size(); i++) {
                String header = headers.get(i);
                String dataValue = i < dataRow.size() ? dataRow.get(i) : null;

                // Check header for > prefix (output marker)
                if (header.startsWith(">")) {
                    String varName = header.substring(1).trim();
                    if (varName.contains(".id") || varName.equals("id")) {
                        resolver.storeVariable(varName, user.getId());
                    }
                }

                // Check data value for < prefix (variable storage marker)
                if (dataValue != null && dataValue.trim().startsWith("<")) {
                    String varName = dataValue.trim().substring(1).trim();
                    resolver.storeVariable(varName, user.getId());
                }
            }
        }
    }
}
