import * as jose from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

const JWT_ISSUER = 'zzik-platform';
const JWT_AUDIENCE = 'zzik-users';

export interface JWTPayload {
  userId: string;
  email: string;
  role?: 'user' | 'business' | 'admin';
  [key: string]: any;
}

/**
 * Sign JWT token using jose library (modern, secure, edge-compatible)
 * 
 * @param payload - Data to encode in the token
 * @param expiresIn - Token expiration time (default: 7 days)
 * @returns Signed JWT string
 */
export async function signJWT(
  payload: JWTPayload,
  expiresIn: string = '7d'
): Promise<string> {
  try {
    const jwt = await new jose.SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setIssuer(JWT_ISSUER)
      .setAudience(JWT_AUDIENCE)
      .setExpirationTime(expiresIn)
      .sign(JWT_SECRET);
    
    return jwt;
  } catch (error) {
    console.error('[JWT Sign Error]', error);
    throw new Error('Failed to sign JWT');
  }
}

/**
 * Verify and decode JWT token
 * 
 * @param token - JWT string to verify
 * @returns Decoded payload
 * @throws Error if token is invalid or expired
 */
export async function verifyJWT(token: string): Promise<JWTPayload> {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });
    
    return payload as JWTPayload;
  } catch (error) {
    if (error instanceof jose.errors.JWTExpired) {
      throw new Error('Token expired');
    }
    if (error instanceof jose.errors.JWTInvalid) {
      throw new Error('Invalid token');
    }
    console.error('[JWT Verify Error]', error);
    throw new Error('Failed to verify JWT');
  }
}

/**
 * Decode JWT without verification (for debugging only)
 * 
 * @param token - JWT string
 * @returns Decoded payload (unverified)
 */
export function decodeJWT(token: string): jose.JWTPayload | null {
  try {
    return jose.decodeJwt(token);
  } catch (error) {
    console.error('[JWT Decode Error]', error);
    return null;
  }
}

/**
 * Generate refresh token (longer expiration)
 * 
 * @param payload - Data to encode
 * @returns Signed refresh token
 */
export async function generateRefreshToken(
  payload: JWTPayload
): Promise<string> {
  return signJWT(payload, '30d'); // 30 days expiration
}

/**
 * Check if token is about to expire (within 1 day)
 * 
 * @param token - JWT string
 * @returns true if token expires within 1 day
 */
export async function isTokenExpiringSoon(token: string): Promise<boolean> {
  try {
    const payload = await verifyJWT(token);
    const exp = payload.exp;
    
    if (!exp) return false;
    
    const expiresIn = exp * 1000 - Date.now();
    const oneDayInMs = 24 * 60 * 60 * 1000;
    
    return expiresIn < oneDayInMs;
  } catch {
    return true; // If verification fails, consider it expiring
  }
}
