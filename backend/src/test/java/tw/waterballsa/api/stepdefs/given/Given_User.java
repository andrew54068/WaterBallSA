package tw.waterballsa.api.stepdefs.given;

import io.cucumber.java.en.Given;
import io.cucumber.datatable.DataTable;
import org.springframework.beans.factory.annotation.Autowired;
import tw.waterballsa.api.entity.User;
import tw.waterballsa.api.repository.UserRepository;
import tw.waterballsa.api.stepdefs.ScenarioContext;
import tw.waterballsa.api.stepdefs.helper.ISAFeatureArgumentResolver;

import java.util.List;
import java.util.Map;
import java.util.Random;

public class Given_User {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ScenarioContext scenarioContext;

    @Autowired
    private ISAFeatureArgumentResolver resolver;

    @Given("準備一個User, with table:")
    public void prepareUser(DataTable dataTable) {
        List<Map<String, String>> rows = dataTable.asMaps(String.class, String.class);
        Map<String, String> row = rows.get(0);

        String googleId = row.get("googleId");
        User user = userRepository.findByGoogleId(googleId)
                .orElseGet(() -> {
                    User newUser = User.builder()
                            .id(new Random().nextLong()) // Simple ID generation - though JPA usually ignores if
                                                         // IDENTITY logic is used
                            .googleId(googleId)
                            .email(row.get("email"))
                            .name(row.get("name"))
                            .role(row.get("role")) // Also set role if provided in table? Table might not have role.
                            .build();
                    // Actually let's trust JPA for ID generation if we save.
                    // But the Builder sets ID. If Entity uses @GeneratedValue, setting ID might be
                    // ignored or cause detached entity error.
                    // The original code set ID manually.
                    newUser.setId(null); // Let DB generate ID
                    return userRepository.save(newUser);
                });

        // Update fields if needed? For now assume finding existing is enough.

        // Store variable like User.id -> <userId
        // The table header >User.id means we need to store the created user's ID into
        // context with key "userId" (from <userId value)
        // Wait, the header is | >User.id | and value is | <userId |
        // Actually, looking at resolver usage in generated code:
        // contextKeyMap.put(i, header.substring(1)); // >User.id -> User.id
        // And then we store the value.
        // But here we are producing the value.

        List<String> headers = dataTable.row(0);
        for (String header : headers) {
            if (header.startsWith(">")) {
                String varName = header.substring(1); // e.g., "User.id"
                String valueOrVar = row.get(header); // e.g., "<userId"

                // If the value is a variable definition like <userId, we might want to store
                // it?
                // Actually the pattern seems to be:
                // >User.id (column name indicates what property of the object)
                // <userId (cell value indicates the variable name to store it as)

                if (valueOrVar.startsWith("<")) {
                    String contextKey = valueOrVar.substring(1);
                    if (varName.equals("User.id")) {
                        scenarioContext.setContext(contextKey, user.getId());
                    }
                }
            }
        }

        // Also store the User object itself if needed
        scenarioContext.setContext("User", user);
    }

    @Given("\\(UID={string}\\) 已經登入")
    public void userLoggedIn(String userIdVar) {
        // Resolve variable "$User.id"
        Object userIdObj = resolver.resolveVariable(userIdVar);
        // In a real auth scenario, we might generate a JWT here and store it
        // For now, we assume the Auth steps handles login or we mock it
        // The "已登入" step usually implies setting up the security context or getting a
        // token

        // However, based on API_Google_Oauth_登入.java, it uses "token" variable.
        // We probably need to generate a dummy token.
        scenarioContext.setContext("token", "dummy-token-for-" + userIdObj);
    }
}
