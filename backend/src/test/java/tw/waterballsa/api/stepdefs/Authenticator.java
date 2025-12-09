package tw.waterballsa.api.stepdefs;

import org.springframework.stereotype.Component;

import org.springframework.beans.factory.annotation.Autowired;
import tw.waterballsa.api.security.JwtUtils;
import tw.waterballsa.api.entity.User;
import tw.waterballsa.api.stepdefs.ScenarioContext;

@Component
public class Authenticator {
    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private ScenarioContext context;

    public String getToken(Object userOrId) {
        String userId;
        if (userOrId instanceof User) {
            userId = ((User) userOrId).getId().toString();
        } else if (userOrId instanceof Long) {
            userId = userOrId.toString();
        } else {
            // Try to resolve from context if it's a string key?
            // But usually resolveVariable already returns the object.
            userId = userOrId.toString();
        }
        return jwtUtils.generateAccessToken(userId);
    }
}
