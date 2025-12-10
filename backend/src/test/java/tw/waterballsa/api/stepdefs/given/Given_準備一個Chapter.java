package tw.waterballsa.api.stepdefs.given;

import io.cucumber.java.en.Given;
import io.cucumber.datatable.DataTable;
import org.springframework.beans.factory.annotation.Autowired;
import tw.waterballsa.api.entity.Chapter;
import tw.waterballsa.api.repository.ChapterRepository;
import tw.waterballsa.api.stepdefs.helper.ISAFeatureArgumentResolver;
import java.util.List;
import java.util.Map;

public class Given_準備一個Chapter {
    @Autowired
    private ChapterRepository chapterRepository;
    @Autowired
    private ISAFeatureArgumentResolver resolver;

    @Given("準備一個Chapter, for curriculum {word}, with table:")
    public void prepareChapter(String curriculumIdVar, DataTable dataTable) {
        Long curriculumId = Long.parseLong(resolver.resolveVariable(curriculumIdVar).toString());
        
        List<Map<String, String>> rows = dataTable.asMaps(String.class, String.class);
        for (Map<String, String> row : rows) {
             Chapter chapter = Chapter.builder()
                    .curriculumId(curriculumId)
                    .title(row.get("title"))
                    .description(row.get("description"))
                    .orderIndex(Integer.parseInt(row.get("orderIndex")))
                    .build();
             chapterRepository.save(chapter);
        }
    }
}
