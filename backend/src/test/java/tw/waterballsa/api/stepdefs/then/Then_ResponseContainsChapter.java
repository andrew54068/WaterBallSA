package tw.waterballsa.api.stepdefs.then;

import io.cucumber.java.en.Then;
import io.cucumber.datatable.DataTable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.MvcResult;
import tw.waterballsa.api.stepdefs.ScenarioContext;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import java.util.Map;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

public class Then_ResponseContainsChapter {
    @Autowired
    private Then_ResponseContainsCurriculum delegate; // Reuse logic

    @Then("^回應列表包含章節, with table:$")
    public void verify(DataTable dataTable) throws Exception {
        delegate.responseListContains(dataTable);
    }
}
