package tw.waterballsa.api.common;

import org.springframework.stereotype.Component;
import java.time.LocalDateTime;

@Component
public class DefaultTimeProvider implements TimeProvider {
    @Override
    public LocalDateTime now() {
        return LocalDateTime.now();
    }
}
