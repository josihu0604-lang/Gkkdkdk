import { Redis } from '@upstash/redis';

// Initialize Redis client (use Upstash for serverless)
const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
    })
  : null;

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Token bucket rate limiter using Redis
 * 
 * Features:
 * - Sliding window algorithm
 * - Distributed rate limiting (works across multiple servers)
 * - Per-IP and per-user rate limiting
 * - Configurable limits and windows
 * 
 * @param identifier - Unique identifier (IP address or user ID)
 * @param limit - Maximum requests allowed
 * @param windowMs - Time window in milliseconds
 * @returns Rate limit result
 */
export async function rateLimit(
  identifier: string,
  limit: number = 100,
  windowMs: number = 60 * 1000 // 1 minute
): Promise<RateLimitResult> {
  // Fallback to in-memory rate limiting if Redis is not configured
  if (!redis) {
    return fallbackRateLimit(identifier, limit, windowMs);
  }
  
  const key = `rate_limit:${identifier}`;
  const now = Date.now();
  const windowStart = now - windowMs;
  
  try {
    // Use Redis pipeline for atomic operations
    const pipeline = redis.pipeline();
    
    // Remove old entries outside the window
    pipeline.zremrangebyscore(key, 0, windowStart);
    
    // Count requests in current window
    pipeline.zcard(key);
    
    // Add current request
    pipeline.zadd(key, { score: now, member: `${now}:${Math.random()}` });
    
    // Set expiration
    pipeline.expire(key, Math.ceil(windowMs / 1000));
    
    const results = await pipeline.exec();
    const count = (results[1] as number) || 0;
    
    const success = count < limit;
    const remaining = Math.max(0, limit - count - 1);
    const reset = now + windowMs;
    
    return {
      success,
      limit,
      remaining,
      reset,
    };
  } catch (error) {
    console.error('[Rate Limit Error]', error);
    // On error, allow the request (fail open)
    return {
      success: true,
      limit,
      remaining: limit,
      reset: now + windowMs,
    };
  }
}

/**
 * In-memory rate limiter fallback (for development/testing)
 */
const inMemoryStore = new Map<string, number[]>();

function fallbackRateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const windowStart = now - windowMs;
  
  // Get or create request history
  let requests = inMemoryStore.get(identifier) || [];
  
  // Remove old requests
  requests = requests.filter(timestamp => timestamp > windowStart);
  
  // Add current request
  requests.push(now);
  
  // Update store
  inMemoryStore.set(identifier, requests);
  
  // Clean up old entries periodically
  if (Math.random() < 0.01) {
    cleanupInMemoryStore(windowMs);
  }
  
  const success = requests.length <= limit;
  const remaining = Math.max(0, limit - requests.length);
  
  return {
    success,
    limit,
    remaining,
    reset: now + windowMs,
  };
}

function cleanupInMemoryStore(windowMs: number): void {
  const now = Date.now();
  const windowStart = now - windowMs;
  
  for (const [key, requests] of inMemoryStore.entries()) {
    const validRequests = requests.filter(timestamp => timestamp > windowStart);
    if (validRequests.length === 0) {
      inMemoryStore.delete(key);
    } else {
      inMemoryStore.set(key, validRequests);
    }
  }
}

/**
 * Rate limit presets for different endpoints
 */
export const RateLimitPresets = {
  // Strict: API endpoints, auth
  STRICT: { limit: 10, windowMs: 60 * 1000 }, // 10 req/min
  
  // Standard: Most API endpoints
  STANDARD: { limit: 100, windowMs: 60 * 1000 }, // 100 req/min
  
  // Generous: Public pages, static assets
  GENEROUS: { limit: 1000, windowMs: 60 * 1000 }, // 1000 req/min
  
  // Auth: Login, signup
  AUTH: { limit: 5, windowMs: 15 * 60 * 1000 }, // 5 req/15min
  
  // Email: Email sending
  EMAIL: { limit: 3, windowMs: 60 * 60 * 1000 }, // 3 req/hour
};

/**
 * Get client IP address from request
 * 
 * @param request - Next.js request object
 * @returns IP address string
 */
export function getClientIp(request: Request): string {
  // Check common headers for IP address
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  
  if (cfConnectingIp) {
    return cfConnectingIp;
  }
  if (realIp) {
    return realIp;
  }
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  return 'unknown';
}

/**
 * Rate limit middleware for API routes
 * 
 * Usage:
 * ```ts
 * export async function POST(request: Request) {
 *   const ip = getClientIp(request);
 *   const rateLimitResult = await rateLimit(ip, 10, 60000);
 *   
 *   if (!rateLimitResult.success) {
 *     return NextResponse.json(
 *       { error: 'Too many requests' },
 *       { 
 *         status: 429,
 *         headers: {
 *           'X-RateLimit-Limit': rateLimitResult.limit.toString(),
 *           'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
 *           'X-RateLimit-Reset': rateLimitResult.reset.toString(),
 *         }
 *       }
 *     );
 *   }
 *   
 *   // Process request...
 * }
 * ```
 */
export async function withRateLimit(
  request: Request,
  handler: () => Promise<Response>,
  preset: keyof typeof RateLimitPresets = 'STANDARD'
): Promise<Response> {
  const ip = getClientIp(request);
  const { limit, windowMs } = RateLimitPresets[preset];
  const result = await rateLimit(ip, limit, windowMs);
  
  const headers = new Headers();
  headers.set('X-RateLimit-Limit', result.limit.toString());
  headers.set('X-RateLimit-Remaining', result.remaining.toString());
  headers.set('X-RateLimit-Reset', result.reset.toString());
  
  if (!result.success) {
    return new Response(
      JSON.stringify({ error: 'Too many requests' }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          ...Object.fromEntries(headers),
        },
      }
    );
  }
  
  const response = await handler();
  
  // Add rate limit headers to successful response
  for (const [key, value] of headers.entries()) {
    response.headers.set(key, value);
  }
  
  return response;
}
