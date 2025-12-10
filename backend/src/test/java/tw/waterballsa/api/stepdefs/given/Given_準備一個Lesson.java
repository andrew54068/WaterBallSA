package tw.waterballsa.api.stepdefs.given;

import io.cucumber.java.en.Given;
import io.cucumber.datatable.DataTable;
import org.springframework.beans.factory.annotation.Autowired;
import tw.waterballsa.api.entity.Chapter;
import tw.waterballsa.api.entity.Lesson;
import tw.waterballsa.api.repository.ChapterRepository;
import tw.waterballsa.api.repository.LessonRepository;
import tw.waterballsa.api.stepdefs.helper.ISAFeatureArgumentResolver;

import java.util.List;
import java.util.Map;

public class Given_準備一個Lesson {
    @Autowired
    private LessonRepository lessonRepository;
    @Autowired
    private ChapterRepository chapterRepository;
    @Autowired
    private ISAFeatureArgumentResolver resolver;

    @Given("準備一個Lesson, for chapter {int} of curriculum {word}, with table:")
    public void prepareLessonForChapter(Integer chapterIndex, String curriculumIdVar, DataTable dataTable) {
        Long curriculumId = Long.parseLong(resolver.resolveVariable(curriculumIdVar).toString());

        // Find the chapter by curriculumId and orderIndex
        List<Chapter> chapters = chapterRepository.findByCurriculumIdOrderByOrderIndex(curriculumId);
        // Assuming chapterIndex corresponds to the list index or orderIndex.
        // The step says "chapter 0", usually implies orderIndex or list index.
        // Let's assume orderIndex match or list position. Since we sort by orderIndex,
        // list position is safer if orderIndex matches.
        // But safer is finding by orderIndex if possible.
        // In steps we created chapter with orderIndex 0 and 1.

        Chapter targetChapter = chapters.stream()
                .filter(ch -> ch.getOrderIndex() == chapterIndex)
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Chapter not found for index " + chapterIndex));

        List<Map<String, String>> rows = dataTable.asMaps(String.class, String.class);
        for (Map<String, String> row : rows) {
            String lessonTypeStr = row.get("lessonType");
            Lesson.LessonType lessonType = lessonTypeStr != null ? Lesson.LessonType.valueOf(lessonTypeStr)
                    : Lesson.LessonType.VIDEO;

            Lesson lesson = Lesson.builder()
                    .chapterId(targetChapter.getId())
                    .title(row.get("title"))
                    .lessonType(lessonType)
                    .orderIndex(0) // Default or need column? Feature didn't specify orderIndex for lessons, I'll
                                   // default to loop index or 0.
                    .build();
            // Manually handling order for list
            lesson.setOrderIndex(rows.indexOf(row));

            lessonRepository.save(lesson);
        }
    }
}
