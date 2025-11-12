/**
 * Authentication Utilities
 * 
 * JWT token generation, validation, and session management
 * preparation for future user authentication implementation.
 */

import { env } from './env';

/**
 * User session payload structure
 */
export interface UserSession {
  userId: string;
  walletAddress: string;
  username?: string;
  email?: string;
  roles: string[];
  iat: number; // Issued at (Unix timestamp)
  exp: number; // Expiration (Unix timestamp)
}

/**
 * JWT token structure
 */
export interface JWTToken {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

/**
 * Generate JWT access token
 * 
 * @param userId - User identifier
 * @param walletAddress - User's wallet address
 * @param options - Additional token options
 * @returns JWT token string
 * 
 * @example
 * const token = await generateAccessToken('user-001', '0x1234...', {
 *   username: 'alice',
 *   roles: ['user', 'premium']
 * });
 */
export async function generateAccessToken(
  userId: string,
  walletAddress: string,
  options?: {
    username?: string;
    email?: string;
    roles?: string[];
    expiresIn?: string; // e.g., '7d', '1h'
  }
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const expiresIn = parseExpiry(options?.expiresIn || env.server.JWT_EXPIRES_IN);

  const payload: UserSession = {
    userId,
    walletAddress,
    username: options?.username,
    email: options?.email,
    roles: options?.roles || ['user'],
    iat: now,
    exp: now + expiresIn,
  };

  // In production, use jose or jsonwebtoken library
  // For now, this is a placeholder structure
  const token = await signJWT(payload, env.server.JWT_SECRET);
  return token;
}

/**
 * Verify and decode JWT token
 * 
 * @param token - JWT token string
 * @returns Decoded user session or null if invalid
 * 
 * @example
 * const session = await verifyAccessToken(token);
 * if (session) {
 *   console.log('User ID:', session.userId);
 * }
 */
export async function verifyAccessToken(token: string): Promise<UserSession | null> {
  try {
    const payload = await verifyJWT<UserSession>(token, env.server.JWT_SECRET);
    
    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      return null; // Token expired
    }

    return payload;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

/**
 * Generate refresh token (long-lived)
 * 
 * @param userId - User identifier
 * @returns Refresh token string
 */
export async function generateRefreshToken(userId: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const expiresIn = 30 * 24 * 60 * 60; // 30 days

  const payload = {
    userId,
    type: 'refresh',
    iat: now,
    exp: now + expiresIn,
  };

  return await signJWT(payload, env.server.JWT_SECRET);
}

/**
 * Extract token from Authorization header
 * 
 * @param authHeader - Authorization header value
 * @returns Token string or null
 * 
 * @example
 * const token = extractToken(request.headers.get('Authorization'));
 */
export function extractToken(authHeader: string | null): string | null {
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}

/**
 * Verify API key for service-to-service communication
 * 
 * @param apiKey - API key from X-API-Key header
 * @returns True if valid
 */
export function verifyApiKey(apiKey: string | null): boolean {
  if (!apiKey) return false;
  if (!env.server.INTERNAL_API_KEY) return false;
  
  // Constant-time comparison to prevent timing attacks
  return constantTimeCompare(apiKey, env.server.INTERNAL_API_KEY);
}

/**
 * Hash password (for future email/password auth)
 * 
 * @param password - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  // In production, use bcrypt or argon2
  // This is a placeholder
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verify password against hash
 * 
 * @param password - Plain text password
 * @param hash - Hashed password
 * @returns True if match
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const hashedInput = await hashPassword(password);
  return constantTimeCompare(hashedInput, hash);
}

/**
 * Create session cookie
 * 
 * @param token - JWT token
 * @returns Cookie string
 */
export function createSessionCookie(token: string): string {
  const maxAge = 7 * 24 * 60 * 60; // 7 days
  const secure = env.isProduction ? 'Secure; ' : '';
  
  return `session=${token}; HttpOnly; ${secure}SameSite=Strict; Path=/; Max-Age=${maxAge}`;
}

/**
 * Clear session cookie
 * 
 * @returns Cookie string
 */
export function clearSessionCookie(): string {
  return 'session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0';
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Sign JWT token (placeholder - use jose or jsonwebtoken in production)
 */
async function signJWT(payload: any, secret: string): Promise<string> {
  // IMPORTANT: This is a simplified implementation for structure demonstration
  // In production, use:
  // - jose library: https://github.com/panva/jose
  // - jsonwebtoken: https://github.com/auth0/node-jsonwebtoken
  
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = await createSignature(`${encodedHeader}.${encodedPayload}`, secret);
  
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Verify JWT token (placeholder - use jose or jsonwebtoken in production)
 */
async function verifyJWT<T>(token: string, secret: string): Promise<T> {
  // IMPORTANT: This is a simplified implementation
  // In production, use proper JWT library
  
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid token format');
  }

  const [encodedHeader, encodedPayload, signature] = parts;
  const expectedSignature = await createSignature(
    `${encodedHeader}.${encodedPayload}`,
    secret
  );

  if (signature !== expectedSignature) {
    throw new Error('Invalid signature');
  }

  const payload = JSON.parse(base64UrlDecode(encodedPayload));
  return payload as T;
}

/**
 * Create HMAC-SHA256 signature
 */
async function createSignature(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return base64UrlEncode(signature);
}

/**
 * Base64 URL encode
 */
function base64UrlEncode(input: string | ArrayBuffer): string {
  const bytes = typeof input === 'string' 
    ? new TextEncoder().encode(input)
    : new Uint8Array(input);
  
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Base64 URL decode
 */
function base64UrlDecode(input: string): string {
  const base64 = input
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  return atob(base64 + padding);
}

/**
 * Constant-time string comparison (prevents timing attacks)
 */
function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
}

/**
 * Parse expiry string to seconds
 * 
 * @param expiry - Expiry string (e.g., '7d', '1h', '30m')
 * @returns Seconds
 */
function parseExpiry(expiry: string): number {
  const match = expiry.match(/^(\d+)([smhd])$/);
  if (!match) return 7 * 24 * 60 * 60; // Default 7 days
  
  const value = parseInt(match[1], 10);
  const unit = match[2];
  
  switch (unit) {
    case 's': return value;
    case 'm': return value * 60;
    case 'h': return value * 60 * 60;
    case 'd': return value * 24 * 60 * 60;
    default: return 7 * 24 * 60 * 60;
  }
}

/**
 * Session management types for future database integration
 */
export interface SessionRecord {
  id: string;
  userId: string;
  token: string;
  refreshToken?: string;
  expiresAt: Date;
  createdAt: Date;
  lastAccessedAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Future: Store session in database
 */
export async function storeSession(session: Omit<SessionRecord, 'id' | 'createdAt' | 'lastAccessedAt'>): Promise<string> {
  // TODO: Implement database storage
  // For now, return mock session ID
  return `session-${Date.now()}`;
}

/**
 * Future: Revoke session
 */
export async function revokeSession(sessionId: string): Promise<boolean> {
  // TODO: Implement session revocation
  return true;
}

/**
 * Future: Get active sessions for user
 */
export async function getActiveSessions(userId: string): Promise<SessionRecord[]> {
  // TODO: Implement session retrieval
  return [];
}
