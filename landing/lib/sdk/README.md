# ZZIK Platform SDK

Complete TypeScript client library for ZZIK Platform API with React Hooks support.

## Features

✅ **Type-Safe** - Full TypeScript support with comprehensive type definitions  
✅ **React Hooks** - Easy-to-use hooks for React applications  
✅ **Automatic Token Refresh** - Handles JWT refresh automatically  
✅ **Rate Limiting** - Built-in rate limit tracking  
✅ **Error Handling** - Custom error class with detailed information  
✅ **Pagination Support** - Cursor-based pagination helpers  
✅ **Optimistic Updates** - Support for optimistic UI patterns  

---

## Installation

```bash
# The SDK is included in the ZZIK platform
# For external projects, copy the sdk directory to your project
```

---

## Quick Start

### 1. Setup Client (Vanilla TypeScript/JavaScript)

```typescript
import { ZZIKClient } from '@/lib/sdk/zzik-client';

const client = new ZZIKClient({
  baseURL: 'https://api.zzik.io',
  apiKey: 'your-api-key', // Optional
  accessToken: 'user-access-token', // Optional
});

// Get nearby places
const places = await client.places.getNearby({
  lat: 37.5665,
  lng: 126.9780,
  radius: 5,
});

console.log(places.data); // Array of places
```

### 2. Setup Provider (React)

```typescript
import { ZZIKClientProvider } from '@/lib/sdk/hooks';

function App() {
  return (
    <ZZIKClientProvider
      config={{
        baseURL: process.env.NEXT_PUBLIC_API_URL,
        accessToken: getAccessToken(), // From your auth system
        onTokenRefresh: (tokens) => {
          // Save new tokens to storage
          localStorage.setItem('accessToken', tokens.accessToken);
          localStorage.setItem('refreshToken', tokens.refreshToken);
        },
      }}
    >
      <YourApp />
    </ZZIKClientProvider>
  );
}
```

### 3. Use Hooks in Components

```typescript
import { useNearbyPlaces, useGeolocation } from '@/lib/sdk/hooks';

function NearbyPlaces() {
  const { latitude, longitude } = useGeolocation();
  const { data, loading, error, refetch } = useNearbyPlaces({
    lat: latitude || 37.5665,
    lng: longitude || 126.9780,
    radius: 5,
  });

  if (loading) return <div>Loading places...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <button onClick={refetch}>Refresh</button>
      {data?.data?.map((place) => (
        <div key={place.id}>
          <h3>{place.name}</h3>
          <p>{place.addressFull}</p>
          <p>⭐ {place.averageRating} ({place.totalReviews} reviews)</p>
          <p>📍 {place.distance?.toFixed(2)} km away</p>
        </div>
      ))}
    </div>
  );
}
```

---

## API Reference

### Core Client

#### `ZZIKClient`

Main client class for API interactions.

```typescript
const client = new ZZIKClient({
  baseURL: string;           // API base URL
  apiKey?: string;           // Optional API key
  accessToken?: string;      // JWT access token
  refreshToken?: string;     // JWT refresh token
  onTokenRefresh?: (tokens) => void;  // Token refresh callback
  timeout?: number;          // Request timeout (default: 30000ms)
});
```

**Methods:**
- `setAccessToken(token: string)` - Update access token
- `setRefreshToken(token: string)` - Update refresh token
- `getAccessToken()` - Get current access token

---

### Places API

#### `client.places.getNearby(params)`

Get places near a location.

```typescript
const result = await client.places.getNearby({
  lat: 37.5665,
  lng: 126.9780,
  radius: 5,          // Optional, default 5km
  category: 'CAFE',   // Optional filter
  limit: 50,          // Optional, max results
});
```

#### `client.places.getById(placeId)`

Get place details by ID.

```typescript
const result = await client.places.getById('place-id');
```

#### `client.places.list(params)`

List all places (no location filter).

```typescript
const result = await client.places.list({
  category: 'RESTAURANT', // Optional
  limit: 100,             // Optional
});
```

#### `client.places.create(data)` *(Admin Only)*

Create a new place.

```typescript
const result = await client.places.create({
  name: 'Blue Bottle Coffee',
  category: 'CAFE',
  address: '서울특별시 강남구 테헤란로 123',
  latitude: 37.5665,
  longitude: 126.9780,
  description: 'Specialty coffee shop',
  wifiSsids: ['BlueBottle-Guest'],
});
```

---

### Check-ins API

#### `client.checkIns.create(data)`

Create a check-in with GPS validation.

```typescript
const result = await client.checkIns.create({
  userId: 'user-id',
  placeId: 'place-id',
  latitude: 37.5665,
  longitude: 126.9780,
  accuracy: 10,
  wifiNetworks: ['WiFi-SSID-1', 'WiFi-SSID-2'],
  deviceInfo: 'iPhone 14 Pro',
});

// Returns:
// {
//   checkIn: CheckIn,
//   integrity: {
//     totalScore: 85,
//     distanceScore: 90,
//     wifiScore: 80,
//     accuracyScore: 85,
//     ...
//   }
// }
```

#### `client.checkIns.list(params)`

List check-ins with filtering.

```typescript
const result = await client.checkIns.list({
  userId: 'user-id',       // Optional
  placeId: 'place-id',     // Optional
  status: 'APPROVED',      // Optional: PENDING, APPROVED, REJECTED
  limit: 20,               // Optional
  cursor: 'cursor-string', // For pagination
});
```

---

### Vouchers API

#### `client.vouchers.list(params)`

List vouchers.

```typescript
const result = await client.vouchers.list({
  userId: 'user-id',    // Optional
  placeId: 'place-id',  // Optional
  status: 'ACTIVE',     // Optional: ACTIVE, REDEEMED, EXPIRED
});
```

#### `client.vouchers.redeem(voucherId)`

Redeem a voucher.

```typescript
const result = await client.vouchers.redeem('voucher-id');
```

#### `client.vouchers.create(data)` *(Admin Only)*

Create a voucher.

```typescript
const result = await client.vouchers.create({
  userId: 'user-id',
  placeId: 'place-id',
  title: '20% Off Your Next Visit',
  description: 'Valid for 7 days',
  discountType: 'PERCENTAGE',
  discountValue: 20,
  expiresAt: '2025-12-31T23:59:59Z',
});
```

---

### Reviews API

#### `client.reviews.create(data)`

Create a review (requires prior check-in).

```typescript
const result = await client.reviews.create({
  placeId: 'place-id',
  userId: 'user-id',
  rating: 5,
  title: 'Amazing coffee!',
  content: 'Best latte I\'ve ever had. Great atmosphere too.',
  images: ['https://...', 'https://...'],
  visitDate: '2025-11-12T10:30:00Z',
});
```

#### `client.reviews.list(params)`

List reviews with filtering and pagination.

```typescript
const result = await client.reviews.list({
  placeId: 'place-id',  // Optional
  userId: 'user-id',    // Optional
  minRating: 4,         // Optional, 1-5
  maxRating: 5,         // Optional, 1-5
  sortBy: 'helpful',    // Optional: recent, helpful, rating
  limit: 20,            // Optional
  cursor: 'cursor',     // For pagination
});
```

#### `client.reviews.update(reviewId, data, userId)`

Update own review.

```typescript
const result = await client.reviews.update(
  'review-id',
  {
    rating: 4,
    title: 'Updated title',
    content: 'Updated content',
  },
  'user-id'
);
```

#### `client.reviews.delete(reviewId, userId)`

Delete own review (soft delete).

```typescript
const result = await client.reviews.delete('review-id', 'user-id');
```

#### `client.reviews.markHelpful(reviewId, userId)`

Mark review as helpful.

```typescript
const result = await client.reviews.markHelpful('review-id', 'user-id');
```

#### `client.reviews.removeHelpful(reviewId, userId)`

Remove helpful vote.

```typescript
const result = await client.reviews.removeHelpful('review-id', 'user-id');
```

#### `client.reviews.moderate(reviewId, action, adminId, reason)` *(Admin Only)*

Moderate a review.

```typescript
const result = await client.reviews.moderate(
  'review-id',
  'hide',           // approve, reject, hide, unhide
  'admin-id',
  'Spam content'    // Optional reason
);
```

---

### Leaderboard API

#### `client.leaderboard.get(limit)`

Get top users leaderboard.

```typescript
const result = await client.leaderboard.get(50);
```

---

## React Hooks

### Places Hooks

#### `useNearbyPlaces(params)`

```typescript
const { data, loading, error, refetch } = useNearbyPlaces({
  lat: 37.5665,
  lng: 126.9780,
  radius: 5,
  category: 'CAFE',
});
```

#### `usePlace(placeId)`

```typescript
const { data, loading, error, refetch } = usePlace('place-id');
```

---

### Check-ins Hooks

#### `useCheckIns(params)`

```typescript
const { data, loading, error, refetch } = useCheckIns({
  userId: 'user-id',
  status: 'APPROVED',
});
```

#### `useCreateCheckIn()`

```typescript
const { createCheckIn, loading, error } = useCreateCheckIn();

const handleCheckIn = async () => {
  try {
    const result = await createCheckIn({
      userId: 'user-id',
      placeId: 'place-id',
      latitude: 37.5665,
      longitude: 126.9780,
      accuracy: 10,
    });
    console.log('Check-in created:', result);
  } catch (err) {
    console.error('Failed:', err);
  }
};
```

---

### Reviews Hooks

#### `useReviews(params)`

```typescript
const {
  data,
  loading,
  error,
  refetch,
  loadMore,
  hasMore,
} = useReviews({
  placeId: 'place-id',
  sortBy: 'helpful',
});

// Load more reviews
<button onClick={loadMore} disabled={!hasMore}>
  Load More
</button>
```

#### `useCreateReview()`

```typescript
const { createReview, loading, error } = useCreateReview();

const handleSubmit = async (formData) => {
  try {
    const result = await createReview({
      placeId: 'place-id',
      userId: 'user-id',
      rating: formData.rating,
      title: formData.title,
      content: formData.content,
    });
    console.log('Review created:', result);
  } catch (err) {
    console.error('Failed:', err);
  }
};
```

#### `useMarkReviewHelpful()`

```typescript
const { markHelpful, loading, error } = useMarkReviewHelpful();

const handleVote = async (reviewId) => {
  try {
    await markHelpful(reviewId, userId);
    refetch(); // Refresh reviews list
  } catch (err) {
    console.error('Failed to vote:', err);
  }
};
```

---

### Utility Hooks

#### `useGeolocation()`

Get user's current location.

```typescript
const {
  latitude,
  longitude,
  accuracy,
  loading,
  error,
  refetch,
} = useGeolocation();

if (loading) return <div>Getting location...</div>;
if (error) return <div>Location error: {error.message}</div>;

return <div>Location: {latitude}, {longitude}</div>;
```

---

## Error Handling

### ZZIKAPIError

All API errors are instances of `ZZIKAPIError`.

```typescript
import { ZZIKAPIError } from '@/lib/sdk/zzik-client';

try {
  await client.checkIns.create(data);
} catch (error) {
  if (error instanceof ZZIKAPIError) {
    console.error('API Error:', error.message);
    console.error('Status Code:', error.statusCode);
    console.error('Details:', error.details);
    
    if (error.statusCode === 429) {
      console.log('Rate limit exceeded');
    }
  }
}
```

### Common Status Codes

- `400` - Validation failed
- `401` - Unauthorized (invalid/expired token)
- `403` - Forbidden (insufficient permissions)
- `404` - Resource not found
- `409` - Conflict (e.g., duplicate review)
- `429` - Rate limit exceeded
- `500` - Internal server error

---

## Rate Limiting

The SDK automatically tracks rate limit information in responses.

```typescript
const result = await client.reviews.create(data);

if (result.rateLimit) {
  console.log('Limit:', result.rateLimit.limit);
  console.log('Remaining:', result.rateLimit.remaining);
  console.log('Reset:', result.rateLimit.reset);
}
```

---

## Authentication

### Token Management

The SDK handles JWT tokens automatically:

1. **Set tokens** on initialization or login
2. **Auto-refresh** when access token expires
3. **Callback** notification on successful refresh

```typescript
const client = new ZZIKClient({
  baseURL: 'https://api.zzik.io',
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  onTokenRefresh: (tokens) => {
    // Save new tokens
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
  },
});

// Update token after login
client.setAccessToken('new-access-token');
client.setRefreshToken('new-refresh-token');
```

---

## TypeScript Support

Full TypeScript definitions included:

```typescript
import type {
  Place,
  CheckIn,
  Voucher,
  Review,
  User,
  APIResponse,
  PaginatedResponse,
} from '@/lib/sdk/zzik-client';

function handlePlace(place: Place) {
  console.log(place.name); // Type-safe!
}
```

---

## Examples

### Complete Check-in Flow

```typescript
import { useCreateCheckIn, useGeolocation } from '@/lib/sdk/hooks';

function CheckInButton({ placeId }) {
  const { latitude, longitude, accuracy } = useGeolocation();
  const { createCheckIn, loading } = useCreateCheckIn();
  
  const handleCheckIn = async () => {
    try {
      const result = await createCheckIn({
        userId: getCurrentUserId(),
        placeId,
        latitude: latitude!,
        longitude: longitude!,
        accuracy: accuracy!,
        wifiNetworks: await getWifiNetworks(),
      });
      
      if (result.data?.integrity.totalScore >= 80) {
        alert('Check-in approved! 🎉');
      } else {
        alert('Check-in pending review...');
      }
    } catch (error) {
      alert('Check-in failed');
    }
  };
  
  return (
    <button onClick={handleCheckIn} disabled={loading || !latitude}>
      {loading ? 'Checking in...' : 'Check In'}
    </button>
  );
}
```

### Review with Image Upload

```typescript
import { useCreateReview } from '@/lib/sdk/hooks';

function ReviewForm({ placeId }) {
  const { createReview, loading } = useCreateReview();
  const [images, setImages] = useState<string[]>([]);
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      await createReview({
        placeId,
        userId: getCurrentUserId(),
        rating: Number(formData.get('rating')),
        title: formData.get('title') as string,
        content: formData.get('content') as string,
        images: images,
      });
      alert('Review posted! ✅');
    } catch (error) {
      alert('Failed to post review');
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <select name="rating" required>
        {[1,2,3,4,5].map(n => <option key={n} value={n}>⭐ {n}</option>)}
      </select>
      <input name="title" placeholder="Title" required />
      <textarea name="content" placeholder="Your review" required />
      <ImageUpload onUpload={setImages} />
      <button type="submit" disabled={loading}>
        {loading ? 'Posting...' : 'Post Review'}
      </button>
    </form>
  );
}
```

---

## Best Practices

1. **Use Context Provider** - Wrap your app with `ZZIKClientProvider`
2. **Handle Loading States** - Always show loading indicators
3. **Error Boundaries** - Catch and display errors gracefully
4. **Token Storage** - Save tokens securely (encrypted storage on mobile)
5. **Refresh Callback** - Update stored tokens on refresh
6. **Rate Limiting** - Respect rate limits, show appropriate messages
7. **Optimistic Updates** - Update UI immediately, revert on error
8. **Pagination** - Use cursor-based pagination for large lists

---

## License

MIT License - Part of ZZIK Platform

## Support

For issues or questions, contact: dev@zzik.io
