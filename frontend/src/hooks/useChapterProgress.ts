import { useState, useEffect } from 'react';
import { getChapterProgress } from '@/lib/api/video-progress';
import type { VideoProgressDto } from '@/types/video-progress';

interface UseChapterProgressProps {
  chapterId: number;
  isAuthenticated: boolean;
}

interface UseChapterProgressReturn {
  progressMap: Map<number, VideoProgressDto>;
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
}

/**
 * Hook to fetch and manage progress for all lessons in a chapter
 * Returns a Map of lessonId => VideoProgressDto for easy lookup
 */
export function useChapterProgress({
  chapterId,
  isAuthenticated,
}: UseChapterProgressProps): UseChapterProgressReturn {
  const [progressMap, setProgressMap] = useState<Map<number, VideoProgressDto>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      setProgressMap(new Map());
      setIsLoading(false);
      return;
    }

    const fetchProgress = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const progressList = await getChapterProgress(chapterId);

        // Convert array to Map for O(1) lookup by lessonId
        const map = new Map<number, VideoProgressDto>();
        progressList.forEach((progress) => {
          map.set(progress.lessonId, progress);
        });

        setProgressMap(map);
      } catch (err) {
        console.error('Failed to fetch chapter progress:', err);
        setError(err as Error);
        setProgressMap(new Map()); // Clear on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgress();
  }, [chapterId, isAuthenticated, refreshTrigger]);

  const refresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return {
    progressMap,
    isLoading,
    error,
    refresh,
  };
}
