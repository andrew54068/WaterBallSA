package com.waterballsa.backend.exception;

/**
 * Exception thrown when attempting to purchase a free curriculum.
 */
public class FreeCurriculumException extends RuntimeException {

    private final Long curriculumId;

    public FreeCurriculumException(Long curriculumId, String message) {
        super(message);
        this.curriculumId = curriculumId;
    }

    public Long getCurriculumId() {
        return curriculumId;
    }
}
