package tw.waterballsa.api.stepdefs.when;

import io.cucumber.java.en.When;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import tw.waterballsa.api.stepdefs.Authenticator;
import tw.waterballsa.api.stepdefs.ScenarioContext;
import tw.waterballsa.api.stepdefs.helper.ISAFeatureArgumentResolver;

/**
 * When step for logout
 */
public class API_登出 {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ScenarioContext scenarioContext;

    @Autowired
    private Authenticator authenticator;

    @Autowired
    private ISAFeatureArgumentResolver resolver;

    @When("\\(UID={string}\\) 登出")
    public void logout(String uidExpression) throws Exception {
        // Resolve the UID variable
        Object resolvedUid = resolver.resolveVariable(uidExpression);
        Long userId = resolver.convertValue(resolvedUid.toString(), Long.class);

        // Get or generate JWT token for this user
        String token = (String) scenarioContext.getVariable("AUTH_TOKEN_" + userId);
        if (token == null) {
            token = authenticator.generateAccessToken(userId);
        }

        // Build HTTP request
        MockHttpServletRequestBuilder request = MockMvcRequestBuilders
                .post("/auth/logout")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON);

        // Execute request
        MvcResult result = mockMvc.perform(request).andReturn();

        // Store response in scenario context
        scenarioContext.setLastResponse(result);
    }
}
