import { useState, useEffect, useRef, useCallback } from 'react';
import { saveProgress, getProgress } from '@/lib/api/video-progress';
import type { VideoProgressDto } from '@/types/video-progress';

interface UseVideoProgressProps {
  lessonId: number;
  isAuthenticated: boolean;
  onProgressUpdate?: (progress: VideoProgressDto) => void;
  onComplete?: () => void;
}

interface UseVideoProgressReturn {
  progress: VideoProgressDto | null;
  isLoading: boolean;
  error: Error | null;
  initializePlayer: (player: YT.Player) => void;
  cleanup: () => void;
}

const CHECK_INTERVAL_MS = 2000; // Check every 2 seconds
const SAVE_INTERVAL_MS = 10000; // Save every 10 seconds (when playing)
const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 2000, 4000]; // Exponential backoff: 1s, 2s, 4s

export function useVideoProgress({
  lessonId,
  isAuthenticated,
  onProgressUpdate,
  onComplete,
}: UseVideoProgressProps): UseVideoProgressReturn {
  const [progress, setProgress] = useState<VideoProgressDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const playerRef = useRef<YT.Player | null>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveTimeRef = useRef<number>(0);
  const isSavingRef = useRef(false);
  const isPlayingRef = useRef(false);

  /**
   * Fetch existing progress on mount
   */
  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    const fetchProgress = async () => {
      try {
        setIsLoading(true);
        const data = await getProgress(lessonId);
        setProgress(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch video progress:', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgress();
  }, [lessonId, isAuthenticated]);

  /**
   * Save progress to backend with retry logic
   */
  const saveProgressWithRetry = useCallback(
    async (currentTime: number, duration: number, retryCount = 0): Promise<void> => {
      if (!isAuthenticated || isSavingRef.current) {
        return;
      }

      isSavingRef.current = true;

      try {
        const completionPercentage = Math.min(100, Math.round((currentTime / duration) * 100));
        const threshold = duration < 30 ? 100 : 95;
        const isCompleted = completionPercentage >= threshold;

        console.log('[VideoProgress] Saving progress:', {
          lessonId,
          currentTime: currentTime.toFixed(2),
          duration: duration.toFixed(2),
          percentage: completionPercentage,
          isCompleted,
          timestamp: new Date().toISOString(),
        });

        const savedProgress = await saveProgress(lessonId, {
          currentTimeSeconds: Math.min(currentTime, duration),
          durationSeconds: duration,
          completionPercentage,
          isCompleted,
        });

        console.log('[VideoProgress] Progress saved successfully');
        setProgress(savedProgress);
        setError(null);
        lastSaveTimeRef.current = Date.now();

        if (onProgressUpdate) {
          onProgressUpdate(savedProgress);
        }

        if (isCompleted && onComplete && !progress?.isCompleted) {
          onComplete();
        }
      } catch (err) {
        console.error(`[VideoProgress] Failed to save (attempt ${retryCount + 1}/${MAX_RETRIES}):`, err);

        if (retryCount < MAX_RETRIES - 1) {
          const delay = RETRY_DELAYS[retryCount];
          await new Promise((resolve) => setTimeout(resolve, delay));
          await saveProgressWithRetry(currentTime, duration, retryCount + 1);
        } else {
          setError(err as Error);
          console.error('[VideoProgress] All retry attempts failed. Progress not saved.');
        }
      } finally {
        isSavingRef.current = false;
      }
    },
    [lessonId, isAuthenticated, onProgressUpdate, onComplete, progress]
  );

  /**
   * Check and save progress if needed
   * This runs every CHECK_INTERVAL_MS (2 seconds)
   */
  const checkAndSaveProgress = useCallback(() => {
    if (!playerRef.current || !isAuthenticated || !isPlayingRef.current) {
      return;
    }

    try {
      const currentTime = playerRef.current.getCurrentTime();
      const duration = playerRef.current.getDuration();

      if (duration <= 0) {
        return;
      }

      const now = Date.now();
      const timeSinceLastSave = now - lastSaveTimeRef.current;

      // Save every 10 seconds while playing
      if (timeSinceLastSave >= SAVE_INTERVAL_MS) {
        console.log('[VideoProgress] Auto-save triggered (10 seconds elapsed while playing)');
        saveProgressWithRetry(currentTime, duration);
      }
    } catch (err) {
      console.error('[VideoProgress] Error checking progress:', err);
    }
  }, [isAuthenticated, saveProgressWithRetry]);

  /**
   * Initialize player and set up tracking
   */
  const initializePlayer = useCallback(
    (player: YT.Player) => {
      console.log('[VideoProgress] Initializing player tracking');
      playerRef.current = player;

      if (!isAuthenticated) {
        console.log('[VideoProgress] User not authenticated, skipping tracking');
        return;
      }

      // Restore saved position if exists (use current progress state)
      const currentProgress = progress;
      if (currentProgress && currentProgress.currentTimeSeconds > 0) {
        // Wait for player to be ready before seeking
        setTimeout(() => {
          const duration = player.getDuration();
          // Don't restore if within 10 seconds of the end
          if (duration - currentProgress.currentTimeSeconds > 10) {
            console.log('[VideoProgress] Restoring position to', currentProgress.currentTimeSeconds);
            player.seekTo(currentProgress.currentTimeSeconds, true);
          }
        }, 500);
      }

      // Set up interval for periodic checks (every 2 seconds)
      // This will save every 10 seconds while playing
      console.log('[VideoProgress] Setting up progress check interval');
      checkIntervalRef.current = setInterval(checkAndSaveProgress, CHECK_INTERVAL_MS);

      // Track player state changes
      const handleStateChange = (event: YT.OnStateChangeEvent) => {
        const currentTime = player.getCurrentTime();
        const duration = player.getDuration();

        console.log('[VideoProgress] Player state changed:', {
          state: event.data,
          stateLabel: getStateLabel(event.data),
          currentTime: currentTime.toFixed(2),
        });

        // Update playing state
        isPlayingRef.current = event.data === YT.PlayerState.PLAYING;

        if (duration > 0) {
          // Save immediately on pause, end, or when starting to play
          if (
            event.data === YT.PlayerState.PAUSED ||
            event.data === YT.PlayerState.ENDED ||
            event.data === YT.PlayerState.PLAYING
          ) {
            console.log('[VideoProgress] State change save triggered');
            saveProgressWithRetry(currentTime, duration);
          }
        }
      };

      player.addEventListener('onStateChange', handleStateChange);
    },
    [isAuthenticated, checkAndSaveProgress, saveProgressWithRetry]
  );

  /**
   * Cleanup function
   */
  const cleanup = useCallback(() => {
    console.log('[VideoProgress] Cleaning up');

    // Save progress before cleanup
    if (playerRef.current && isAuthenticated) {
      try {
        const currentTime = playerRef.current.getCurrentTime();
        const duration = playerRef.current.getDuration();

        if (duration > 0) {
          console.log('[VideoProgress] Final save on cleanup');
          saveProgressWithRetry(currentTime, duration);
        }
      } catch (err) {
        console.error('[VideoProgress] Error during cleanup save:', err);
      }
    }

    // Clear interval
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }

    playerRef.current = null;
    isPlayingRef.current = false;
  }, [isAuthenticated, saveProgressWithRetry]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    progress,
    isLoading,
    error,
    initializePlayer,
    cleanup,
  };
}

/**
 * Helper function to get human-readable state label
 */
function getStateLabel(state: YT.PlayerState): string {
  switch (state) {
    case YT.PlayerState.UNSTARTED:
      return 'UNSTARTED';
    case YT.PlayerState.ENDED:
      return 'ENDED';
    case YT.PlayerState.PLAYING:
      return 'PLAYING';
    case YT.PlayerState.PAUSED:
      return 'PAUSED';
    case YT.PlayerState.BUFFERING:
      return 'BUFFERING';
    case YT.PlayerState.CUED:
      return 'CUED';
    default:
      return 'UNKNOWN';
  }
}
