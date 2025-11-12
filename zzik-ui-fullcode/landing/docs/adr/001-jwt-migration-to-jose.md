# ADR 001: Migration from jwt-simple to jose

## Status
**Accepted** - 2025-11-12

## Context
The project initially used `jwt-simple` for JWT token generation and verification. However, this library has several limitations:
- Not actively maintained
- Lacks modern security features
- Not compatible with Edge Runtime
- Limited algorithm support
- No TypeScript support

## Decision
Migrate to `jose` library for all JWT operations.

## Rationale
`jose` provides several advantages:
1. **Modern & Maintained**: Actively developed and maintained
2. **Edge Compatible**: Works in Edge Runtime, Cloudflare Workers, etc.
3. **Security**: Implements latest JWT/JWE/JWS standards
4. **TypeScript**: Full TypeScript support with accurate types
5. **Algorithms**: Supports all JWA algorithms
6. **Standards Compliant**: Follows RFC 7519 (JWT), RFC 7515 (JWS), RFC 7516 (JWE)

## Implementation
```typescript
// Before (jwt-simple)
const token = jwt.encode(payload, secret);
const decoded = jwt.decode(token, secret);

// After (jose)
const jwt = await new jose.SignJWT(payload)
  .setProtectedHeader({ alg: 'HS256' })
  .sign(secret);
  
const { payload } = await jose.jwtVerify(token, secret);
```

## Consequences
### Positive
- Better security posture
- Edge Runtime compatibility
- Future-proof implementation
- Better error handling
- Type safety

### Negative
- Async API (requires await)
- Migration effort required
- Slight learning curve

## Migration Path
1. Install `jose` package
2. Create new `lib/jwt.ts` utility
3. Replace all jwt-simple imports
4. Update API routes to use async/await
5. Test all authentication flows

## Security Considerations
- Use HS256 algorithm (HMAC with SHA-256)
- Set proper issuer and audience claims
- Implement token expiration (7 days for access, 30 days for refresh)
- Filter sensitive data in token payload
- Rotate secrets regularly

## References
- [jose GitHub](https://github.com/panva/jose)
- [RFC 7519 - JSON Web Token](https://tools.ietf.org/html/rfc7519)
- [OWASP JWT Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
