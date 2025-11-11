/**
 * Mock Database Layer (In-Memory)
 * For development/testing until Vercel Postgres is configured
 */

export interface Place {
  id: string;
  business_name: string;
  category: string;
  location: {
    latitude: number;
    longitude: number;
  };
  geofence_radius: number; // meters
  wifi_ssids?: string[];
  voucher_type: 'discount' | 'freebie' | 'cashback';
  voucher_value: number; // percentage or amount in USDC
  voucher_description: string;
  created_at: string;
}

export interface CheckIn {
  id: string;
  user_id: string;
  place_id: string;
  integrity_score: number;
  score_distance: number;
  score_wifi: number;
  score_time: number;
  score_accuracy: number;
  score_speed: number;
  status: 'approved' | 'rejected' | 'pending';
  created_at: string;
}

export interface User {
  id: string;
  wallet_address?: string;
  level: number;
  xp: number;
  total_check_ins: number;
  created_at: string;
}

// Mock Places Data (서울 강남 지역)
export const mockPlaces: Place[] = [
  {
    id: 'place-001',
    business_name: '카페 드롭탑',
    category: 'cafe',
    location: {
      latitude: 37.4979,
      longitude: 127.0276,
    },
    geofence_radius: 50,
    wifi_ssids: ['DropTop_Guest', 'DropTop_5G'],
    voucher_type: 'discount',
    voucher_value: 20,
    voucher_description: '아메리카노 20% 할인',
    created_at: new Date().toISOString(),
  },
  {
    id: 'place-002',
    business_name: '맛있는 감자탕',
    category: 'restaurant',
    location: {
      latitude: 37.4985,
      longitude: 127.0282,
    },
    geofence_radius: 50,
    wifi_ssids: ['GamjaTang_WiFi'],
    voucher_type: 'freebie',
    voucher_value: 5000,
    voucher_description: '공기밥 무료 제공',
    created_at: new Date().toISOString(),
  },
  {
    id: 'place-003',
    business_name: '피트니스 클럽 강남',
    category: 'fitness',
    location: {
      latitude: 37.4990,
      longitude: 127.0270,
    },
    geofence_radius: 30,
    wifi_ssids: ['Fitness_Gangnam', 'FG_Member'],
    voucher_type: 'cashback',
    voucher_value: 3,
    voucher_description: '3 USDC 캐시백',
    created_at: new Date().toISOString(),
  },
  {
    id: 'place-004',
    business_name: '북스토어 강남점',
    category: 'bookstore',
    location: {
      latitude: 37.4975,
      longitude: 127.0285,
    },
    geofence_radius: 40,
    wifi_ssids: ['BookStore_Free'],
    voucher_type: 'discount',
    voucher_value: 15,
    voucher_description: '전체 도서 15% 할인',
    created_at: new Date().toISOString(),
  },
  {
    id: 'place-005',
    business_name: '베이커리 하우스',
    category: 'bakery',
    location: {
      latitude: 37.4982,
      longitude: 127.0278,
    },
    geofence_radius: 45,
    wifi_ssids: ['BakeryHouse_WiFi', 'BH_Guest'],
    voucher_type: 'freebie',
    voucher_value: 2000,
    voucher_description: '크림빵 1개 무료',
    created_at: new Date().toISOString(),
  },
  {
    id: 'place-006',
    business_name: '헤어샵 스타일',
    category: 'beauty',
    location: {
      latitude: 37.4988,
      longitude: 127.0288,
    },
    geofence_radius: 35,
    wifi_ssids: ['StyleHair_5G'],
    voucher_type: 'cashback',
    voucher_value: 5,
    voucher_description: '5 USDC 캐시백',
    created_at: new Date().toISOString(),
  },
  {
    id: 'place-007',
    business_name: '치킨 대박',
    category: 'restaurant',
    location: {
      latitude: 37.4977,
      longitude: 127.0274,
    },
    geofence_radius: 50,
    wifi_ssids: ['DaebakChicken', 'Daebak_Guest'],
    voucher_type: 'discount',
    voucher_value: 25,
    voucher_description: '후라이드 치킨 25% 할인',
    created_at: new Date().toISOString(),
  },
  {
    id: 'place-008',
    business_name: 'PC방 게임존',
    category: 'entertainment',
    location: {
      latitude: 37.4992,
      longitude: 127.0280,
    },
    geofence_radius: 40,
    wifi_ssids: ['GameZone_PC', 'GZ_Member'],
    voucher_type: 'freebie',
    voucher_value: 2000,
    voucher_description: '2시간 무료 이용권',
    created_at: new Date().toISOString(),
  },
  {
    id: 'place-009',
    business_name: '편의점 24시',
    category: 'convenience',
    location: {
      latitude: 37.4980,
      longitude: 127.0273,
    },
    geofence_radius: 30,
    wifi_ssids: ['CVS24_WiFi'],
    voucher_type: 'cashback',
    voucher_value: 1,
    voucher_description: '1 USDC 캐시백',
    created_at: new Date().toISOString(),
  },
  {
    id: 'place-010',
    business_name: '코인 세탁소',
    category: 'laundry',
    location: {
      latitude: 37.4984,
      longitude: 127.0281,
    },
    geofence_radius: 35,
    wifi_ssids: ['CoinLaundry_Free'],
    voucher_type: 'discount',
    voucher_value: 30,
    voucher_description: '세탁 30% 할인',
    created_at: new Date().toISOString(),
  },
];

// Mock Users Data
export const mockUsers: Map<string, User> = new Map([
  [
    'user-test-001',
    {
      id: 'user-test-001',
      wallet_address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      level: 5,
      xp: 1250,
      total_check_ins: 42,
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
]);

// Mock Check-ins Storage
export const mockCheckIns: Map<string, CheckIn> = new Map();

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

/**
 * Find nearby places within radius
 */
export function getNearbyPlaces(
  userLat: number,
  userLon: number,
  radiusMeters: number = 500,
  maxResults: number = 20
): Place[] {
  const placesWithDistance = mockPlaces.map((place) => ({
    place,
    distance: calculateDistance(
      userLat,
      userLon,
      place.location.latitude,
      place.location.longitude
    ),
  }));

  return placesWithDistance
    .filter((p) => p.distance <= radiusMeters)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, maxResults)
    .map((p) => p.place);
}

/**
 * Get place by ID
 */
export function getPlaceById(placeId: string): Place | undefined {
  return mockPlaces.find((p) => p.id === placeId);
}

/**
 * Create or get user
 */
export function getOrCreateUser(userId: string): User {
  if (!mockUsers.has(userId)) {
    const newUser: User = {
      id: userId,
      level: 1,
      xp: 0,
      total_check_ins: 0,
      created_at: new Date().toISOString(),
    };
    mockUsers.set(userId, newUser);
  }
  return mockUsers.get(userId)!;
}

/**
 * Store check-in record
 */
export function storeCheckIn(checkIn: CheckIn): void {
  mockCheckIns.set(checkIn.id, checkIn);
}

/**
 * Get user's check-ins
 */
export function getUserCheckIns(userId: string): CheckIn[] {
  return Array.from(mockCheckIns.values())
    .filter((c) => c.user_id === userId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}
