import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { purchasesApi } from '@/lib/api/purchases';

const CACHE_KEY = 'ownership_cache';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CachedOwnership {
  [curriculumId: string]: {
    owns: boolean;
    purchaseId?: number;
    purchaseDate?: string;
    timestamp: number;
  };
}

export interface OwnershipResult {
  owns: boolean;
  purchaseId?: number;
  purchaseDate?: string;
  isLoading: boolean;
  error: Error | null;
  retry: () => void;
}

/**
 * Custom hook for checking curriculum ownership with caching
 *
 * Features:
 * - 5-minute sessionStorage cache to reduce API calls
 * - Automatic cache invalidation on curriculum-purchased event
 * - Fail-secure: defaults to owns=false on errors
 * - Retry mechanism for failed requests
 *
 * @param curriculumId - ID of the curriculum to check ownership for
 * @param enabled - Whether to fetch ownership (defaults to true when authenticated)
 * @returns Ownership result with loading and error states
 */
export function useOwnership(
  curriculumId: number | undefined,
  enabled: boolean = true
): OwnershipResult {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const [owns, setOwns] = useState(false);
  const [purchaseId, setPurchaseId] = useState<number | undefined>();
  const [purchaseDate, setPurchaseDate] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Get cached ownership data
  const getCachedOwnership = useCallback(
    (currId: number): OwnershipResult['owns'] | null => {
      if (typeof window === 'undefined') return null;

      try {
        const cached = sessionStorage.getItem(CACHE_KEY);
        if (!cached) return null;

        const cacheData: CachedOwnership = JSON.parse(cached);
        const currData = cacheData[currId.toString()];

        if (!currData) return null;

        // Check if cache is expired
        const now = Date.now();
        if (now - currData.timestamp > CACHE_TTL_MS) {
          // Clean up expired entry
          delete cacheData[currId.toString()];
          sessionStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
          return null;
        }

        // Update state with cached data
        setOwns(currData.owns);
        setPurchaseId(currData.purchaseId);
        setPurchaseDate(currData.purchaseDate);

        return currData.owns;
      } catch (err) {
        console.error('[useOwnership] Failed to read cache:', err);
        return null;
      }
    },
    []
  );

  // Set cached ownership data
  const setCachedOwnership = useCallback(
    (
      currId: number,
      ownershipData: {
        owns: boolean;
        purchaseId?: number;
        purchaseDate?: string;
      }
    ) => {
      if (typeof window === 'undefined') return;

      try {
        const cached = sessionStorage.getItem(CACHE_KEY);
        const cacheData: CachedOwnership = cached ? JSON.parse(cached) : {};

        cacheData[currId.toString()] = {
          ...ownershipData,
          timestamp: Date.now(),
        };

        sessionStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      } catch (err) {
        console.error('[useOwnership] Failed to set cache:', err);
      }
    },
    []
  );

  // Clear cache for a specific curriculum
  const clearCache = useCallback((currId?: number) => {
    if (typeof window === 'undefined') return;

    try {
      if (currId) {
        const cached = sessionStorage.getItem(CACHE_KEY);
        if (cached) {
          const cacheData: CachedOwnership = JSON.parse(cached);
          delete cacheData[currId.toString()];
          sessionStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
        }
      } else {
        sessionStorage.removeItem(CACHE_KEY);
      }
    } catch (err) {
      console.error('[useOwnership] Failed to clear cache:', err);
    }
  }, []);

  // Fetch ownership from API
  const fetchOwnership = useCallback(async () => {
    if (!curriculumId || !isAuthenticated || !enabled) {
      setOwns(false);
      setPurchaseId(undefined);
      setPurchaseDate(undefined);
      setIsLoading(false);
      return;
    }

    // Check cache first
    const cachedResult = getCachedOwnership(curriculumId);
    if (cachedResult !== null) {
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await purchasesApi.checkOwnership(curriculumId);

      setOwns(response.owns);
      setPurchaseId(response.purchaseId);
      setPurchaseDate(response.purchaseDate);
      setError(null);

      // Cache the result
      setCachedOwnership(curriculumId, {
        owns: response.owns,
        purchaseId: response.purchaseId,
        purchaseDate: response.purchaseDate,
      });
    } catch (err) {
      console.error('[useOwnership] Failed to check ownership:', err);
      setError(err as Error);
      // Fail secure: deny access on error
      setOwns(false);
      setPurchaseId(undefined);
      setPurchaseDate(undefined);
    } finally {
      setIsLoading(false);
    }
  }, [curriculumId, isAuthenticated, enabled, getCachedOwnership, setCachedOwnership]);

  // Retry function
  const retry = useCallback(() => {
    if (curriculumId) {
      clearCache(curriculumId);
    }
    setRetryCount((prev) => prev + 1);
  }, [curriculumId, clearCache]);

  // Fetch ownership on mount and when dependencies change
  useEffect(() => {
    fetchOwnership();
  }, [fetchOwnership, retryCount]);

  // Listen for purchase events to invalidate cache
  useEffect(() => {
    const handlePurchase = (event: CustomEvent<{ curriculumId: number }>) => {
      if (event.detail.curriculumId === curriculumId) {
        clearCache(curriculumId);
        fetchOwnership();
      }
    };

    window.addEventListener(
      'curriculum-purchased' as any,
      handlePurchase as EventListener
    );

    return () => {
      window.removeEventListener(
        'curriculum-purchased' as any,
        handlePurchase as EventListener
      );
    };
  }, [curriculumId, clearCache, fetchOwnership]);

  // Clear cache on logout
  useEffect(() => {
    if (!isAuthenticated) {
      clearCache();
      setOwns(false);
      setPurchaseId(undefined);
      setPurchaseDate(undefined);
    }
  }, [isAuthenticated, clearCache]);

  return {
    owns,
    purchaseId,
    purchaseDate,
    isLoading,
    error,
    retry,
  };
}
