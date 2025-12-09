package tw.waterballsa.api.stepdefs;

import org.springframework.stereotype.Component;
import org.springframework.test.web.servlet.MvcResult;
import io.cucumber.spring.ScenarioScope;
import java.util.HashMap;
import java.util.Map;

@Component
@ScenarioScope
public class ScenarioContext {
    private MvcResult lastResponse;
    private final Map<String, Object> context = new HashMap<>();

    public void setLastResponse(MvcResult lastResponse) {
        this.lastResponse = lastResponse;
    }

    public MvcResult getLastResponse() {
        return lastResponse;
    }

    public void setContext(String key, Object value) {
        context.put(key, value);
    }

    public Object getContext(String key) {
        return context.get(key);
    }
}
