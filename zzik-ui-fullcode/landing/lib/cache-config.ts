/**
 * Advanced Caching with SWR
 * Optimistic updates, cache invalidation, and real-time sync
 */

import { SWRConfiguration } from 'swr';
import { logger } from './logger';

/**
 * Global SWR configuration
 */
export const swrConfig: SWRConfiguration = {
  // Revalidation
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  revalidateIfStale: true,
  
  // Cache timing
  dedupingInterval: 2000, // Dedupe requests within 2 seconds
  focusThrottleInterval: 5000, // Throttle revalidation on focus
  
  // Error handling
  shouldRetryOnError: true,
  errorRetryCount: 3,
  errorRetryInterval: 5000,
  
  // Loading states
  loadingTimeout: 3000, // Show loading after 3s
  
  // Global error handler
  onError: (error, key) => {
    logger.error('SWR error', error, { key });
    
    // Send to error tracking
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        tags: { component: 'swr', key },
      });
    }
  },
  
  // Global success handler
  onSuccess: (data, key) => {
    logger.debug('SWR success', { key, hasData: !!data });
  },
  
  // Compare function for deep equality
  compare: (a, b) => {
    return JSON.stringify(a) === JSON.stringify(b);
  },
};

/**
 * API fetcher with error handling
 */
export async function fetcher<T = any>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });
  
  if (!response.ok) {
    const error: any = new Error('API request failed');
    error.status = response.status;
    error.info = await response.json().catch(() => ({}));
    throw error;
  }
  
  return response.json();
}

/**
 * SWR keys for type-safe cache management
 */
export const SWR_KEYS = {
  // User
  user: (id: string) => `/api/users/${id}`,
  userProfile: (id: string) => `/api/users/${id}/profile`,
  userStats: (id: string) => `/api/users/${id}/stats`,
  userVouchers: (id: string) => `/api/users/${id}/vouchers`,
  userCheckIns: (id: string) => `/api/users/${id}/check-ins`,
  
  // Places
  place: (id: string) => `/api/places/${id}`,
  places: (params?: { lat?: number; lng?: number; radius?: number; category?: string }) =>
    `/api/places${params ? '?' + new URLSearchParams(params as any).toString() : ''}`,
  placeReviews: (id: string) => `/api/places/${id}/reviews`,
  
  // Check-ins
  checkIn: (id: string) => `/api/check-ins/${id}`,
  checkIns: (userId?: string) => `/api/check-ins${userId ? `?userId=${userId}` : ''}`,
  
  // Leaderboard
  leaderboard: (params?: { limit?: number; offset?: number }) =>
    `/api/leaderboard${params ? '?' + new URLSearchParams(params as any).toString() : ''}`,
  
  // Vouchers
  voucher: (id: string) => `/api/vouchers/${id}`,
  vouchers: (userId?: string) => `/api/vouchers${userId ? `?userId=${userId}` : ''}`,
} as const;

/**
 * Cache invalidation helpers
 */
export class CacheManager {
  private mutate: any;
  
  constructor(mutate: any) {
    this.mutate = mutate;
  }
  
  /**
   * Invalidate user cache
   */
  async invalidateUser(userId: string): Promise<void> {
    await Promise.all([
      this.mutate(SWR_KEYS.user(userId)),
      this.mutate(SWR_KEYS.userProfile(userId)),
      this.mutate(SWR_KEYS.userStats(userId)),
      this.mutate(SWR_KEYS.userVouchers(userId)),
      this.mutate(SWR_KEYS.userCheckIns(userId)),
    ]);
    
    logger.info('User cache invalidated', { userId });
  }
  
  /**
   * Invalidate place cache
   */
  async invalidatePlace(placeId: string): Promise<void> {
    await Promise.all([
      this.mutate(SWR_KEYS.place(placeId)),
      this.mutate(SWR_KEYS.placeReviews(placeId)),
      this.mutate(SWR_KEYS.places()), // Invalidate list too
    ]);
    
    logger.info('Place cache invalidated', { placeId });
  }
  
  /**
   * Invalidate check-in cache
   */
  async invalidateCheckIn(checkInId: string, userId: string): Promise<void> {
    await Promise.all([
      this.mutate(SWR_KEYS.checkIn(checkInId)),
      this.mutate(SWR_KEYS.checkIns(userId)),
      this.mutate(SWR_KEYS.userStats(userId)),
    ]);
    
    logger.info('Check-in cache invalidated', { checkInId, userId });
  }
  
  /**
   * Invalidate leaderboard cache
   */
  async invalidateLeaderboard(): Promise<void> {
    await this.mutate((key: string) => key.startsWith('/api/leaderboard'));
    logger.info('Leaderboard cache invalidated');
  }
  
  /**
   * Clear all cache
   */
  async clearAll(): Promise<void> {
    await this.mutate(() => true);
    logger.info('All cache cleared');
  }
}

/**
 * Optimistic update helpers
 */

/**
 * Optimistic update for user profile
 */
export async function updateUserOptimistic(
  userId: string,
  updates: Partial<any>,
  mutate: any
) {
  const key = SWR_KEYS.user(userId);
  
  // Get current data
  const currentData = await mutate(key, undefined, { revalidate: false });
  
  // Update optimistically
  await mutate(
    key,
    { ...currentData, ...updates },
    { revalidate: false }
  );
  
  try {
    // Make actual API call
    const response = await fetch(key, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      throw new Error('Update failed');
    }
    
    const newData = await response.json();
    
    // Update with real data
    await mutate(key, newData.data, { revalidate: false });
    
    logger.info('Optimistic update succeeded', { userId });
    
    return newData.data;
    
  } catch (error) {
    // Revert on error
    await mutate(key, currentData, { revalidate: false });
    
    logger.error('Optimistic update failed, reverted', error, { userId });
    throw error;
  }
}

/**
 * Optimistic update for check-in
 */
export async function createCheckInOptimistic(
  data: any,
  userId: string,
  mutate: any
) {
  const listKey = SWR_KEYS.checkIns(userId);
  
  // Create temporary check-in
  const tempCheckIn = {
    id: `temp_${Date.now()}`,
    ...data,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
  };
  
  // Get current list
  const currentList = await mutate(listKey, undefined, { revalidate: false });
  
  // Add optimistically
  await mutate(
    listKey,
    { items: [tempCheckIn, ...(currentList?.items || [])] },
    { revalidate: false }
  );
  
  try {
    // Make actual API call
    const response = await fetch('/api/check-ins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Check-in failed');
    }
    
    const newCheckIn = await response.json();
    
    // Replace temp with real data
    await mutate(
      listKey,
      {
        items: [
          newCheckIn.data,
          ...(currentList?.items || []),
        ],
      },
      { revalidate: false }
    );
    
    logger.info('Optimistic check-in succeeded', { checkInId: newCheckIn.data.id });
    
    return newCheckIn.data;
    
  } catch (error) {
    // Revert on error
    await mutate(listKey, currentList, { revalidate: false });
    
    logger.error('Optimistic check-in failed, reverted', error);
    throw error;
  }
}

/**
 * Pagination helper for infinite scroll
 */
export interface PaginatedResponse<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

export function getPaginationKey(
  baseKey: string,
  pageIndex: number,
  previousPageData: PaginatedResponse<any> | null
): string | null {
  // Reached the end
  if (previousPageData && !previousPageData.hasMore) {
    return null;
  }
  
  // First page
  if (pageIndex === 0) {
    return baseKey;
  }
  
  // Add cursor to URL
  if (previousPageData && previousPageData.nextCursor) {
    const separator = baseKey.includes('?') ? '&' : '?';
    return `${baseKey}${separator}cursor=${previousPageData.nextCursor}`;
  }
  
  return null;
}

/**
 * Cache warming - prefetch data before it's needed
 */
export async function warmCache(keys: string[], mutate: any): Promise<void> {
  logger.info('Warming cache', { keyCount: keys.length });
  
  await Promise.all(
    keys.map((key) =>
      mutate(key, fetcher(key), { revalidate: false })
    )
  );
  
  logger.info('Cache warmed', { keyCount: keys.length });
}

/**
 * Cache statistics
 */
export interface CacheStats {
  totalKeys: number;
  hitRate: number;
  missRate: number;
  avgResponseTime: number;
}

let cacheHits = 0;
let cacheMisses = 0;
const responseTimes: number[] = [];

export function recordCacheHit(): void {
  cacheHits++;
}

export function recordCacheMiss(responseTime: number): void {
  cacheMisses++;
  responseTimes.push(responseTime);
  
  // Keep only last 100 response times
  if (responseTimes.length > 100) {
    responseTimes.shift();
  }
}

export function getCacheStats(): CacheStats {
  const total = cacheHits + cacheMisses;
  const avgResponseTime =
    responseTimes.length > 0
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      : 0;
  
  return {
    totalKeys: total,
    hitRate: total > 0 ? cacheHits / total : 0,
    missRate: total > 0 ? cacheMisses / total : 0,
    avgResponseTime,
  };
}

export function resetCacheStats(): void {
  cacheHits = 0;
  cacheMisses = 0;
  responseTimes.length = 0;
}
