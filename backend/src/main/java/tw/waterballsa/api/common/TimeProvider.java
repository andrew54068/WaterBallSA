package tw.waterballsa.api.common;

import java.time.LocalDateTime;

public interface TimeProvider {
    LocalDateTime now();
}
