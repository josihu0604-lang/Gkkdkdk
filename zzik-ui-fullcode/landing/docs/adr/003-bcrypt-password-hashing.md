# ADR 003: Password Hashing with bcrypt

## Status
**Accepted** - 2025-11-12

## Context
User passwords must be stored securely to protect against:
- Database breaches
- Rainbow table attacks
- Brute force attacks
- Insider threats

## Decision
Use `bcrypt` with 12 salt rounds for all password hashing operations.

## Rationale

### Why bcrypt?
1. **Industry Standard**: Battle-tested since 1999
2. **Adaptive**: Cost factor can be increased as hardware improves
3. **Salted**: Automatically generates unique salt per password
4. **Slow**: Intentionally slow to resist brute force attacks
5. **OWASP Recommended**: Listed in OWASP security guidelines

### Why 12 Rounds?
- **10 rounds**: Minimum recommended (fast, less secure)
- **12 rounds**: Balanced (recommended by OWASP)
- **14+ rounds**: Very secure but slow (may impact UX)

Benchmark (approximate):
- 10 rounds: ~65ms
- 12 rounds: ~250ms (✓ chosen)
- 14 rounds: ~1000ms

## Implementation
```typescript
// Hash password
const hash = await bcrypt.hash(password, 12);

// Verify password
const isValid = await bcrypt.compare(password, hash);
```

## Password Requirements
Enforce strong passwords:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character
- Block common weak passwords

## Consequences
### Positive
- Strong protection against rainbow tables
- Resistant to brute force attacks
- Automatic salt generation
- Future-proof (adaptive cost)
- Well-documented and supported

### Negative
- Async operation (requires await)
- CPU-intensive
- 250ms latency per hash (acceptable for auth)

## Security Best Practices
1. **Never log passwords**: Even hashed
2. **Hash on server**: Never send plain passwords
3. **Rate limit**: Prevent brute force attempts
4. **Password strength**: Enforce minimum requirements
5. **Pepper (optional)**: Add application-wide secret
6. **Monitor**: Track failed login attempts

## Alternative Considered
### Argon2
- **Pros**: Modern, memory-hard, more configurable
- **Cons**: Newer (less battle-tested), more complex
- **Decision**: Stick with bcrypt for stability

### PBKDF2
- **Pros**: NIST-approved, widely available
- **Cons**: Not memory-hard, less resistant to GPU attacks
- **Decision**: bcrypt is superior

## Migration Path
For existing passwords with different hashing:
1. Keep old hash algorithm for backward compatibility
2. On successful login, rehash with bcrypt
3. Gradually migrate all users
4. Deprecate old algorithm after 6 months

## Compliance
- **OWASP**: Compliant with password storage guidelines
- **GDPR**: Supports data protection requirements
- **PCI DSS**: Meets payment card industry standards

## References
- [bcrypt NPM](https://www.npmjs.com/package/bcrypt)
- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [How to safely store passwords](https://security.stackexchange.com/questions/211/how-to-securely-hash-passwords)
