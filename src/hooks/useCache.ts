'use client';

import { useState, useEffect, useCallback } from 'react';

interface CacheOptions {
  maxAge?: number; // in milliseconds
  storageKey?: string;
  enableServiceWorker?: boolean;
}

interface CachedData<T> {
  data: T | null;
  isLoading: boolean;
  isStale: boolean;
  lastUpdated: number | null;
  error: Error | null;
}

export function useCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
) {
  const {
    maxAge = 5 * 60 * 1000, // 5 minutes default
    storageKey = 'zzz-cache',
    enableServiceWorker = true
  } = options;

  const [state, setState] = useState<CachedData<T>>({
    data: null,
    isLoading: false,
    isStale: false,
    lastUpdated: null,
    error: null
  });

  // Get data from localStorage
  const getFromStorage = useCallback(() => {
    try {
      const cached = localStorage.getItem(`${storageKey}-${key}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        const isExpired = Date.now() - parsed.timestamp > maxAge;
        return {
          data: parsed.data,
          timestamp: parsed.timestamp,
          isExpired
        };
      }
    } catch (error) {
      console.warn('Failed to get cached data:', error);
    }
    return null;
  }, [key, storageKey, maxAge]);

  // Save data to localStorage
  const saveToStorage = useCallback((data: T) => {
    try {
      const cacheData = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(`${storageKey}-${key}`, JSON.stringify(cacheData));
      
      // Also cache in Service Worker if available
      if (enableServiceWorker && 'serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((registration) => {
          if (registration.active) {
            registration.active.postMessage({
              type: 'CACHE_BATTLE_DATA',
              data,
              url: key
            });
          }
        });
      }
    } catch (error) {
      console.warn('Failed to save cached data:', error);
    }
  }, [key, storageKey, enableServiceWorker]);

  // Fetch fresh data
  const fetchData = useCallback(async (useCache = true) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Try to get cached data first if useCache is true
      if (useCache) {
        const cached = getFromStorage();
        if (cached && !cached.isExpired) {
          setState({
            data: cached.data,
            isLoading: false,
            isStale: false,
            lastUpdated: cached.timestamp,
            error: null
          });
          return cached.data;
        } else if (cached && cached.isExpired) {
          // Show stale data while fetching fresh data
          setState(prev => ({
            ...prev,
            data: cached.data,
            isStale: true,
            lastUpdated: cached.timestamp
          }));
        }
      }

      // Fetch fresh data
      const freshData = await fetcher();
      saveToStorage(freshData);
      
      setState({
        data: freshData,
        isLoading: false,
        isStale: false,
        lastUpdated: Date.now(),
        error: null
      });
      
      return freshData;
    } catch (error) {
      const cachedFallback = getFromStorage();
      setState({
        data: cachedFallback?.data || null,
        isLoading: false,
        isStale: !!cachedFallback,
        lastUpdated: cachedFallback?.timestamp || null,
        error: error as Error
      });
      throw error;
    }
  }, [fetcher, getFromStorage, saveToStorage]);

  // Invalidate cache
  const invalidate = useCallback(() => {
    try {
      localStorage.removeItem(`${storageKey}-${key}`);
      setState({
        data: null,
        isLoading: false,
        isStale: false,
        lastUpdated: null,
        error: null
      });
    } catch (error) {
      console.warn('Failed to invalidate cache:', error);
    }
  }, [key, storageKey]);

  // Refresh data (force fetch)
  const refresh = useCallback(() => {
    return fetchData(false);
  }, [fetchData]);

  // Load initial data
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Check for network status changes
  useEffect(() => {
    const handleOnline = () => {
      if (state.isStale || state.error) {
        fetchData(false); // Force fresh fetch when coming back online
      }
    };

    const handleOffline = () => {
      // When offline, ensure we're showing cached data if available
      const cached = getFromStorage();
      if (cached && !state.data) {
        setState(prev => ({
          ...prev,
          data: cached.data,
          isStale: true,
          lastUpdated: cached.timestamp
        }));
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [state.isStale, state.error, state.data, fetchData, getFromStorage]);

  return {
    ...state,
    refresh,
    invalidate,
    isOnline: navigator.onLine
  };
}

// Hook for caching battle records specifically
export function useBattleRecordsCache<T>(
  endpoint: string,
  fetcher: () => Promise<T>
) {
  return useCache(
    `battle-records-${endpoint}`,
    fetcher,
    {
      maxAge: 10 * 60 * 1000, // 10 minutes for battle records
      storageKey: 'zzz-battle-cache'
    }
  );
}

// Hook for caching character data
export function useCharacterDataCache<T>(
  characterId: string,
  fetcher: () => Promise<T>
) {
  return useCache(
    `character-${characterId}`,
    fetcher,
    {
      maxAge: 60 * 60 * 1000, // 1 hour for character data
      storageKey: 'zzz-character-cache'
    }
  );
}
