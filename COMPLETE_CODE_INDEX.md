# 🎯 ZZIK 완전 코드 인덱스

이 문서는 ZZIK 플랫폼의 **모든 코드 파일 목록**과 **생성 방법**을 안내합니다.

---

## ✅ 이미 생성된 핵심 파일 (9개)

### 1. 비즈니스 문서 (2개)
- ✅ `business-docs/01_Business_Overview_v7.0.md` - 완전한 비즈니스 개요
- ✅ `business-docs/02_Legal_Compliance_Guide.md` - 법적 컴플라이언스

### 2. 디자인 시스템 (2개)
- ✅ `design-system/globals.css` - Linear 2025 완전 벤치마킹 (300+ 변수)
- ✅ `design-system/tokens.json` - W3C 디자인 토큰 (OKLCH 색상)

### 3. 데이터베이스 (1개)
- ✅ `database/schema.sql` - 완전한 PostgreSQL 스키마 (11 테이블, 50+ 인덱스, 트리거, 뷰)

### 4. Backend API (2개)
- ✅ `api/src/index.ts` - Express 서버 진입점
- ✅ `api/src/services/gps-integrity.service.ts` - 핵심 GPS 무결성 알고리즘

### 5. 프로젝트 설정 (2개)
- ✅ `MASTER_README.md` - 마스터 가이드
- ✅ `scripts/setup-project.sh` - 전체 프로젝트 자동 생성 스크립트

---

## 📦 나머지 코드 생성 방법

**옵션 A: 자동 생성 스크립트 실행** (추천)

```bash
cd ZZIK_Complete_Package/scripts
chmod +x setup-project.sh
./setup-project.sh
```

이 스크립트는 다음을 자동 생성합니다:
- API 나머지 40+ 파일 (controllers, middleware, models, routes, config)
- Landing 페이지 30+ 파일 (components, pages, i18n)
- WebApp 25+ 파일 (authenticated pages, map components)
- Mobile 앱 35+ 파일 (tabs, components, services)
- Infrastructure 10+ 파일 (Terraform modules)
- 설정 파일들 (package.json, tsconfig.json, Dockerfile 등)

**옵션 B: 개별 마스터 파일 참조**

아래 마스터 파일들에서 코드를 복사하여 생성:

1. `MASTER_API_COMPLETE.md` - 모든 API 코드 (생성 예정)
2. `MASTER_FRONTEND_COMPLETE.md` - 모든 프론트엔드 코드 (생성 예정)
3. `MASTER_MOBILE_COMPLETE.md` - 모든 모바일 코드 (생성 예정)
4. `MASTER_INFRASTRUCTURE.md` - Terraform 전체 코드 (생성 예정)

---

## 🔥 중요 API 코드 (추가 생성 필요)

### Config Files (7개)

**`api/src/config/environment.ts`**
```typescript
import dotenv from 'dotenv';
dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  apiUrl: process.env.API_URL || 'http://localhost:3000',
  
  database: {
    url: process.env.DATABASE_URL || '',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME || 'zzik_db',
    user: process.env.DB_USER || 'zzik_user',
    password: process.env.DB_PASSWORD || '',
    ssl: process.env.DB_SSL === 'true',
  },
  
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'change-this-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },
  
  aws: {
    region: process.env.AWS_REGION || 'ap-northeast-2',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    s3BucketName: process.env.S3_BUCKET_NAME || '',
    cloudfrontUrl: process.env.CLOUDFRONT_URL || '',
  },
  
  kakao: {
    restApiKey: process.env.KAKAO_REST_API_KEY || '',
    adminKey: process.env.KAKAO_ADMIN_KEY || '',
  },
  
  sentry: {
    dsn: process.env.SENTRY_DSN || '',
  },
  
  corsOrigins: (process.env.CORS_ORIGINS || '').split(','),
  
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
};
```

**`api/src/config/database.ts`**
```typescript
import { Pool, PoolConfig } from 'pg';
import { config } from './environment';

const poolConfig: PoolConfig = {
  host: config.database.host,
  port: config.database.port,
  database: config.database.name,
  user: config.database.user,
  password: config.database.password,
  ssl: config.database.ssl ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
};

export const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
  process.exit(-1);
});

export async function connectDatabase(): Promise<void> {
  try {
    const client = await pool.connect();
    console.log('✅ PostgreSQL connected');
    client.release();
  } catch (error) {
    console.error('❌ PostgreSQL connection error:', error);
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  await pool.end();
  console.log('🔌 PostgreSQL disconnected');
}

export default pool;
```

**`api/src/config/redis.ts`**
```typescript
import { createClient, RedisClientType } from 'redis';
import { config } from './environment';

export let redisClient: RedisClientType;

export async function initRedis(): Promise<void> {
  redisClient = createClient({
    url: config.redis.url,
    password: config.redis.password,
  });

  redisClient.on('error', (err) => console.error('Redis Client Error', err));
  redisClient.on('connect', () => console.log('Redis Client Connecting...'));
  redisClient.on('ready', () => console.log('✅ Redis Client Ready'));

  await redisClient.connect();
}

export async function disconnectRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    console.log('🔌 Redis disconnected');
  }
}

export default redisClient;
```

### Controllers (8개)

**`api/src/controllers/checkin.controller.ts`** (핵심)
```typescript
import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/database';
import { GPSIntegrityService } from '../services/gps-integrity.service';

export class CheckinController {
  /**
   * POST /api/v1/checkins
   * 체크인 시도 (GPS 무결성 검증 포함)
   */
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        hospitalId,
        placeId,
        latitude,
        longitude,
        accuracy,
        wifiSSID,
        timestamp,
      } = req.body;

      const userId = req.user!.id;

      // 1. 타겟 정보 조회 (병원 또는 프랜차이즈)
      let target: any;
      let targetType: 'hospital' | 'place';

      if (hospitalId) {
        const result = await pool.query(
          'SELECT id, latitude, longitude, geofence_radius, wifi_ssid FROM hospitals WHERE id = $1 AND deleted_at IS NULL',
          [hospitalId]
        );
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Hospital not found' });
        }
        target = result.rows[0];
        targetType = 'hospital';
      } else if (placeId) {
        const result = await pool.query(
          'SELECT id, latitude, longitude, geofence_radius, wifi_ssid FROM places WHERE id = $1 AND deleted_at IS NULL',
          [placeId]
        );
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Place not found' });
        }
        target = result.rows[0];
        targetType = 'place';
      } else {
        return res.status(400).json({ error: 'Either hospitalId or placeId is required' });
      }

      // 2. 마지막 체크인 조회 (Velocity 계산용)
      const lastCheckinResult = await pool.query(
        `SELECT user_latitude, user_longitude, created_at 
         FROM checkins 
         WHERE user_id = $1 AND status = 'verified'
         ORDER BY created_at DESC 
         LIMIT 1`,
        [userId]
      );

      const lastCheckin = lastCheckinResult.rows[0];

      // 3. GPS 무결성 검증
      const integrityResult = await GPSIntegrityService.verifyCheckin({
        userLat: parseFloat(latitude),
        userLng: parseFloat(longitude),
        targetLat: parseFloat(target.latitude),
        targetLng: parseFloat(target.longitude),
        gpsAccuracy: parseFloat(accuracy),
        detectedWifiSSID: wifiSSID,
        expectedWifiSSID: target.wifi_ssid,
        timestamp: new Date(timestamp),
        lastCheckinTimestamp: lastCheckin ? new Date(lastCheckin.created_at) : undefined,
        lastCheckinLat: lastCheckin ? parseFloat(lastCheckin.user_latitude) : undefined,
        lastCheckinLng: lastCheckin ? parseFloat(lastCheckin.user_longitude) : undefined,
        geofenceRadius: target.geofence_radius,
      });

      // 4. 체크인 기록 저장
      const checkinResult = await pool.query(
        `INSERT INTO checkins (
          user_id, ${targetType}_id, user_latitude, user_longitude, 
          gps_accuracy, detected_wifi_ssid, integrity_score, 
          integrity_details, status, device_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *`,
        [
          userId,
          target.id,
          latitude,
          longitude,
          accuracy,
          wifiSSID,
          integrityResult.score,
          JSON.stringify(integrityResult.details),
          integrityResult.passed ? 'verified' : 'rejected',
          req.headers['user-agent'],
        ]
      );

      const checkin = checkinResult.rows[0];

      // 5. 통과 시 스탬프 적립
      if (integrityResult.passed) {
        await pool.query(
          'UPDATE users SET total_stamps = total_stamps + 1 WHERE id = $1',
          [userId]
        );
      }

      // 6. 응답
      res.status(201).json({
        checkin,
        integrity: integrityResult,
        message: integrityResult.passed
          ? 'Check-in verified successfully'
          : 'Check-in failed verification',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/checkins/me
   * 내 체크인 내역
   */
  static async getMyCheckins(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { limit = '20', offset = '0' } = req.query;

      const result = await pool.query(
        `SELECT c.*, 
                h.display_name as hospital_name,
                p.name as place_name
         FROM checkins c
         LEFT JOIN hospitals h ON c.hospital_id = h.id
         LEFT JOIN places p ON c.place_id = p.id
         WHERE c.user_id = $1
         ORDER BY c.created_at DESC
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
      );

      res.json({
        checkins: result.rows,
        total: result.rowCount,
      });
    } catch (error) {
      next(error);
    }
  }
}
```

### Middleware (6개)

**`api/src/middleware/auth.ts`**
```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/environment';
import { pool } from '../config/database';

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    
    const decoded = jwt.verify(token, config.jwt.secret) as any;
    
    const result = await pool.query(
      'SELECT id, email, role FROM users WHERE id = $1 AND deleted_at IS NULL',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    next(error);
  }
}

export function authorize(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
}
```

**`api/src/middleware/rate-limiter.ts`**
```typescript
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redisClient } from '../config/redis';
import { config } from '../config/environment';

export const rateLimiter = rateLimit({
  store: new RedisStore({
    // @ts-ignore
    client: redisClient,
    prefix: 'rl:',
  }),
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

export const strictRateLimiter = rateLimit({
  store: new RedisStore({
    // @ts-ignore
    client: redisClient,
    prefix: 'rl:strict:',
  }),
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: 'Rate limit exceeded',
});
```

**`api/src/middleware/error-handler.ts`**
```typescript
import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    requestId: req.id,
    path: req.path,
    method: req.method,
  });

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.details,
    });
  }

  if (err.code === '23505') {
    return res.status(409).json({
      error: 'Duplicate entry',
      field: err.constraint,
    });
  }

  res.status(err.statusCode || 500).json({
    error: err.message || 'Internal Server Error',
    requestId: req.id,
  });
}
```

---

## 🌐 프론트엔드 코드 (추가 생성 필요)

### Landing Page 핵심 컴포넌트

**`landing/components/ui/Button.tsx`**
```typescript
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-primary-600 text-white hover:bg-primary-700': variant === 'primary',
            'bg-gray-200 text-gray-900 hover:bg-gray-300': variant === 'secondary',
            'border-2 border-primary-600 text-primary-600 hover:bg-primary-50': variant === 'outline',
            'text-gray-700 hover:bg-gray-100': variant === 'ghost',
          },
          {
            'h-9 px-4 text-sm': size === 'sm',
            'h-11 px-6 text-base': size === 'md',
            'h-14 px-8 text-lg': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

---

## 📲 모바일 앱 코드 (추가 생성 필요)

**`mobile/app/(tabs)/index.tsx`** (메인 맵 화면)
```typescript
import { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import * as Location from 'expo-location';

export default function MapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [hospitals, setHospitals] = useState([]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required');
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
      
      // Fetch nearby hospitals
      // fetchNearbyHospitals(loc.coords.latitude, loc.coords.longitude);
    })();
  }, []);

  if (!location) {
    return <View style={styles.container}><Text>Loading...</Text></View>;
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation
        showsMyLocationButton
      >
        {hospitals.map((hospital: any) => (
          <Marker
            key={hospital.id}
            coordinate={{
              latitude: hospital.latitude,
              longitude: hospital.longitude,
            }}
            title={hospital.display_name.ko}
          >
            <Circle
              center={{
                latitude: hospital.latitude,
                longitude: hospital.longitude,
              }}
              radius={hospital.geofence_radius}
              strokeColor="rgba(100, 100, 255, 0.5)"
              fillColor="rgba(100, 100, 255, 0.1)"
            />
          </Marker>
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});
```

---

## ☁️ Infrastructure 코드 (Terraform)

**`infrastructure/main.tf`** (일부)
```hcl
terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  backend "s3" {
    bucket = "zzik-terraform-state"
    key    = "infrastructure/terraform.tfstate"
    region = "ap-northeast-2"
  }
}

provider "aws" {
  region = var.region
}

module "vpc" {
  source = "./modules/vpc"
  
  project_name = var.project_name
  environment  = var.environment
  cidr_block   = "10.0.0.0/16"
}

module "rds" {
  source = "./modules/rds"
  
  project_name       = var.project_name
  environment        = var.environment
  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids
  instance_class     = var.db_instance_class
  master_password    = var.db_password
}

module "ecs" {
  source = "./modules/ecs"
  
  project_name       = var.project_name
  environment        = var.environment
  vpc_id             = module.vpc.vpc_id
  public_subnet_ids  = module.vpc.public_subnet_ids
  private_subnet_ids = module.vpc.private_subnet_ids
}
```

---

## 📄 전체 파일 생성 명령

```bash
# 1. 마스터 README 확인
cat MASTER_README.md

# 2. 프로젝트 셋업 실행
cd scripts
./setup-project.sh

# 3. 의존성 설치
./install-dependencies.sh

# 4. Docker Compose 실행
cd ..
docker-compose up -d

# 5. 데이터베이스 마이그레이션
docker exec -i zzik-postgres psql -U zzik_user -d zzik_db < database/schema.sql

# 6. 테스트
curl http://localhost:3000/health
```

---

## 📚 참조 문서

모든 코드는 다음 원칙에 따라 생성되었습니다:

1. **타입 안정성**: 모든 TypeScript 코드는 strict mode
2. **보안**: Helmet, Rate Limiting, JWT 인증
3. **성능**: 데이터베이스 인덱싱, Redis 캐싱
4. **확장성**: 모듈화된 아키텍처
5. **컴플라이언스**: 한국 법규 준수

---

**생성 도구**: IdeaBrowser Pro  
**마지막 업데이트**: 2025-11-11  
**버전**: 1.0.0
