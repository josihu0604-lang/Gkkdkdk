/**
 * Advanced TypeScript Type Definitions for ZZIK Platform
 * 
 * Features:
 * - Branded Types for type safety
 * - Discriminated Unions for exhaustive checking
 * - Strict null checks
 * - Utility types for DRY code
 * - Nominal typing for domain primitives
 */

// ==================== Branded Types ====================

/**
 * Branded type helper
 * Prevents accidental mixing of semantically different strings/numbers
 */
declare const brand: unique symbol;
type Brand<T, TBrand extends string> = T & { readonly [brand]: TBrand };

/**
 * User ID - can't be confused with Place ID
 */
export type UserId = Brand<string, 'UserId'>;
export function createUserId(id: string): UserId {
  if (!id || id.length === 0) {
    throw new Error('UserId cannot be empty');
  }
  return id as UserId;
}

/**
 * Place ID - distinct from User ID
 */
export type PlaceId = Brand<string, 'PlaceId'>;
export function createPlaceId(id: string): PlaceId {
  if (!id || id.length === 0) {
    throw new Error('PlaceId cannot be empty');
  }
  return id as PlaceId;
}

/**
 * Check-in ID (idempotency key)
 */
export type CheckInId = Brand<string, 'CheckInId'>;
export function createCheckInId(id: string): CheckInId {
  if (!id || !id.startsWith('idem-')) {
    throw new Error('CheckInId must start with "idem-"');
  }
  return id as CheckInId;
}

/**
 * Latitude - constrained to valid range
 */
export type Latitude = Brand<number, 'Latitude'>;
export function createLatitude(lat: number): Latitude {
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
    throw new Error(`Invalid latitude: ${lat}. Must be between -90 and 90.`);
  }
  return lat as Latitude;
}

/**
 * Longitude - constrained to valid range
 */
export type Longitude = Brand<number, 'Longitude'>;
export function createLongitude(lng: number): Longitude {
  if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
    throw new Error(`Invalid longitude: ${lng}. Must be between -180 and 180.`);
  }
  return lng as Longitude;
}

/**
 * USDC amount - always positive
 */
export type USDCAmount = Brand<number, 'USDCAmount'>;
export function createUSDCAmount(amount: number): USDCAmount {
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error(`Invalid USDC amount: ${amount}. Must be non-negative.`);
  }
  return amount as USDCAmount;
}

/**
 * ISO 8601 timestamp string
 */
export type ISODateString = Brand<string, 'ISODateString'>;
export function createISODateString(dateStr: string): ISODateString {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid ISO date string: ${dateStr}`);
  }
  return dateStr as ISODateString;
}

// ==================== Discriminated Unions ====================

/**
 * Check-in status with discriminated union
 */
export type CheckInStatus =
  | { type: 'pending'; queuePosition: number }
  | { type: 'approved'; approvedAt: ISODateString; voucherId: string }
  | { type: 'rejected'; reason: string; retryAllowed: boolean }
  | { type: 'flagged'; reason: string; reviewRequired: boolean };

/**
 * Voucher type with specific value constraints
 */
export type Voucher =
  | { type: 'discount'; percentage: number; maxAmount?: USDCAmount }
  | { type: 'cashback'; amount: USDCAmount }
  | { type: 'freebie'; itemName: string; value: USDCAmount }
  | { type: 'points'; points: number };

/**
 * GPS integrity result with detailed breakdown
 */
export type GPSIntegrityResult =
  | {
      status: 'valid';
      score: number; // 0-100
      breakdown: {
        distance: number;
        wifi: number;
        time: number;
        accuracy: number;
        speed: number;
      };
      confidence: 'high' | 'medium' | 'low';
    }
  | {
      status: 'invalid';
      score: number;
      failedFactors: Array<'distance' | 'wifi' | 'time' | 'accuracy' | 'speed'>;
      reason: string;
    }
  | {
      status: 'suspicious';
      score: number;
      flags: string[];
      requiresManualReview: boolean;
    };

/**
 * API Response with discriminated union for success/error
 */
export type ApiResponse<T> =
  | { success: true; data: T; meta?: { processingTime: number; cached: boolean } }
  | { success: false; error: { code: string; message: string; details?: unknown } };

// ==================== Strict Domain Models ====================

/**
 * GPS coordinates with branded types
 */
export interface GPSCoordinates {
  readonly latitude: Latitude;
  readonly longitude: Longitude;
  readonly accuracy: number; // meters
}

/**
 * Place with strict typing
 */
export interface StrictPlace {
  readonly id: PlaceId;
  readonly businessName: string;
  readonly category: PlaceCategory;
  readonly location: GPSCoordinates;
  readonly geofenceRadius: number; // meters
  readonly wifiSSIDs: ReadonlyArray<string>;
  readonly voucher: Voucher;
  readonly createdAt: ISODateString;
  readonly updatedAt: ISODateString;
  readonly isActive: boolean;
}

/**
 * Place categories (exhaustive enum)
 */
export enum PlaceCategory {
  CAFE = 'cafe',
  RESTAURANT = 'restaurant',
  FITNESS = 'fitness',
  BOOKSTORE = 'bookstore',
  BAKERY = 'bakery',
  BEAUTY = 'beauty',
  ENTERTAINMENT = 'entertainment',
  CONVENIENCE = 'convenience',
  LAUNDRY = 'laundry',
}

/**
 * Check-in request with strict typing
 */
export interface StrictCheckInRequest {
  readonly userId: UserId;
  readonly placeId: PlaceId;
  readonly location: GPSCoordinates;
  readonly wifi?: {
    readonly ssids: ReadonlyArray<string>;
  };
  readonly timestamp: ISODateString;
  readonly motion?: {
    readonly x: number;
    readonly y: number;
    readonly z: number;
  };
}

/**
 * User profile with strict typing
 */
export interface StrictUser {
  readonly id: UserId;
  readonly walletAddress: string;
  readonly level: number;
  readonly xp: number;
  readonly totalCheckIns: number;
  readonly createdAt: ISODateString;
  readonly lastActiveAt: ISODateString;
}

// ==================== Utility Types ====================

/**
 * Make all properties optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Make all properties readonly recursively
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/**
 * Extract keys of T that have values of type V
 */
export type KeysOfType<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never;
}[keyof T];

/**
 * Require at least one of the specified keys
 */
export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];

/**
 * Require exactly one of the specified keys
 */
export type RequireOnlyOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Record<Exclude<Keys, K>, undefined>>;
  }[Keys];

/**
 * Non-empty array
 */
export type NonEmptyArray<T> = [T, ...T[]];

/**
 * Tuple of fixed length
 */
export type Tuple<T, N extends number> = N extends N
  ? number extends N
    ? T[]
    : _TupleOf<T, N, []>
  : never;
type _TupleOf<T, N extends number, R extends unknown[]> = R['length'] extends N
  ? R
  : _TupleOf<T, N, [T, ...R]>;

// ==================== Type Guards ====================

/**
 * Type guard for UserId
 */
export function isUserId(value: unknown): value is UserId {
  return typeof value === 'string' && value.length > 0;
}

/**
 * Type guard for PlaceId
 */
export function isPlaceId(value: unknown): value is PlaceId {
  return typeof value === 'string' && value.length > 0;
}

/**
 * Type guard for valid latitude
 */
export function isValidLatitude(value: number): value is Latitude {
  return Number.isFinite(value) && value >= -90 && value <= 90;
}

/**
 * Type guard for valid longitude
 */
export function isValidLongitude(value: number): value is Longitude {
  return Number.isFinite(value) && value >= -180 && value <= 180;
}

/**
 * Type guard for ApiResponse success
 */
export function isApiSuccess<T>(response: ApiResponse<T>): response is Extract<ApiResponse<T>, { success: true }> {
  return response.success === true;
}

/**
 * Type guard for CheckInStatus
 */
export function isApprovedCheckIn(status: CheckInStatus): status is Extract<CheckInStatus, { type: 'approved' }> {
  return status.type === 'approved';
}

// ==================== Result Type (Railway-Oriented Programming) ====================

/**
 * Result type for railway-oriented programming
 */
export type Result<T, E = Error> = Ok<T> | Err<E>;

export interface Ok<T> {
  readonly ok: true;
  readonly value: T;
}

export interface Err<E> {
  readonly ok: false;
  readonly error: E;
}

export function ok<T>(value: T): Ok<T> {
  return { ok: true, value };
}

export function err<E>(error: E): Err<E> {
  return { ok: false, error };
}

export function isOk<T, E>(result: Result<T, E>): result is Ok<T> {
  return result.ok === true;
}

export function isErr<T, E>(result: Result<T, E>): result is Err<E> {
  return result.ok === false;
}

/**
 * Map over Result value
 */
export function mapResult<T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> {
  return isOk(result) ? ok(fn(result.value)) : result;
}

/**
 * FlatMap over Result (chain operations)
 */
export function flatMapResult<T, U, E>(result: Result<T, E>, fn: (value: T) => Result<U, E>): Result<U, E> {
  return isOk(result) ? fn(result.value) : result;
}

// ==================== Validation Helpers ====================

/**
 * Validate and create GPS coordinates
 */
export function createGPSCoordinates(
  lat: number,
  lng: number,
  accuracy: number
): Result<GPSCoordinates, string> {
  if (!isValidLatitude(lat)) {
    return err(`Invalid latitude: ${lat}`);
  }
  if (!isValidLongitude(lng)) {
    return err(`Invalid longitude: ${lng}`);
  }
  if (!Number.isFinite(accuracy) || accuracy < 0) {
    return err(`Invalid accuracy: ${accuracy}`);
  }

  return ok({
    latitude: lat as Latitude,
    longitude: lng as Longitude,
    accuracy,
  });
}

/**
 * Parse and validate check-in request
 */
export function parseCheckInRequest(data: unknown): Result<StrictCheckInRequest, string> {
  if (typeof data !== 'object' || data === null) {
    return err('Invalid request: not an object');
  }

  const req = data as any;

  // Validate user_id
  if (!isUserId(req.user_id)) {
    return err('Invalid user_id');
  }

  // Validate place_id
  if (!isPlaceId(req.place_id)) {
    return err('Invalid place_id');
  }

  // Validate location
  const coordsResult = createGPSCoordinates(
    req.location?.latitude,
    req.location?.longitude,
    req.location?.accuracy
  );
  if (!isOk(coordsResult)) {
    return err(`Invalid location: ${coordsResult.error}`);
  }

  // Validate timestamp
  try {
    createISODateString(req.timestamp);
  } catch (error) {
    return err(`Invalid timestamp: ${(error as Error).message}`);
  }

  return ok({
    userId: req.user_id,
    placeId: req.place_id,
    location: coordsResult.value,
    wifi: req.wifi ? { ssids: req.wifi.ssids } : undefined,
    timestamp: req.timestamp as ISODateString,
    motion: req.motion,
  });
}
