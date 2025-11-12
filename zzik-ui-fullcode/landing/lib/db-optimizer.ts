/**
 * Database Query Optimizer
 * Provides optimized query patterns, connection pooling, and performance monitoring
 */

import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

/**
 * Query Performance Monitoring
 */
interface QueryMetrics {
  query: string;
  duration: number;
  timestamp: Date;
  model?: string;
  operation?: string;
}

const queryMetrics: QueryMetrics[] = [];
const MAX_METRICS = 1000; // Keep last 1000 queries

/**
 * Log query performance
 */
function logQueryMetrics(metrics: QueryMetrics): void {
  queryMetrics.push(metrics);
  
  // Keep only last MAX_METRICS
  if (queryMetrics.length > MAX_METRICS) {
    queryMetrics.shift();
  }
  
  // Warn on slow queries (>1000ms)
  if (metrics.duration > 1000) {
    logger.warn('Slow query detected', {
      query: metrics.query,
      duration: metrics.duration,
      model: metrics.model,
      operation: metrics.operation,
    });
  }
}

/**
 * Get query statistics
 */
export function getQueryStats(): {
  total: number;
  avgDuration: number;
  slowQueries: QueryMetrics[];
  byModel: Record<string, { count: number; avgDuration: number }>;
} {
  const slowQueries = queryMetrics.filter((m) => m.duration > 1000);
  const avgDuration = queryMetrics.reduce((sum, m) => sum + m.duration, 0) / queryMetrics.length;
  
  const byModel: Record<string, { count: number; totalDuration: number }> = {};
  queryMetrics.forEach((m) => {
    if (m.model) {
      if (!byModel[m.model]) {
        byModel[m.model] = { count: 0, totalDuration: 0 };
      }
      byModel[m.model].count++;
      byModel[m.model].totalDuration += m.duration;
    }
  });
  
  const byModelStats: Record<string, { count: number; avgDuration: number }> = {};
  Object.entries(byModel).forEach(([model, stats]) => {
    byModelStats[model] = {
      count: stats.count,
      avgDuration: stats.totalDuration / stats.count,
    };
  });
  
  return {
    total: queryMetrics.length,
    avgDuration,
    slowQueries,
    byModel: byModelStats,
  };
}

/**
 * Prisma middleware for performance monitoring
 */
export function createPerformanceMiddleware() {
  return async (params: any, next: any) => {
    const start = Date.now();
    const result = await next(params);
    const duration = Date.now() - start;
    
    logQueryMetrics({
      query: `${params.model}.${params.action}`,
      duration,
      timestamp: new Date(),
      model: params.model,
      operation: params.action,
    });
    
    return result;
  };
}

/**
 * Optimized query patterns
 */

/**
 * Batch load users by IDs
 * Reduces N+1 query problems
 */
export async function batchLoadUsers(
  prisma: PrismaClient,
  userIds: string[]
): Promise<Map<string, any>> {
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: {
      id: true,
      walletAddress: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      level: true,
      totalPoints: true,
    },
  });
  
  return new Map(users.map((u) => [u.id, u]));
}

/**
 * Batch load places by IDs
 */
export async function batchLoadPlaces(
  prisma: PrismaClient,
  placeIds: string[]
): Promise<Map<string, any>> {
  const places = await prisma.place.findMany({
    where: { id: { in: placeIds } },
    select: {
      id: true,
      name: true,
      category: true,
      latitude: true,
      longitude: true,
      addressFull: true,
      imageUrl: true,
      averageRating: true,
      totalCheckIns: true,
      isActive: true,
    },
  });
  
  return new Map(places.map((p) => [p.id, p]));
}

/**
 * Get places near location with efficient spatial query
 * Uses composite index on (latitude, longitude)
 */
export async function getPlacesNearby(
  prisma: PrismaClient,
  latitude: number,
  longitude: number,
  radiusKm: number = 5,
  options?: {
    category?: string;
    limit?: number;
    offset?: number;
  }
) {
  // Calculate lat/lng bounds
  const latDelta = radiusKm / 111.32; // 1 degree lat ≈ 111.32 km
  const lngDelta = radiusKm / (111.32 * Math.cos((latitude * Math.PI) / 180));
  
  const minLat = latitude - latDelta;
  const maxLat = latitude + latDelta;
  const minLng = longitude - lngDelta;
  const maxLng = longitude + lngDelta;
  
  // Use indexed query for fast filtering
  const where: any = {
    latitude: { gte: minLat, lte: maxLat },
    longitude: { gte: minLng, lte: maxLng },
    isActive: true,
  };
  
  if (options?.category) {
    where.category = options.category;
  }
  
  const places = await prisma.place.findMany({
    where,
    select: {
      id: true,
      name: true,
      category: true,
      latitude: true,
      longitude: true,
      addressFull: true,
      imageUrl: true,
      averageRating: true,
      totalCheckIns: true,
    },
    take: options?.limit || 50,
    skip: options?.offset || 0,
    orderBy: { totalCheckIns: 'desc' },
  });
  
  // Calculate actual distance and sort
  const placesWithDistance = places.map((place) => {
    const distance = calculateDistance(
      latitude,
      longitude,
      Number(place.latitude),
      Number(place.longitude)
    );
    return { ...place, distance };
  });
  
  return placesWithDistance
    .filter((p) => p.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance);
}

/**
 * Haversine formula for distance calculation
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Get user with related data (optimized with select)
 */
export async function getUserWithStats(
  prisma: PrismaClient,
  userId: string
) {
  const [user, checkInCount, voucherCount, reviewCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        walletAddress: true,
        username: true,
        email: true,
        displayName: true,
        bio: true,
        avatarUrl: true,
        level: true,
        totalPoints: true,
        currentStreak: true,
        longestStreak: true,
        createdAt: true,
        lastActiveAt: true,
      },
    }),
    prisma.checkIn.count({ where: { userId, status: 'APPROVED' } }),
    prisma.voucher.count({ where: { userId, status: 'ACTIVE' } }),
    prisma.review.count({ where: { userId, isApproved: true } }),
  ]);
  
  if (!user) {
    return null;
  }
  
  return {
    ...user,
    stats: {
      checkInCount,
      voucherCount,
      reviewCount,
    },
  };
}

/**
 * Get user leaderboard with efficient pagination
 */
export async function getLeaderboard(
  prisma: PrismaClient,
  options?: {
    limit?: number;
    offset?: number;
    timeframe?: 'all' | 'month' | 'week';
  }
) {
  const limit = options?.limit || 50;
  const offset = options?.offset || 0;
  
  // Use indexed totalPoints for fast sorting
  const users = await prisma.user.findMany({
    select: {
      id: true,
      walletAddress: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      level: true,
      totalPoints: true,
      currentStreak: true,
      longestStreak: true,
    },
    orderBy: { totalPoints: 'desc' },
    take: limit,
    skip: offset,
  });
  
  return users.map((user, index) => ({
    ...user,
    rank: offset + index + 1,
  }));
}

/**
 * Connection pool configuration
 */
export const connectionPoolConfig = {
  // Vercel Postgres recommends these settings
  connection_limit: 10, // Max connections per instance
  pool_timeout: 20, // Seconds
  connect_timeout: 10, // Seconds
  statement_timeout: 30000, // Milliseconds (30s)
  query_timeout: 30000, // Milliseconds (30s)
};

/**
 * Database health check
 */
export async function checkDatabaseHealth(
  prisma: PrismaClient
): Promise<{
  healthy: boolean;
  latency: number;
  error?: string;
}> {
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const latency = Date.now() - start;
    
    return {
      healthy: true,
      latency,
    };
  } catch (error) {
    return {
      healthy: false,
      latency: -1,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Transaction helper with retry logic
 */
export async function executeTransaction<T>(
  prisma: PrismaClient,
  callback: (tx: any) => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await prisma.$transaction(callback, {
        maxWait: 5000, // 5 seconds
        timeout: 30000, // 30 seconds
      });
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Transaction failed');
      
      // Only retry on deadlock or serialization errors
      if (
        lastError.message.includes('deadlock') ||
        lastError.message.includes('serialization')
      ) {
        logger.warn(`Transaction failed (attempt ${attempt}/${maxRetries})`, {
          error: lastError.message,
        });
        
        // Exponential backoff
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 100));
        }
      } else {
        // Don't retry on other errors
        throw lastError;
      }
    }
  }
  
  throw lastError;
}

/**
 * Cursor-based pagination helper
 * More efficient than offset-based for large datasets
 */
export interface CursorPaginationOptions {
  cursor?: string;
  limit?: number;
  orderBy?: any;
}

export async function cursorPaginate<T>(
  prisma: any,
  model: string,
  where: any,
  options: CursorPaginationOptions
) {
  const limit = options.limit || 20;
  const cursor = options.cursor ? { id: options.cursor } : undefined;
  
  const items = await prisma[model].findMany({
    where,
    take: limit + 1, // Fetch one more to check if there are more items
    ...(cursor && { cursor, skip: 1 }), // Skip the cursor item
    orderBy: options.orderBy || { createdAt: 'desc' },
  });
  
  const hasMore = items.length > limit;
  const results = hasMore ? items.slice(0, limit) : items;
  const nextCursor = hasMore ? results[results.length - 1].id : null;
  
  return {
    items: results,
    nextCursor,
    hasMore,
  };
}
