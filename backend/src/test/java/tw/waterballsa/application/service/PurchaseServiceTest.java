package tw.waterballsa.application.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tw.waterballsa.api.dto.response.OrderPreviewResponse;
import tw.waterballsa.api.entity.Chapter;
import tw.waterballsa.api.entity.Curriculum;
import tw.waterballsa.api.entity.Lesson;
import tw.waterballsa.api.entity.User;
import tw.waterballsa.api.repository.CurriculumRepository;
import tw.waterballsa.api.repository.PurchaseRepository;
import tw.waterballsa.api.repository.UserRepository;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.lenient;

import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class PurchaseServiceTest {

        @Mock
        private PurchaseRepository purchaseRepository;

        @Mock
        private UserRepository userRepository;

        @Mock
        private CurriculumRepository curriculumRepository;

        @InjectMocks
        private PurchaseService purchaseService;

        @Test
        void testGetOrderPreview_shouldReturnCorrectStructure() {
                // Arrange
                Integer userId = 1;
                Integer curriculumId = 100;

                User user = User.builder().id(userId.longValue()).build();

                Lesson lesson1 = Lesson.builder()
                                .id(1L)
                                .title("Lesson 1")
                                .lessonType(Lesson.LessonType.VIDEO)
                                .isFreePreview(true)
                                .build();

                Lesson lesson2 = Lesson.builder()
                                .id(2L)
                                .title("Lesson 2")
                                .lessonType(Lesson.LessonType.ARTICLE)
                                .isFreePreview(false)
                                .build();

                Chapter chapter = Chapter.builder()
                                .id(10L)
                                .title("Chapter 1")
                                .lessons(List.of(lesson1, lesson2))
                                .build();

                Curriculum curriculum = Curriculum.builder()
                                .id(curriculumId.longValue())
                                .title("Java Course")
                                .price(BigDecimal.valueOf(100))
                                .currency("TWD")
                                .chapters(List.of(chapter))
                                .build();

                when(userRepository.findById(userId.longValue())).thenReturn(Optional.of(user));
                when(curriculumRepository.findById(curriculumId.longValue())).thenReturn(Optional.of(curriculum));
                lenient().when(purchaseRepository.existsByUserIdAndCurriculumIdAndStatus(anyLong(), anyLong(),
                                org.mockito.ArgumentMatchers.any())).thenReturn(false);

                // Act
                OrderPreviewResponse response = purchaseService.getOrderPreview(userId, curriculumId);

                // Assert
                assertThat(response.getCurriculum().getId()).isEqualTo(curriculumId);
                assertThat(response.getChapters()).hasSize(1);
                assertThat(response.getChapters().get(0).getLessons()).hasSize(2);
                assertThat(response.getTotalChapters()).isEqualTo(1);
                assertThat(response.getTotalLessons()).isEqualTo(2);
                assertThat(response.getChapters().get(0).getLessons().get(0).getTitle()).isEqualTo("Lesson 1");
                assertThat(response.getChapters().get(0).getLessons().get(0).getLessonType()).isEqualTo("VIDEO");
        }
}
