import { apiClient } from '../api-client';
import type { VideoProgressDto, SaveProgressRequest } from '@/types/video-progress';

/**
 * Save or update video progress for a lesson
 */
export async function saveProgress(
  lessonId: number,
  request: SaveProgressRequest
): Promise<VideoProgressDto> {
  const response = await apiClient.post<VideoProgressDto>(
    `/lessons/${lessonId}/progress`,
    request
  );
  return response.data;
}

/**
 * Get video progress for a specific lesson
 * Returns null if no progress exists (404)
 */
export async function getProgress(lessonId: number): Promise<VideoProgressDto | null> {
  try {
    const response = await apiClient.get<VideoProgressDto>(`/lessons/${lessonId}/progress`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

/**
 * Get video progress for all lessons in a chapter
 */
export async function getChapterProgress(chapterId: number): Promise<VideoProgressDto[]> {
  const response = await apiClient.get<VideoProgressDto[]>(
    `/lessons/chapters/${chapterId}/progress`
  );
  return response.data;
}
