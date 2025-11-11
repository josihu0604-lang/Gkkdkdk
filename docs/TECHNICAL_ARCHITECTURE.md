# ZZIK Technical Architecture

**Version**: 2.0.0  
**Date**: 2025-11-11  
**Status**: Production Architecture  
**Platform**: Location Discovery × Gamification Reward App

---

## 🏗️ System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      ZZIK PLATFORM                              │
│  Pokemon GO + Xiaohongshu for Local Discovery                   │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  Mobile App      │  │  Landing Pages   │  │  B2B Dashboard   │
│  (React Native)  │  │  (Next.js 15)    │  │  (Next.js 15)    │
│                  │  │                  │  │                  │
│  • Expo SDK 52   │  │  • ko/zh-CN/ja   │  │  • Analytics     │
│  • Mapbox GL     │  │  • next-intl     │  │  • Venue Mgmt    │
│  • Video Upload  │  │  • Framer Motion │  │  • ROI Dashboard │
└────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘
         │                     │                     │
         └──────────────┬──────┴─────────────────────┘
                        │
         ┌──────────────▼──────────────────────────────┐
         │         API Gateway (Next.js 15)            │
         │  • Rate Limiting (10 req/s per IP)          │
         │  • Idempotency-Key validation               │
         │  • JWT Authentication                       │
         └──────────────┬──────────────────────────────┘
                        │
         ┌──────────────▼──────────────────────────────┐
         │         Application Layer                   │
         │  ┌────────────────────────────────────────┐ │
         │  │  Check-in Service                      │ │
         │  │  • GPS Integrity (5-factor)            │ │
         │  │  • PostGIS ST_DWithin validation       │ │
         │  └────────────────────────────────────────┘ │
         │  ┌────────────────────────────────────────┐ │
         │  │  Reward Service                        │ │
         │  │  • USDC distribution (Web3)            │ │
         │  │  • Voucher generation                  │ │
         │  └────────────────────────────────────────┘ │
         │  ┌────────────────────────────────────────┐ │
         │  │  Video Service                         │ │
         │  │  • Upload to R2/S3                     │ │
         │  │  • Metadata extraction                 │ │
         │  │  • Feed algorithm (location-based)     │ │
         │  └────────────────────────────────────────┘ │
         └──────────────┬──────────────────────────────┘
                        │
         ┌──────────────▼──────────────────────────────┐
         │         Data Layer                          │
         │  ┌─────────────────┐  ┌──────────────────┐ │
         │  │  PostgreSQL     │  │  Redis Cache     │ │
         │  │  + PostGIS      │  │  (Sessions/Rate) │ │
         │  │  (Geospatial)   │  │                  │ │
         │  └─────────────────┘  └──────────────────┘ │
         │  ┌─────────────────┐  ┌──────────────────┐ │
         │  │  Cloudflare R2  │  │  Blockchain      │ │
         │  │  (Video Storage)│  │  (USDC on Base)  │ │
         │  └─────────────────┘  └──────────────────┘ │
         └─────────────────────────────────────────────┘
```

---

## 📱 Frontend Architecture

### **1. Mobile App (React Native / Expo)**

#### **Tech Stack**
```json
{
  "framework": "React Native 0.76.0",
  "runtime": "Expo SDK 52",
  "navigation": "Expo Router 4.0",
  "state": "Zustand 4.5",
  "api": "Axios + React Query",
  "map": "Mapbox GL Native 11.0",
  "video": "expo-av + expo-camera",
  "crypto": "@web3-react/core + ethers.js",
  "storage": "expo-secure-store",
  "permissions": "expo-location + expo-camera"
}
```

#### **Project Structure**
```
mobile/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx           # Tab 1: 탐험 (Map)
│   │   ├── feed.tsx            # Tab 2: 피드 (Reels)
│   │   ├── missions.tsx        # Tab 3: 미션 (Tasks)
│   │   ├── wallet.tsx          # Tab 4: 지갑 (Wallet)
│   │   └── profile.tsx         # Tab 5: 프로필 (Profile)
│   ├── checkin/
│   │   ├── [id].tsx            # Check-in flow
│   │   └── verify.tsx          # GPS verification
│   └── _layout.tsx             # Root layout
├── components/
│   ├── map/
│   │   ├── MapView.tsx
│   │   ├── VoucherMarker.tsx
│   │   └── UserLocation.tsx
│   ├── feed/
│   │   ├── ReelPlayer.tsx
│   │   ├── ActionButtons.tsx
│   │   └── CommentSheet.tsx
│   ├── wallet/
│   │   ├── BalanceCard.tsx
│   │   ├── VoucherList.tsx
│   │   └── WithdrawalModal.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       └── Input.tsx
├── services/
│   ├── api.ts                  # API client
│   ├── gps.ts                  # GPS integrity
│   ├── web3.ts                 # USDC wallet
│   └── video.ts                # Video upload
├── stores/
│   ├── auth.ts                 # Zustand auth store
│   ├── location.ts             # Location state
│   └── wallet.ts               # Wallet state
└── utils/
    ├── crypto.ts               # Web3 utilities
    ├── validators.ts           # Input validation
    └── formatters.ts           # Data formatting
```

#### **Key Features**

##### **GPS Integrity (Client-side Collection)**
```typescript
// services/gps.ts
import * as Location from 'expo-location';
import * as Network from 'expo-network';
import { Accelerometer } from 'expo-sensors';

interface GPSIntegrityData {
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude: number | null;
    speed: number | null;
  };
  wifi: {
    ssids: string[];
    signalStrengths: number[];
  };
  timestamp: string;
  deviceInfo: {
    platform: 'ios' | 'android';
    version: string;
  };
  motion: {
    x: number;
    y: number;
    z: number;
  };
}

export async function collectGPSData(): Promise<GPSIntegrityData> {
  // 1. Get location (high accuracy)
  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.BestForNavigation,
  });
  
  // 2. Scan Wi-Fi networks
  const wifiList = await Network.getNetworkStateAsync();
  
  // 3. Read accelerometer (motion detection)
  const motion = await Accelerometer.getLastSensorDataAsync();
  
  // 4. Collect device info
  const deviceInfo = {
    platform: Platform.OS,
    version: Platform.Version,
  };
  
  return {
    location: {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy,
      altitude: location.coords.altitude,
      speed: location.coords.speed,
    },
    wifi: {
      ssids: wifiList.ssid ? [wifiList.ssid] : [],
      signalStrengths: [], // Platform limitation
    },
    timestamp: new Date().toISOString(),
    deviceInfo,
    motion: motion || { x: 0, y: 0, z: 0 },
  };
}
```

##### **Video Upload (Vertical Reels)**
```typescript
// services/video.ts
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';

export async function uploadReel(
  videoUri: string,
  metadata: {
    placeId: string;
    latitude: number;
    longitude: number;
    caption?: string;
  }
): Promise<{ videoId: string; feedUrl: string }> {
  // 1. Get video file info
  const fileInfo = await FileSystem.getInfoAsync(videoUri);
  
  // 2. Create form data
  const formData = new FormData();
  formData.append('video', {
    uri: videoUri,
    type: 'video/mp4',
    name: 'reel.mp4',
  } as any);
  formData.append('metadata', JSON.stringify(metadata));
  
  // 3. Upload to API
  const response = await axios.post('/api/v1/videos', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      console.log(`Upload: ${percentCompleted}%`);
    },
  });
  
  return response.data;
}
```

##### **USDC Wallet Integration**
```typescript
// services/web3.ts
import { ethers } from 'ethers';
import * as SecureStore from 'expo-secure-store';

const USDC_CONTRACT_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'; // Base mainnet
const BASE_RPC_URL = 'https://mainnet.base.org';

export class USDCWallet {
  private provider: ethers.JsonRpcProvider;
  private signer: ethers.Wallet | null = null;
  
  constructor() {
    this.provider = new ethers.JsonRpcProvider(BASE_RPC_URL);
  }
  
  async getBalance(address: string): Promise<string> {
    const usdcContract = new ethers.Contract(
      USDC_CONTRACT_ADDRESS,
      ['function balanceOf(address) view returns (uint256)'],
      this.provider
    );
    
    const balance = await usdcContract.balanceOf(address);
    return ethers.formatUnits(balance, 6); // USDC has 6 decimals
  }
  
  async withdraw(to: string, amount: string): Promise<string> {
    if (!this.signer) throw new Error('Wallet not initialized');
    
    const usdcContract = new ethers.Contract(
      USDC_CONTRACT_ADDRESS,
      [
        'function transfer(address to, uint256 amount) returns (bool)',
      ],
      this.signer
    );
    
    const tx = await usdcContract.transfer(
      to,
      ethers.parseUnits(amount, 6)
    );
    
    await tx.wait();
    return tx.hash;
  }
}
```

---

### **2. Landing Pages (Next.js 15)**

#### **Tech Stack**
```json
{
  "framework": "Next.js 15.0.0",
  "react": "18.3.1",
  "routing": "App Router",
  "i18n": "next-intl 3.10",
  "animation": "Framer Motion 10.18",
  "forms": "React Hook Form + Zod",
  "analytics": "Vercel Analytics",
  "deployment": "Vercel / Cloudflare Pages"
}
```

#### **Project Structure**
```
landing/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx          # Locale layout
│   │   ├── page.tsx            # Home (splash)
│   │   ├── explore/            # Tourist landing (C-side)
│   │   │   └── page.tsx
│   │   ├── business/           # Business landing (B2B)
│   │   │   └── page.tsx
│   │   └── privacy/
│   │       └── page.tsx
│   ├── api/
│   │   └── v1/
│   │       ├── leads/
│   │       │   └── route.ts    # Lead form submission
│   │       └── analytics/
│   │           └── route.ts    # Event tracking
│   └── layout.tsx              # Root layout
├── components/
│   ├── home/
│   │   ├── SplashHero.tsx
│   │   └── AudienceSplit.tsx
│   ├── explore/
│   │   ├── HeroSection.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── PopularVenues.tsx
│   │   └── AppDownload.tsx
│   ├── business/
│   │   ├── HeroSection.tsx
│   │   ├── ROICalculator.tsx
│   │   ├── SuccessStories.tsx
│   │   └── PricingTable.tsx
│   └── shared/
│       ├── Header.tsx
│       ├── Footer.tsx
│       └── ComplianceBanner.tsx
├── i18n/
│   ├── locales/
│   │   ├── ko.json
│   │   ├── zh-CN.json
│   │   └── ja-JP.json
│   └── request.ts
└── middleware.ts               # next-intl middleware
```

#### **Multi-language Support**
```typescript
// middleware.ts
import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['ko', 'zh-CN', 'ja-JP'],
  defaultLocale: 'ko',
  localeDetection: true,
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
```

#### **API Routes**
```typescript
// app/api/v1/leads/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@vercel/postgres';

const leadSchema = z.object({
  business_name: z.string().min(2),
  contact_name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().regex(/^[\d\-\+\s()]+$/),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = leadSchema.parse(body);
    
    // Insert to database
    const db = createClient();
    await db.sql`
      INSERT INTO leads (business_name, contact_name, email, phone, created_at)
      VALUES (${data.business_name}, ${data.contact_name}, ${data.email}, ${data.phone}, NOW())
    `;
    
    // Send notification (async)
    await sendSlackNotification(data);
    
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

---

## 🔧 Backend Architecture

### **1. API Gateway (Next.js 15 API Routes)**

#### **Middleware Stack**
```typescript
// middleware/rateLimiter.ts
import { RateLimiter } from 'limiter';

const limiterMap = new Map<string, RateLimiter>();

export function rateLimiter(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  
  if (!limiterMap.has(ip)) {
    limiterMap.set(ip, new RateLimiter({
      tokensPerInterval: 10,
      interval: 'second',
    }));
  }
  
  const limiter = limiterMap.get(ip)!;
  const allowed = limiter.tryRemoveTokens(1);
  
  if (!allowed) {
    return new Response('Rate limit exceeded', { status: 429 });
  }
}
```

```typescript
// middleware/idempotency.ts
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

export async function checkIdempotency(key: string): Promise<boolean> {
  const exists = await redis.exists(key);
  if (exists) return false; // Already processed
  
  await redis.setex(key, 86400, 'processed'); // 24h TTL
  return true;
}
```

#### **Authentication**
```typescript
// middleware/auth.ts
import { jwtVerify, SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET!
);

export async function createToken(userId: string): Promise<string> {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload.sub as string;
  } catch {
    return null;
  }
}
```

---

### **2. Check-in Service**

#### **GPS Integrity Algorithm (Server-side)**
```typescript
// services/checkInService.ts
import { Client } from 'pg';

interface CheckInRequest {
  userId: string;
  placeId: string;
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  wifi: {
    ssids: string[];
  };
  timestamp: string;
}

export async function verifyCheckIn(data: CheckInRequest): Promise<{
  valid: boolean;
  score: number;
  reason?: string;
}> {
  const db = new Client({ connectionString: process.env.DATABASE_URL });
  await db.connect();
  
  try {
    // 1. Get place coordinates
    const placeResult = await db.query(`
      SELECT latitude, longitude, wifi_ssids
      FROM places
      WHERE id = $1
    `, [data.placeId]);
    
    if (placeResult.rows.length === 0) {
      return { valid: false, score: 0, reason: 'Place not found' };
    }
    
    const place = placeResult.rows[0];
    
    // 2. Calculate distance using PostGIS
    const distanceResult = await db.query(`
      SELECT ST_Distance(
        ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
        ST_SetSRID(ST_MakePoint($3, $4), 4326)::geography
      ) AS distance
    `, [
      data.location.longitude,
      data.location.latitude,
      place.longitude,
      place.latitude,
    ]);
    
    const distance = distanceResult.rows[0].distance;
    
    // 3. Calculate integrity score (5 factors)
    let score = 0;
    
    // Factor 1: Distance (40 points)
    if (distance <= 20) score += 40;
    else if (distance <= 40) score += Math.floor(40 * (1 - (distance - 20) / 20));
    
    // Factor 2: GPS Accuracy (10 points)
    if (data.location.accuracy <= 10) score += 10;
    else if (data.location.accuracy <= 30) score += Math.floor(10 * (1 - (data.location.accuracy - 10) / 20));
    
    // Factor 3: Wi-Fi Match (25 points)
    const matchingSSIDs = data.wifi.ssids.filter(ssid =>
      place.wifi_ssids?.includes(ssid)
    );
    score += Math.min(25, matchingSSIDs.length * 12);
    
    // Factor 4: Time consistency (15 points)
    const requestTime = new Date(data.timestamp);
    const now = new Date();
    const timeDiff = Math.abs(now.getTime() - requestTime.getTime());
    if (timeDiff <= 60000) score += 15; // Within 1 minute
    else if (timeDiff <= 300000) score += Math.floor(15 * (1 - timeDiff / 300000));
    
    // Factor 5: Speed check (10 points)
    const lastCheckIn = await db.query(`
      SELECT latitude, longitude, created_at
      FROM check_ins
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 1
    `, [data.userId]);
    
    if (lastCheckIn.rows.length > 0) {
      const last = lastCheckIn.rows[0];
      const lastTime = new Date(last.created_at);
      const timeElapsed = (now.getTime() - lastTime.getTime()) / 1000; // seconds
      
      const lastDistance = await db.query(`
        SELECT ST_Distance(
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
          ST_SetSRID(ST_MakePoint($3, $4), 4326)::geography
        ) AS distance
      `, [last.longitude, last.latitude, data.location.longitude, data.location.latitude]);
      
      const travelDistance = lastDistance.rows[0].distance;
      const speed = travelDistance / timeElapsed; // m/s
      const maxSpeed = 50; // 50 m/s = 180 km/h
      
      if (speed <= maxSpeed) score += 10;
    } else {
      score += 10; // First check-in
    }
    
    // 4. Validate (60+ points required)
    const valid = score >= 60;
    
    return { valid, score, reason: valid ? undefined : 'Integrity score too low' };
  } finally {
    await db.end();
  }
}
```

#### **Check-in API Endpoint**
```typescript
// app/api/v1/checkins/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyCheckIn } from '@/services/checkInService';
import { checkIdempotency } from '@/middleware/idempotency';

export async function POST(request: NextRequest) {
  const idempotencyKey = request.headers.get('Idempotency-Key');
  if (!idempotencyKey) {
    return NextResponse.json(
      { error: 'Idempotency-Key header required' },
      { status: 400 }
    );
  }
  
  // Check idempotency
  const isUnique = await checkIdempotency(idempotencyKey);
  if (!isUnique) {
    return NextResponse.json(
      { error: 'Duplicate request' },
      { status: 409 }
    );
  }
  
  const body = await request.json();
  
  // Verify GPS integrity
  const verification = await verifyCheckIn(body);
  
  if (!verification.valid) {
    return NextResponse.json(
      { error: verification.reason, score: verification.score },
      { status: 403 }
    );
  }
  
  // Award rewards (async)
  await awardRewards(body.userId, body.placeId);
  
  return NextResponse.json({
    success: true,
    score: verification.score,
  });
}
```

---

### **3. Reward Service**

#### **USDC Distribution**
```typescript
// services/rewardService.ts
import { ethers } from 'ethers';

const USDC_CONTRACT_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const PLATFORM_WALLET_PRIVATE_KEY = process.env.PLATFORM_WALLET_KEY!;

export async function distributeUSDC(
  userAddress: string,
  amount: string
): Promise<string> {
  const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
  const signer = new ethers.Wallet(PLATFORM_WALLET_PRIVATE_KEY, provider);
  
  const usdcContract = new ethers.Contract(
    USDC_CONTRACT_ADDRESS,
    ['function transfer(address to, uint256 amount) returns (bool)'],
    signer
  );
  
  const tx = await usdcContract.transfer(
    userAddress,
    ethers.parseUnits(amount, 6) // USDC has 6 decimals
  );
  
  await tx.wait();
  return tx.hash;
}
```

#### **Voucher Generation**
```typescript
// services/voucherService.ts
import { randomBytes } from 'crypto';
import QRCode from 'qrcode';

export async function generateVoucher(
  userId: string,
  placeId: string,
  reward: {
    type: 'discount' | 'free_item';
    value: string;
  }
): Promise<{
  code: string;
  qrCodeDataUrl: string;
  expiresAt: Date;
}> {
  // Generate unique code
  const code = randomBytes(16).toString('hex');
  
  // Create QR code
  const qrCodeDataUrl = await QRCode.toDataURL(code);
  
  // Set expiration (30 days)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);
  
  // Save to database
  await db.query(`
    INSERT INTO vouchers (code, user_id, place_id, reward_type, reward_value, expires_at)
    VALUES ($1, $2, $3, $4, $5, $6)
  `, [code, userId, placeId, reward.type, reward.value, expiresAt]);
  
  return { code, qrCodeDataUrl, expiresAt };
}
```

---

### **4. Video Service**

#### **Upload & Processing**
```typescript
// services/videoService.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const r2 = new S3Client({
  region: 'auto',
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function uploadVideo(
  file: Buffer,
  metadata: {
    userId: string;
    placeId: string;
    latitude: number;
    longitude: number;
  }
): Promise<{ videoId: string; url: string }> {
  const videoId = `${Date.now()}-${metadata.userId}`;
  const key = `videos/${videoId}.mp4`;
  
  // Upload to R2
  await r2.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
    Body: file,
    ContentType: 'video/mp4',
    Metadata: {
      userId: metadata.userId,
      placeId: metadata.placeId,
      latitude: metadata.latitude.toString(),
      longitude: metadata.longitude.toString(),
    },
  }));
  
  // Save to database
  await db.query(`
    INSERT INTO videos (id, user_id, place_id, latitude, longitude, storage_key)
    VALUES ($1, $2, $3, $4, $5, $6)
  `, [videoId, metadata.userId, metadata.placeId, metadata.latitude, metadata.longitude, key]);
  
  return {
    videoId,
    url: `https://cdn.zzik.com/${key}`,
  };
}
```

#### **Feed Algorithm (Location-based)**
```typescript
// services/feedService.ts
export async function getFeed(
  userId: string,
  userLocation: { latitude: number; longitude: number }
): Promise<Video[]> {
  // Algorithm: Show nearby videos first, then popular
  const result = await db.query(`
    WITH nearby AS (
      SELECT
        v.*,
        u.username,
        u.avatar_url,
        ST_Distance(
          ST_SetSRID(ST_MakePoint(v.longitude, v.latitude), 4326)::geography,
          ST_SetSRID(ST_MakePoint($2, $3), 4326)::geography
        ) AS distance,
        (
          SELECT COUNT(*) FROM video_likes WHERE video_id = v.id
        ) AS like_count
      FROM videos v
      JOIN users u ON v.user_id = u.id
      WHERE v.created_at > NOW() - INTERVAL '7 days'
      ORDER BY distance ASC, like_count DESC
      LIMIT 20
    ),
    popular AS (
      SELECT
        v.*,
        u.username,
        u.avatar_url,
        0 AS distance,
        (
          SELECT COUNT(*) FROM video_likes WHERE video_id = v.id
        ) AS like_count
      FROM videos v
      JOIN users u ON v.user_id = u.id
      WHERE v.created_at > NOW() - INTERVAL '7 days'
      ORDER BY like_count DESC
      LIMIT 10
    )
    SELECT * FROM nearby
    UNION ALL
    SELECT * FROM popular
    ORDER BY distance ASC, like_count DESC
    LIMIT 30
  `, [userId, userLocation.longitude, userLocation.latitude]);
  
  return result.rows;
}
```

---

## 💾 Database Architecture

### **PostgreSQL + PostGIS Schema**

```sql
-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  wallet_address VARCHAR(42), -- Ethereum address
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_wallet ON users(wallet_address);

-- Places table (venues/businesses)
CREATE TABLE places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'cafe', 'restaurant', 'shop', etc.
  address TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  location GEOGRAPHY(POINT, 4326), -- PostGIS geography type
  wifi_ssids TEXT[], -- Array of Wi-Fi SSIDs
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create spatial index on location
CREATE INDEX idx_places_location ON places USING GIST(location);

-- Add trigger to auto-populate location from lat/lng
CREATE OR REPLACE FUNCTION update_place_location()
RETURNS TRIGGER AS $$
BEGIN
  NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_place_location
BEFORE INSERT OR UPDATE ON places
FOR EACH ROW
EXECUTE FUNCTION update_place_location();

-- Check-ins table
CREATE TABLE check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  place_id UUID NOT NULL REFERENCES places(id),
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  accuracy DOUBLE PRECISION NOT NULL,
  integrity_score INTEGER NOT NULL, -- 0-100
  wifi_ssids TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_checkins_user ON check_ins(user_id);
CREATE INDEX idx_checkins_place ON check_ins(place_id);
CREATE INDEX idx_checkins_created ON check_ins(created_at DESC);

-- Videos table (Reels)
CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  place_id UUID REFERENCES places(id),
  storage_key TEXT NOT NULL, -- R2/S3 key
  thumbnail_url TEXT,
  caption TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  location GEOGRAPHY(POINT, 4326),
  duration INTEGER, -- seconds
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_videos_user ON videos(user_id);
CREATE INDEX idx_videos_place ON videos(place_id);
CREATE INDEX idx_videos_location ON videos USING GIST(location);
CREATE INDEX idx_videos_created ON videos(created_at DESC);

-- Video likes
CREATE TABLE video_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(video_id, user_id)
);

CREATE INDEX idx_video_likes_video ON video_likes(video_id);
CREATE INDEX idx_video_likes_user ON video_likes(user_id);

-- Vouchers table
CREATE TABLE vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(64) UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id),
  place_id UUID NOT NULL REFERENCES places(id),
  reward_type VARCHAR(20) NOT NULL, -- 'discount', 'free_item'
  reward_value TEXT NOT NULL,
  qr_code_url TEXT,
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_vouchers_user ON vouchers(user_id);
CREATE INDEX idx_vouchers_code ON vouchers(code);
CREATE INDEX idx_vouchers_expires ON vouchers(expires_at);

-- USDC transactions table
CREATE TABLE usdc_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  amount DECIMAL(18, 6) NOT NULL, -- USDC amount (6 decimals)
  type VARCHAR(20) NOT NULL, -- 'reward', 'withdrawal'
  tx_hash VARCHAR(66), -- Ethereum transaction hash
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

CREATE INDEX idx_usdc_user ON usdc_transactions(user_id);
CREATE INDEX idx_usdc_status ON usdc_transactions(status);
CREATE INDEX idx_usdc_created ON usdc_transactions(created_at DESC);

-- Missions table
CREATE TABLE missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL, -- 'daily', 'weekly', 'special'
  target_count INTEGER NOT NULL,
  reward_usdc DECIMAL(18, 6) NOT NULL,
  reward_badge_id UUID,
  required_level INTEGER DEFAULT 1,
  active BOOLEAN DEFAULT TRUE,
  starts_at TIMESTAMP DEFAULT NOW(),
  ends_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_missions_type ON missions(type);
CREATE INDEX idx_missions_active ON missions(active);

-- User missions (progress tracking)
CREATE TABLE user_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  mission_id UUID NOT NULL REFERENCES missions(id),
  current_count INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, mission_id)
);

CREATE INDEX idx_user_missions_user ON user_missions(user_id);
CREATE INDEX idx_user_missions_completed ON user_missions(completed);

-- Badges table
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  emoji VARCHAR(10) NOT NULL,
  rarity VARCHAR(20) NOT NULL, -- 'common', 'rare', 'epic', 'legendary'
  requirement_type VARCHAR(50) NOT NULL,
  requirement_value INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User badges (unlocked)
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  badge_id UUID NOT NULL REFERENCES badges(id),
  unlocked_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

CREATE INDEX idx_user_badges_user ON user_badges(user_id);
```

### **Example Queries**

#### **Find nearby venues**
```sql
-- Find all venues within 500m of user location
SELECT
  id,
  business_name,
  category,
  ST_Distance(
    location,
    ST_SetSRID(ST_MakePoint(127.0276, 37.4979), 4326)::geography
  ) AS distance
FROM places
WHERE ST_DWithin(
  location,
  ST_SetSRID(ST_MakePoint(127.0276, 37.4979), 4326)::geography,
  500
)
ORDER BY distance ASC;
```

#### **Get user feed (location-based)**
```sql
-- Get videos near user, sorted by proximity and popularity
SELECT
  v.id,
  v.caption,
  v.storage_key,
  u.username,
  u.avatar_url,
  ST_Distance(
    v.location,
    ST_SetSRID(ST_MakePoint(127.0276, 37.4979), 4326)::geography
  ) AS distance,
  (SELECT COUNT(*) FROM video_likes WHERE video_id = v.id) AS like_count
FROM videos v
JOIN users u ON v.user_id = u.id
WHERE v.created_at > NOW() - INTERVAL '7 days'
  AND ST_DWithin(
    v.location,
    ST_SetSRID(ST_MakePoint(127.0276, 37.4979), 4326)::geography,
    5000
  )
ORDER BY distance ASC, like_count DESC
LIMIT 30;
```

---

## 🔐 Security Architecture

### **1. Authentication & Authorization**
- **JWT tokens** (7-day expiration)
- **Refresh tokens** stored in secure cookies
- **Biometric authentication** on mobile (Face ID / Fingerprint)
- **2FA** for withdrawals (SMS / TOTP)

### **2. Data Protection**
- **Encryption at rest**: PostgreSQL with pgcrypto
- **Encryption in transit**: TLS 1.3
- **PII minimization**:
  - GPS coordinates NOT stored in logs
  - SSID hashed after 7 days
  - Video metadata stripped (EXIF)
- **GDPR/CCPA compliance**:
  - User data export API
  - Right to be forgotten (delete account)

### **3. API Security**
- **Rate limiting**: 10 requests/second per IP
- **Idempotency keys**: Prevent duplicate check-ins
- **CORS**: Strict origin whitelisting
- **CSP**: Content Security Policy headers
- **Input validation**: Zod schemas on all endpoints

### **4. GPS Integrity**
- **5-factor scoring**: Distance, Wi-Fi, Time, Accuracy, Speed
- **60+ points required** to pass
- **Server-side validation**: PostGIS ST_DWithin
- **Anti-spoofing**: Movement pattern analysis

---

## 📊 Infrastructure

### **Deployment Architecture**

```
┌─────────────────────────────────────────────────┐
│            Cloudflare                           │
│  ┌──────────────────────────────────────────┐  │
│  │  CDN + DDoS Protection                   │  │
│  │  • Static assets (images, videos)        │  │
│  │  • SSL/TLS termination                   │  │
│  └──────────────┬───────────────────────────┘  │
└─────────────────┼───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│            Vercel / Cloudflare Pages            │
│  ┌──────────────────────────────────────────┐  │
│  │  Next.js 15 Landing Pages                │  │
│  │  • ko / zh-CN / ja-JP locales            │  │
│  │  • API Routes (check-ins, leads)         │  │
│  │  • Edge Functions (rate limiting)        │  │
│  └──────────────┬───────────────────────────┘  │
└─────────────────┼───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│            Vercel Postgres                      │
│  • PostgreSQL 15 with PostGIS                   │
│  • Connection pooling (PgBouncer)               │
│  • Point-in-time recovery                       │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│            Cloudflare R2                        │
│  • S3-compatible object storage                 │
│  • Video storage ($.015/GB-month)               │
│  • Zero egress fees                             │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│            Upstash Redis                         │
│  • Session storage                               │
│  • Rate limiting counters                        │
│  • Idempotency key cache                         │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│            Base Mainnet (Coinbase)               │
│  • USDC contract (0x833589...bdA02913)           │
│  • Low transaction fees (~$0.01)                 │
│  • Fast finality (~2 seconds)                    │
└──────────────────────────────────────────────────┘
```

### **Cost Estimation (Monthly)**

| Service | Usage | Cost |
|---------|-------|------|
| **Vercel Pro** | Unlimited bandwidth | $20 |
| **Vercel Postgres** | 1GB storage, 1M rows | $20 |
| **Cloudflare R2** | 100GB storage, 1TB egress | $1.50 |
| **Upstash Redis** | 10K commands/day | Free tier |
| **Base Network** | 10K transactions/month | ~$100 |
| **Total** | | **~$142/month** |

---

## 🚀 Deployment Pipeline

### **CI/CD Workflow**

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run test
      - run: npm run lint
      - run: npm run type-check

  deploy-landing:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: vercel/actions/cli@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-args: '--prod'
          working-directory: landing

  deploy-mobile:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      - run: cd mobile && npx expo publish
```

---

## 📈 Monitoring & Observability

### **Metrics Tracked**
- **Performance**:
  - API response time (p50, p95, p99)
  - Database query duration
  - Video upload time
  - App launch time
- **Business**:
  - Check-ins per day
  - USDC distributed
  - Video uploads per day
  - Active users (DAU/MAU)
- **Security**:
  - Failed check-in attempts (integrity score < 60)
  - Rate limit violations
  - Authentication failures

### **Tools**
- **Vercel Analytics** - Web vitals, page views
- **Sentry** - Error tracking (frontend + backend)
- **PostHog** - Product analytics, funnels
- **Grafana** - Custom dashboards

---

## 🔮 Scalability Considerations

### **Horizontal Scaling**
- **Next.js API Routes**: Serverless, auto-scales on Vercel
- **Database**: Read replicas for analytics queries
- **Redis**: Redis Cluster for high availability
- **Video Storage**: Cloudflare R2 scales infinitely

### **Performance Optimization**
- **CDN caching**: Static assets at edge (Cloudflare)
- **Database indexing**: Spatial indexes on PostGIS columns
- **Connection pooling**: PgBouncer for PostgreSQL
- **Query optimization**: Materialized views for analytics

### **Future Enhancements**
- **GraphQL API** (Apollo Server) for flexible queries
- **Kafka/Redis Streams** for event-driven architecture
- **Microservices** (separate check-in, video, reward services)
- **Multi-region deployment** (Asia, Europe, US)

---

**Status**: ✅ Architecture Complete  
**Next**: Tourist Landing Page Implementation

---

**Version History**:
- **v1.0.0** (2025-11-01): Initial architecture
- **v2.0.0** (2025-11-11): Complete rewrite with GPS integrity, USDC rewards, video feed
