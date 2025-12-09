package tw.waterballsa.api.stepdefs;

import io.cucumber.spring.CucumberContextConfiguration;
import org.mockito.Mockito;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import tw.waterballsa.api.WaterBallSAApplication;
import tw.waterballsa.api.entity.Purchase;
import tw.waterballsa.api.entity.User;
import tw.waterballsa.api.entity.VideoProgress;
import tw.waterballsa.api.repository.PurchaseRepository;
import tw.waterballsa.api.repository.UserRepository;
import tw.waterballsa.api.repository.VideoProgressRepository;

import jakarta.annotation.PostConstruct;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicLong;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@CucumberContextConfiguration
@SpringBootTest(classes = WaterBallSAApplication.class)
@AutoConfigureMockMvc
public class CucumberConfig {

    @MockBean
    private tw.waterballsa.api.common.TimeProvider timeProvider;

    @PostConstruct
    public void setupMocks() {
        when(timeProvider.now()).thenReturn(java.time.LocalDateTime.now());
    }
}
