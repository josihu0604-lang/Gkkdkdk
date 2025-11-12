/**
 * React Hooks for ZZIK SDK
 * Easy-to-use hooks for React applications
 * 
 * @example
 * ```typescript
 * function PlacesList() {
 *   const { data, loading, error } = useNearbyPlaces({ lat: 37.5665, lng: 126.9780 });
 *   
 *   if (loading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *   
 *   return (
 *     <div>
 *       {data?.data?.map(place => (
 *         <div key={place.id}>{place.name}</div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */

'use client';

import { useState, useEffect, useCallback, useContext, createContext } from 'react';
import {
  ZZIKClient,
  ZZIKClientConfig,
  APIResponse,
  PaginatedResponse,
  Place,
  CheckIn,
  CreateCheckInRequest,
  Voucher,
  Review,
  CreateReviewRequest,
  UpdateReviewRequest,
  LeaderboardEntry,
  GPSIntegrity,
} from './zzik-client';

// ============================================================================
// Context for SDK Client
// ============================================================================

const ZZIKClientContext = createContext<ZZIKClient | null>(null);

export function ZZIKClientProvider({
  children,
  config,
}: {
  children: React.ReactNode;
  config: ZZIKClientConfig;
}) {
  const [client] = useState(() => new ZZIKClient(config));

  return <ZZIKClientContext.Provider value={client}>{children}</ZZIKClientContext.Provider>;
}

export function useZZIKClient(): ZZIKClient {
  const client = useContext(ZZIKClientContext);
  if (!client) {
    throw new Error('useZZIKClient must be used within ZZIKClientProvider');
  }
  return client;
}

// ============================================================================
// Generic Hook State
// ============================================================================

interface UseAPIState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

// ============================================================================
// Places Hooks
// ============================================================================

/**
 * Get nearby places
 */
export function useNearbyPlaces(params: {
  lat: number;
  lng: number;
  radius?: number;
  category?: string;
  limit?: number;
}): UseAPIState<APIResponse<Place[]>> {
  const client = useZZIKClient();
  const [data, setData] = useState<APIResponse<Place[]> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await client.places.getNearby(params);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [client, params.lat, params.lng, params.radius, params.category, params.limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Get place by ID
 */
export function usePlace(placeId: string): UseAPIState<APIResponse<Place>> {
  const client = useZZIKClient();
  const [data, setData] = useState<APIResponse<Place> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await client.places.getById(placeId);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [client, placeId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// ============================================================================
// Check-ins Hooks
// ============================================================================

/**
 * List check-ins with filtering
 */
export function useCheckIns(params?: {
  userId?: string;
  placeId?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  limit?: number;
}): UseAPIState<PaginatedResponse<CheckIn>> {
  const client = useZZIKClient();
  const [data, setData] = useState<PaginatedResponse<CheckIn> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await client.checkIns.list(params);
      setData(result as PaginatedResponse<CheckIn>);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [client, params?.userId, params?.placeId, params?.status, params?.limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Create check-in mutation
 */
export function useCreateCheckIn() {
  const client = useZZIKClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createCheckIn = useCallback(
    async (data: CreateCheckInRequest) => {
      try {
        setLoading(true);
        setError(null);
        const result = await client.checkIns.create(data);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  return { createCheckIn, loading, error };
}

// ============================================================================
// Vouchers Hooks
// ============================================================================

/**
 * List vouchers with filtering
 */
export function useVouchers(params?: {
  userId?: string;
  placeId?: string;
  status?: 'ACTIVE' | 'REDEEMED' | 'EXPIRED';
}): UseAPIState<APIResponse<Voucher[]>> {
  const client = useZZIKClient();
  const [data, setData] = useState<APIResponse<Voucher[]> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await client.vouchers.list(params);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [client, params?.userId, params?.placeId, params?.status]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Redeem voucher mutation
 */
export function useRedeemVoucher() {
  const client = useZZIKClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const redeemVoucher = useCallback(
    async (voucherId: string) => {
      try {
        setLoading(true);
        setError(null);
        const result = await client.vouchers.redeem(voucherId);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  return { redeemVoucher, loading, error };
}

// ============================================================================
// Reviews Hooks
// ============================================================================

/**
 * List reviews with filtering and pagination
 */
export function useReviews(params?: {
  placeId?: string;
  userId?: string;
  minRating?: number;
  maxRating?: number;
  sortBy?: 'recent' | 'helpful' | 'rating';
  limit?: number;
}): UseAPIState<PaginatedResponse<Review>> & {
  loadMore: () => Promise<void>;
  hasMore: boolean;
} {
  const client = useZZIKClient();
  const [data, setData] = useState<PaginatedResponse<Review> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await client.reviews.list({ ...params, cursor: undefined });
      setData(result as PaginatedResponse<Review>);
      setCursor((result as any).pagination?.nextCursor || null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [client, params?.placeId, params?.userId, params?.minRating, params?.maxRating, params?.sortBy, params?.limit]);

  const loadMore = useCallback(async () => {
    if (!cursor) return;

    try {
      setLoading(true);
      setError(null);
      const result = await client.reviews.list({ ...params, cursor });
      setData((prev) => {
        if (!prev) return result as PaginatedResponse<Review>;
        return {
          ...result,
          data: [...prev.data, ...(result as any).data],
        } as PaginatedResponse<Review>;
      });
      setCursor((result as any).pagination?.nextCursor || null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [client, cursor, params]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    loadMore,
    hasMore: !!cursor,
  };
}

/**
 * Get review by ID
 */
export function useReview(reviewId: string): UseAPIState<APIResponse<Review>> {
  const client = useZZIKClient();
  const [data, setData] = useState<APIResponse<Review> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await client.reviews.getById(reviewId);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [client, reviewId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Create review mutation
 */
export function useCreateReview() {
  const client = useZZIKClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createReview = useCallback(
    async (data: CreateReviewRequest) => {
      try {
        setLoading(true);
        setError(null);
        const result = await client.reviews.create(data);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  return { createReview, loading, error };
}

/**
 * Update review mutation
 */
export function useUpdateReview() {
  const client = useZZIKClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateReview = useCallback(
    async (reviewId: string, data: UpdateReviewRequest, userId: string) => {
      try {
        setLoading(true);
        setError(null);
        const result = await client.reviews.update(reviewId, data, userId);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  return { updateReview, loading, error };
}

/**
 * Delete review mutation
 */
export function useDeleteReview() {
  const client = useZZIKClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteReview = useCallback(
    async (reviewId: string, userId: string) => {
      try {
        setLoading(true);
        setError(null);
        const result = await client.reviews.delete(reviewId, userId);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  return { deleteReview, loading, error };
}

/**
 * Mark review as helpful mutation
 */
export function useMarkReviewHelpful() {
  const client = useZZIKClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const markHelpful = useCallback(
    async (reviewId: string, userId: string) => {
      try {
        setLoading(true);
        setError(null);
        const result = await client.reviews.markHelpful(reviewId, userId);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  return { markHelpful, loading, error };
}

// ============================================================================
// Leaderboard Hook
// ============================================================================

/**
 * Get leaderboard
 */
export function useLeaderboard(limit: number = 50): UseAPIState<APIResponse<LeaderboardEntry[]>> {
  const client = useZZIKClient();
  const [data, setData] = useState<APIResponse<LeaderboardEntry[]> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await client.leaderboard.get(limit);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [client, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// ============================================================================
// Geolocation Hook
// ============================================================================

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Get current geolocation
 */
export function useGeolocation(): GeolocationState & { refetch: () => void } {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    loading: true,
    error: null,
  });

  const fetchLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState({
        latitude: null,
        longitude: null,
        accuracy: null,
        loading: false,
        error: new Error('Geolocation is not supported'),
      });
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          loading: false,
          error: null,
        });
      },
      (error) => {
        setState({
          latitude: null,
          longitude: null,
          accuracy: null,
          loading: false,
          error: new Error(error.message),
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  return { ...state, refetch: fetchLocation };
}
