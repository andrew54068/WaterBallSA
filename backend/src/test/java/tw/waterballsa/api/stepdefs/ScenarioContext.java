package tw.waterballsa.api.stepdefs;

import org.springframework.stereotype.Component;
import org.springframework.test.web.servlet.MvcResult;

import java.util.HashMap;
import java.util.Map;

@Component
public class ScenarioContext {

    private MvcResult lastResponse;
    private final Map<String, Object> variables = new HashMap<>();

    public MvcResult getLastResponse() {
        return lastResponse;
    }

    public void setLastResponse(MvcResult lastResponse) {
        this.lastResponse = lastResponse;
    }

    public void setVariable(String key, Object value) {
        variables.put(key, value);
    }

    public Object getVariable(String key) {
        return variables.get(key);
    }

    public boolean hasVariable(String key) {
        return variables.containsKey(key);
    }

    public void clear() {
        lastResponse = null;
        variables.clear();
    }
}
