/**
 * ZZIK Platform SDK
 * Main entry point for the SDK
 */

// Export main client
export {
  ZZIKClient,
  createZZIKClient,
  ZZIKAPIError,
  type ZZIKClientConfig,
  type APIResponse,
  type PaginatedResponse,
  type RateLimitInfo,
  type User,
  type Place,
  type CheckIn,
  type CreateCheckInRequest,
  type GPSIntegrity,
  type Voucher,
  type Review,
  type CreateReviewRequest,
  type UpdateReviewRequest,
  type LeaderboardEntry,
} from './zzik-client';

// Export React hooks
export {
  ZZIKClientProvider,
  useZZIKClient,
  useNearbyPlaces,
  usePlace,
  useCheckIns,
  useCreateCheckIn,
  useVouchers,
  useRedeemVoucher,
  useReviews,
  useReview,
  useCreateReview,
  useUpdateReview,
  useDeleteReview,
  useMarkReviewHelpful,
  useLeaderboard,
  useGeolocation,
} from './hooks';

// Default export
export { default } from './zzik-client';
