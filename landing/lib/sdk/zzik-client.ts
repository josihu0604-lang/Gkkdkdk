/**
 * ZZIK Platform SDK - TypeScript Client Library
 * Complete API client for mobile and web applications
 * 
 * @example
 * ```typescript
 * const client = new ZZIKClient({
 *   baseURL: 'https://api.zzik.io',
 *   apiKey: 'your-api-key'
 * });
 * 
 * // Get nearby places
 * const places = await client.places.getNearby({ lat: 37.5665, lng: 126.9780, radius: 5 });
 * 
 * // Create check-in
 * const checkIn = await client.checkIns.create({
 *   placeId: 'place-id',
 *   latitude: 37.5665,
 *   longitude: 126.9780,
 *   accuracy: 10
 * });
 * ```
 */

// ============================================================================
// Type Definitions
// ============================================================================

export interface ZZIKClientConfig {
  baseURL: string;
  apiKey?: string;
  accessToken?: string;
  refreshToken?: string;
  onTokenRefresh?: (tokens: { accessToken: string; refreshToken: string }) => void;
  timeout?: number;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: any[];
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    hasMore: boolean;
    nextCursor: string | null;
    limit: number;
  };
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: string;
}

// User types
export interface User {
  id: string;
  walletAddress: string;
  username?: string;
  email?: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  level: number;
  totalPoints: number;
  totalCheckIns: number;
  currentStreak: number;
  longestStreak: number;
  createdAt: string;
  updatedAt: string;
}

// Place types
export interface Place {
  id: string;
  name: string;
  category: 'CAFE' | 'RESTAURANT' | 'RETAIL' | 'ENTERTAINMENT' | 'OTHER';
  latitude: number;
  longitude: number;
  addressFull: string;
  addressCity?: string;
  addressDistrict?: string;
  description?: string;
  imageUrl?: string;
  websiteUrl?: string;
  phoneNumber?: string;
  wifiSsids: string[];
  averageRating: number;
  totalReviews: number;
  totalCheckIns: number;
  isActive: boolean;
  distance?: number;
  createdAt: string;
}

// Check-in types
export interface CheckIn {
  id: string;
  userId: string;
  placeId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  latitude: number;
  longitude: number;
  accuracy: number;
  integrityScore: number;
  distanceScore: number;
  wifiScore: number;
  accuracyScore: number;
  distanceMeters: number;
  createdAt: string;
  approvedAt?: string;
  rejectedAt?: string;
}

export interface CreateCheckInRequest {
  userId: string;
  placeId: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  wifiNetworks?: string[];
  deviceInfo?: string;
}

export interface GPSIntegrity {
  totalScore: number;
  distanceScore: number;
  wifiScore: number;
  accuracyScore: number;
  timeScore: number;
  speedScore: number;
}

// Voucher types
export interface Voucher {
  id: string;
  userId: string;
  placeId: string;
  type: 'PERCENTAGE' | 'FIXED' | 'POINTS';
  value: number;
  description: string;
  status: 'ACTIVE' | 'REDEEMED' | 'EXPIRED' | 'CANCELLED';
  txHash?: string;
  blockNumber?: number;
  createdAt: string;
  expiresAt: string;
  redeemedAt?: string;
  place?: {
    id: string;
    name: string;
    category: string;
  };
}

// Review types
export interface Review {
  id: string;
  userId: string;
  placeId: string;
  rating: number;
  title: string;
  content: string;
  imageUrls: string[];
  helpfulCount: number;
  isApproved: boolean;
  visitDate: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string;
    level: number;
  };
  place?: {
    id: string;
    name: string;
    category: string;
    addressFull: string;
  };
}

export interface CreateReviewRequest {
  placeId: string;
  userId: string;
  rating: number;
  title: string;
  content: string;
  images?: string[];
  visitDate?: string;
}

export interface UpdateReviewRequest {
  rating?: number;
  title?: string;
  content?: string;
  images?: string[];
}

// Leaderboard types
export interface LeaderboardEntry {
  rank: number;
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  totalPoints: number;
  level: number;
  totalCheckIns: number;
}

// ============================================================================
// Main Client Class
// ============================================================================

export class ZZIKClient {
  private config: ZZIKClientConfig;
  private refreshPromise: Promise<void> | null = null;

  public users: UsersAPI;
  public places: PlacesAPI;
  public checkIns: CheckInsAPI;
  public vouchers: VouchersAPI;
  public reviews: ReviewsAPI;
  public leaderboard: LeaderboardAPI;

  constructor(config: ZZIKClientConfig) {
    this.config = {
      timeout: 30000,
      ...config,
    };

    // Initialize API modules
    this.users = new UsersAPI(this);
    this.places = new PlacesAPI(this);
    this.checkIns = new CheckInsAPI(this);
    this.vouchers = new VouchersAPI(this);
    this.reviews = new ReviewsAPI(this);
    this.leaderboard = new LeaderboardAPI(this);
  }

  /**
   * Update access token
   */
  setAccessToken(token: string) {
    this.config.accessToken = token;
  }

  /**
   * Update refresh token
   */
  setRefreshToken(token: string) {
    this.config.refreshToken = token;
  }

  /**
   * Get current access token
   */
  getAccessToken(): string | undefined {
    return this.config.accessToken;
  }

  /**
   * Internal request method with automatic token refresh
   */
  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    const url = `${this.config.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add authorization header
    if (this.config.accessToken) {
      headers['Authorization'] = `Bearer ${this.config.accessToken}`;
    }

    if (this.config.apiKey) {
      headers['X-API-Key'] = this.config.apiKey;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: AbortSignal.timeout(this.config.timeout || 30000),
      });

      // Handle 401 Unauthorized - attempt token refresh
      if (response.status === 401 && this.config.refreshToken) {
        await this.refreshAccessToken();
        // Retry request with new token
        return this.request<T>(endpoint, options);
      }

      const data = await response.json();

      // Extract rate limit info if present
      if (response.headers.has('X-RateLimit-Limit')) {
        (data as any).rateLimit = {
          limit: parseInt(response.headers.get('X-RateLimit-Limit') || '0'),
          remaining: parseInt(response.headers.get('X-RateLimit-Remaining') || '0'),
          reset: response.headers.get('X-RateLimit-Reset') || '',
        };
      }

      if (!response.ok) {
        throw new ZZIKAPIError(
          data.error || 'Request failed',
          response.status,
          data.details
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ZZIKAPIError) {
        throw error;
      }
      throw new ZZIKAPIError(
        error instanceof Error ? error.message : 'Network error',
        0
      );
    }
  }

  /**
   * Refresh access token using refresh token
   */
  private async refreshAccessToken(): Promise<void> {
    // Prevent multiple simultaneous refresh attempts
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        const response = await fetch(`${this.config.baseURL}/api/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            refreshToken: this.config.refreshToken,
          }),
        });

        if (!response.ok) {
          throw new Error('Token refresh failed');
        }

        const data = await response.json();
        this.config.accessToken = data.accessToken;
        this.config.refreshToken = data.refreshToken;

        // Notify application of new tokens
        if (this.config.onTokenRefresh) {
          this.config.onTokenRefresh({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
          });
        }
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }
}

// ============================================================================
// API Module Classes
// ============================================================================

class UsersAPI {
  constructor(private client: ZZIKClient) {}

  /**
   * Get user by ID
   */
  async getById(userId: string): Promise<APIResponse<User>> {
    return this.client.request<User>(`/api/users/${userId}`);
  }

  /**
   * Update user profile
   */
  async update(
    userId: string,
    data: { displayName?: string; avatar?: string; bio?: string }
  ): Promise<APIResponse<User>> {
    return this.client.request<User>(`/api/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete user (soft delete)
   */
  async delete(userId: string): Promise<APIResponse<{ message: string }>> {
    return this.client.request(`/api/users/${userId}`, {
      method: 'DELETE',
    });
  }
}

class PlacesAPI {
  constructor(private client: ZZIKClient) {}

  /**
   * Get nearby places
   */
  async getNearby(params: {
    lat: number;
    lng: number;
    radius?: number;
    category?: string;
    limit?: number;
  }): Promise<APIResponse<Place[]>> {
    const query = new URLSearchParams();
    query.set('lat', params.lat.toString());
    query.set('lng', params.lng.toString());
    if (params.radius) query.set('radius', params.radius.toString());
    if (params.category) query.set('category', params.category);
    if (params.limit) query.set('limit', params.limit.toString());

    return this.client.request<Place[]>(`/api/places?${query.toString()}`);
  }

  /**
   * Get all places
   */
  async list(params?: { category?: string; limit?: number }): Promise<APIResponse<Place[]>> {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.limit) query.set('limit', params.limit.toString());

    const queryString = query.toString();
    return this.client.request<Place[]>(`/api/places${queryString ? `?${queryString}` : ''}`);
  }

  /**
   * Get place by ID
   */
  async getById(placeId: string): Promise<APIResponse<Place>> {
    return this.client.request<Place>(`/api/places/${placeId}`);
  }

  /**
   * Create new place (admin only)
   */
  async create(data: {
    name: string;
    category: string;
    address: string;
    latitude: number;
    longitude: number;
    description?: string;
    images?: string[];
    wifiSsids?: string[];
  }): Promise<APIResponse<Place>> {
    return this.client.request<Place>('/api/places', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update place (admin only)
   */
  async update(placeId: string, data: Partial<Place>): Promise<APIResponse<Place>> {
    return this.client.request<Place>(`/api/places/${placeId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete place (soft delete, admin only)
   */
  async delete(placeId: string): Promise<APIResponse<{ message: string }>> {
    return this.client.request(`/api/places/${placeId}`, {
      method: 'DELETE',
    });
  }
}

class CheckInsAPI {
  constructor(private client: ZZIKClient) {}

  /**
   * Create check-in with GPS validation
   */
  async create(
    data: CreateCheckInRequest
  ): Promise<APIResponse<{ checkIn: CheckIn; integrity: GPSIntegrity }>> {
    return this.client.request('/api/check-ins', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * List check-ins with filtering
   */
  async list(params?: {
    userId?: string;
    placeId?: string;
    status?: 'PENDING' | 'APPROVED' | 'REJECTED';
    limit?: number;
    cursor?: string;
  }): Promise<PaginatedResponse<CheckIn>> {
    const query = new URLSearchParams();
    if (params?.userId) query.set('userId', params.userId);
    if (params?.placeId) query.set('placeId', params.placeId);
    if (params?.status) query.set('status', params.status);
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.cursor) query.set('cursor', params.cursor);

    const queryString = query.toString();
    return this.client.request<PaginatedResponse<CheckIn>>(
      `/api/check-ins${queryString ? `?${queryString}` : ''}`
    );
  }

  /**
   * Get check-in by ID
   */
  async getById(checkInId: string): Promise<APIResponse<CheckIn>> {
    return this.client.request<CheckIn>(`/api/check-ins/${checkInId}`);
  }
}

class VouchersAPI {
  constructor(private client: ZZIKClient) {}

  /**
   * List vouchers with filtering
   */
  async list(params?: {
    userId?: string;
    placeId?: string;
    status?: 'ACTIVE' | 'REDEEMED' | 'EXPIRED';
  }): Promise<APIResponse<Voucher[]>> {
    const query = new URLSearchParams();
    if (params?.userId) query.set('userId', params.userId);
    if (params?.placeId) query.set('placeId', params.placeId);
    if (params?.status) query.set('status', params.status);

    const queryString = query.toString();
    return this.client.request<Voucher[]>(
      `/api/vouchers${queryString ? `?${queryString}` : ''}`
    );
  }

  /**
   * Get voucher by ID
   */
  async getById(voucherId: string): Promise<APIResponse<Voucher>> {
    return this.client.request<Voucher>(`/api/vouchers/${voucherId}`);
  }

  /**
   * Redeem voucher
   */
  async redeem(voucherId: string): Promise<APIResponse<Voucher>> {
    return this.client.request<Voucher>(`/api/vouchers/${voucherId}/redeem`, {
      method: 'POST',
    });
  }

  /**
   * Create voucher (admin only)
   */
  async create(data: {
    userId: string;
    placeId: string;
    title: string;
    description: string;
    discountType: 'PERCENTAGE' | 'FIXED';
    discountValue: number;
    expiresAt: string;
  }): Promise<APIResponse<Voucher>> {
    return this.client.request<Voucher>('/api/vouchers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

class ReviewsAPI {
  constructor(private client: ZZIKClient) {}

  /**
   * Create review
   */
  async create(data: CreateReviewRequest): Promise<APIResponse<Review>> {
    return this.client.request<Review>('/api/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * List reviews with filtering and pagination
   */
  async list(params?: {
    placeId?: string;
    userId?: string;
    minRating?: number;
    maxRating?: number;
    sortBy?: 'recent' | 'helpful' | 'rating';
    limit?: number;
    cursor?: string;
  }): Promise<PaginatedResponse<Review>> {
    const query = new URLSearchParams();
    if (params?.placeId) query.set('placeId', params.placeId);
    if (params?.userId) query.set('userId', params.userId);
    if (params?.minRating) query.set('minRating', params.minRating.toString());
    if (params?.maxRating) query.set('maxRating', params.maxRating.toString());
    if (params?.sortBy) query.set('sortBy', params.sortBy);
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.cursor) query.set('cursor', params.cursor);

    const queryString = query.toString();
    return this.client.request<PaginatedResponse<Review>>(
      `/api/reviews${queryString ? `?${queryString}` : ''}`
    );
  }

  /**
   * Get review by ID
   */
  async getById(reviewId: string): Promise<APIResponse<Review>> {
    return this.client.request<Review>(`/api/reviews/${reviewId}`);
  }

  /**
   * Update own review
   */
  async update(
    reviewId: string,
    data: UpdateReviewRequest,
    userId: string
  ): Promise<APIResponse<Review>> {
    return this.client.request<Review>(`/api/reviews/${reviewId}`, {
      method: 'PATCH',
      body: JSON.stringify({ ...data, userId }),
    });
  }

  /**
   * Delete own review
   */
  async delete(reviewId: string, userId: string): Promise<APIResponse<{ message: string }>> {
    return this.client.request(`/api/reviews/${reviewId}?userId=${userId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Mark review as helpful
   */
  async markHelpful(reviewId: string, userId: string): Promise<APIResponse<Review>> {
    return this.client.request<Review>(`/api/reviews/${reviewId}/helpful`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  /**
   * Remove helpful vote
   */
  async removeHelpful(reviewId: string, userId: string): Promise<APIResponse<Review>> {
    return this.client.request<Review>(`/api/reviews/${reviewId}/helpful?userId=${userId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Moderate review (admin only)
   */
  async moderate(
    reviewId: string,
    action: 'approve' | 'reject' | 'hide' | 'unhide',
    adminId: string,
    reason?: string
  ): Promise<APIResponse<Review>> {
    return this.client.request<Review>(`/api/reviews/${reviewId}/moderate`, {
      method: 'POST',
      body: JSON.stringify({ action, adminId, reason }),
    });
  }
}

class LeaderboardAPI {
  constructor(private client: ZZIKClient) {}

  /**
   * Get leaderboard
   */
  async get(limit: number = 50): Promise<APIResponse<LeaderboardEntry[]>> {
    return this.client.request<LeaderboardEntry[]>(`/api/leaderboard?limit=${limit}`);
  }
}

// ============================================================================
// Error Class
// ============================================================================

export class ZZIKAPIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public details?: any[]
  ) {
    super(message);
    this.name = 'ZZIKAPIError';
  }
}

// ============================================================================
// Export Default Instance Creator
// ============================================================================

export function createZZIKClient(config: ZZIKClientConfig): ZZIKClient {
  return new ZZIKClient(config);
}

export default ZZIKClient;
