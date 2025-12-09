package tw.waterballsa.api.stepdefs.when;

import io.cucumber.java.en.When;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.MockMvc;
import tw.waterballsa.api.stepdefs.Authenticator;
import tw.waterballsa.api.stepdefs.helper.ISAFeatureArgumentResolver;
import tw.waterballsa.api.stepdefs.ScenarioContext;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class API_登出 {
    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private Authenticator authenticator;
    @Autowired
    private ISAFeatureArgumentResolver resolver;

    @Autowired
    private ScenarioContext context;

    @When("\\({word}\\) 登出")
    public void logout(String variableName) throws Exception {
        Object resolvedId = resolver.resolveVariable(variableName);
        // resolveVariable returns the actual object or ID.
        // If it returns User object, Authenticator handles it.
        // If it returns ID, Authenticator handles it.
        String token = authenticator.getToken(resolvedId);

        MvcResult result = mockMvc.perform(post("/auth/logout")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andReturn();

        context.setLastResponse(result);
    }
}
