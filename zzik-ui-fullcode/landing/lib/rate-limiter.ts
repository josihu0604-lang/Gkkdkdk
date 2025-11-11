/**
 * Advanced Rate Limiter using Token Bucket Algorithm
 * 
 * Token Bucket provides smooth rate limiting with burst capacity
 * - Tokens are added at a constant rate
 * - Each request consumes a token
 * - Requests are rejected when bucket is empty
 * - Supports burst traffic (bucket capacity > rate)
 */

interface TokenBucket {
  tokens: number;
  lastRefill: number;
}

interface RateLimitConfig {
  capacity: number; // Maximum tokens (burst capacity)
  refillRate: number; // Tokens added per second
  windowMs: number; // Time window for rate calculation
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
}

class TokenBucketRateLimiter {
  private buckets = new Map<string, TokenBucket>();
  private config: RateLimitConfig;
  
  constructor(config: RateLimitConfig) {
    this.config = config;
    
    // Cleanup old buckets every 5 minutes
    setInterval(() => this.cleanup(), 300000);
  }
  
  /**
   * Check if request is allowed
   */
  check(clientId: string, cost: number = 1): RateLimitResult {
    const now = Date.now();
    let bucket = this.buckets.get(clientId);
    
    if (!bucket) {
      // Create new bucket with full capacity
      bucket = {
        tokens: this.config.capacity,
        lastRefill: now,
      };
      this.buckets.set(clientId, bucket);
    }
    
    // Refill tokens based on elapsed time
    const elapsed = now - bucket.lastRefill;
    const tokensToAdd = (elapsed / 1000) * this.config.refillRate;
    bucket.tokens = Math.min(
      this.config.capacity,
      bucket.tokens + tokensToAdd
    );
    bucket.lastRefill = now;
    
    // Check if enough tokens available
    if (bucket.tokens >= cost) {
      // Consume tokens
      bucket.tokens -= cost;
      
      return {
        allowed: true,
        remaining: Math.floor(bucket.tokens),
        resetAt: now + ((this.config.capacity - bucket.tokens) / this.config.refillRate) * 1000,
      };
    } else {
      // Not enough tokens - calculate retry time
      const tokensNeeded = cost - bucket.tokens;
      const retryAfter = Math.ceil((tokensNeeded / this.config.refillRate) * 1000);
      
      return {
        allowed: false,
        remaining: 0,
        resetAt: now + retryAfter,
        retryAfter: Math.ceil(retryAfter / 1000),
      };
    }
  }
  
  /**
   * Clean up old buckets to prevent memory leaks
   */
  private cleanup(): void {
    const now = Date.now();
    const staleThreshold = now - this.config.windowMs * 2;
    
    for (const [clientId, bucket] of this.buckets.entries()) {
      if (bucket.lastRefill < staleThreshold) {
        this.buckets.delete(clientId);
      }
    }
  }
  
  /**
   * Reset bucket for a client (useful for testing)
   */
  reset(clientId: string): void {
    this.buckets.delete(clientId);
  }
  
  /**
   * Get current stats
   */
  getStats(): { totalClients: number; memoryUsage: number } {
    return {
      totalClients: this.buckets.size,
      memoryUsage: this.buckets.size * 32, // Approximate bytes per bucket
    };
  }
}

/**
 * Sliding Window Counter Rate Limiter
 * 
 * More accurate than fixed window, smoother than token bucket
 * - Combines current and previous window counts
 * - Weighted by time overlap
 * - No burst capacity, strict rate enforcement
 */
class SlidingWindowRateLimiter {
  private windows = new Map<string, { current: number; previous: number; windowStart: number }>();
  private config: { limit: number; windowMs: number };
  
  constructor(limit: number, windowMs: number) {
    this.config = { limit, windowMs };
    
    // Cleanup every 5 minutes
    setInterval(() => this.cleanup(), 300000);
  }
  
  check(clientId: string): RateLimitResult {
    const now = Date.now();
    const windowStart = Math.floor(now / this.config.windowMs) * this.config.windowMs;
    
    let window = this.windows.get(clientId);
    
    if (!window || window.windowStart < windowStart) {
      // New window or expired window
      const previous = window && window.windowStart === windowStart - this.config.windowMs
        ? window.current
        : 0;
      
      window = {
        current: 0,
        previous,
        windowStart,
      };
      this.windows.set(clientId, window);
    }
    
    // Calculate weighted count from sliding window
    const elapsedInWindow = now - windowStart;
    const previousWeight = 1 - (elapsedInWindow / this.config.windowMs);
    const weightedCount = window.previous * previousWeight + window.current;
    
    if (weightedCount < this.config.limit) {
      window.current++;
      
      const remaining = Math.floor(this.config.limit - weightedCount - 1);
      const resetAt = windowStart + this.config.windowMs;
      
      return {
        allowed: true,
        remaining: Math.max(0, remaining),
        resetAt,
      };
    } else {
      const resetAt = windowStart + this.config.windowMs;
      const retryAfter = Math.ceil((resetAt - now) / 1000);
      
      return {
        allowed: false,
        remaining: 0,
        resetAt,
        retryAfter,
      };
    }
  }
  
  private cleanup(): void {
    const now = Date.now();
    const staleThreshold = now - this.config.windowMs * 3;
    
    for (const [clientId, window] of this.windows.entries()) {
      if (window.windowStart < staleThreshold) {
        this.windows.delete(clientId);
      }
    }
  }
  
  reset(clientId: string): void {
    this.windows.delete(clientId);
  }
}

/**
 * Export singleton instances with production-ready configurations
 */

// Token Bucket: 10 requests/min with burst capacity of 15
export const tokenBucketLimiter = new TokenBucketRateLimiter({
  capacity: 15,           // Burst capacity (can handle 15 requests at once)
  refillRate: 10 / 60,    // 10 tokens per 60 seconds = 0.1667 tokens/sec
  windowMs: 60000,        // 1 minute window
});

// Sliding Window: Strict 20 requests per minute (no burst)
export const slidingWindowLimiter = new SlidingWindowRateLimiter(
  20,      // 20 requests
  60000    // per minute
);

// Aggressive limiter for sensitive endpoints (5 req/min)
export const strictLimiter = new TokenBucketRateLimiter({
  capacity: 5,
  refillRate: 5 / 60,
  windowMs: 60000,
});

/**
 * Helper function to get client identifier
 */
export function getClientId(request: Request | { headers: { get: (key: string) => string | null }; ip?: string }): string {
  // Try to get real IP from various headers (proxy-aware)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  
  const cfConnectingIp = request.headers.get('cf-connecting-ip'); // Cloudflare
  if (cfConnectingIp) {
    return cfConnectingIp;
  }
  
  // Fallback to request IP or anonymous
  return (request as any).ip || 'anonymous';
}

/**
 * Rate limit types for different endpoints
 */
export enum RateLimitType {
  DEFAULT = 'default',    // 10 req/min with burst
  STRICT = 'strict',      // 5 req/min
  SLIDING = 'sliding',    // 20 req/min strict
}

/**
 * Apply rate limiting based on type
 */
export function applyRateLimit(
  clientId: string,
  type: RateLimitType = RateLimitType.DEFAULT
): RateLimitResult {
  switch (type) {
    case RateLimitType.STRICT:
      return strictLimiter.check(clientId);
    case RateLimitType.SLIDING:
      return slidingWindowLimiter.check(clientId);
    case RateLimitType.DEFAULT:
    default:
      return tokenBucketLimiter.check(clientId);
  }
}
