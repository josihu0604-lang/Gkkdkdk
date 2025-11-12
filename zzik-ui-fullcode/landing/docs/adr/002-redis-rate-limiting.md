# ADR 002: Redis-based Rate Limiting with Upstash

## Status
**Accepted** - 2025-11-12

## Context
API endpoints need rate limiting to:
- Prevent abuse and DDoS attacks
- Ensure fair resource allocation
- Protect against brute force attacks
- Maintain service quality

Traditional in-memory rate limiting doesn't work in:
- Serverless environments (stateless)
- Multi-instance deployments
- Edge computing

## Decision
Implement distributed rate limiting using Redis (Upstash) with sliding window algorithm.

## Rationale

### Why Redis?
1. **Distributed**: Works across multiple servers/regions
2. **Fast**: Sub-millisecond latency
3. **Persistent**: Survives restarts
4. **Atomic Operations**: ZADD, ZREMRANGEBYSCORE for accurate counting
5. **Serverless-friendly**: Upstash offers HTTP-based Redis

### Why Sliding Window?
- More accurate than fixed window
- No traffic spikes at window boundaries
- Fair rate limiting across time
- Easy to implement with Redis sorted sets

## Implementation
```typescript
// Sliding window using Redis ZSET
const key = `rate_limit:${userId}`;
const now = Date.now();
const windowStart = now - windowMs;

// Remove old entries
await redis.zremrangebyscore(key, 0, windowStart);

// Count requests in window
const count = await redis.zcard(key);

// Add current request
await redis.zadd(key, { score: now, member: now });

// Set expiration
await redis.expire(key, windowMs / 1000);
```

## Rate Limit Presets
| Preset | Limit | Window | Use Case |
|--------|-------|--------|----------|
| STRICT | 10 req | 1 min | Critical APIs |
| STANDARD | 100 req | 1 min | Regular APIs |
| GENEROUS | 1000 req | 1 min | Public pages |
| AUTH | 5 req | 15 min | Login/Signup |
| EMAIL | 3 req | 1 hour | Email sending |

## Consequences
### Positive
- Accurate distributed rate limiting
- Works in serverless/edge environments
- Protects against abuse
- Configurable per endpoint
- Minimal latency overhead

### Negative
- External dependency (Redis)
- Costs (Upstash pricing)
- Network latency
- Failover handling needed

## Fallback Strategy
If Redis is unavailable:
1. Use in-memory rate limiting (development)
2. Fail open (allow requests) rather than fail closed
3. Log errors for monitoring

## Security Considerations
- Rate limit by IP address
- Add user-based rate limiting for authenticated routes
- Implement exponential backoff
- Return proper 429 status code
- Include X-RateLimit headers

## Monitoring
Track these metrics:
- Rate limit hits per endpoint
- Redis latency
- Fallback activations
- Failed requests due to rate limiting

## References
- [Upstash Redis](https://upstash.com/)
- [IETF RFC 6585 - 429 Too Many Requests](https://tools.ietf.org/html/rfc6585)
- [Redis Rate Limiting Patterns](https://redis.io/topics/patterns/rate-limiting)
