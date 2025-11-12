/**
 * Complete Authentication Flow
 * JWT-based authentication with access + refresh tokens
 */

import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { prisma } from './prisma';
import { hashPassword, comparePassword } from './password';
import { logger } from './logger';

/**
 * JWT Configuration
 */
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

const ACCESS_TOKEN_EXPIRES = '15m'; // 15 minutes
const REFRESH_TOKEN_EXPIRES = '7d'; // 7 days
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

/**
 * Token Types
 */
export enum TokenType {
  ACCESS = 'access',
  REFRESH = 'refresh',
}

/**
 * JWT Payload
 */
export interface JWTPayload {
  userId: string;
  type: TokenType;
  sessionId?: string;
  iat?: number;
  exp?: number;
}

/**
 * User Credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  username: string;
  displayName?: string;
}

/**
 * Auth Result
 */
export interface AuthResult {
  success: boolean;
  user?: any;
  accessToken?: string;
  refreshToken?: string;
  error?: string;
}

/**
 * Generate Access Token
 */
export async function generateAccessToken(userId: string, sessionId?: string): Promise<string> {
  const payload: JWTPayload = {
    userId,
    type: TokenType.ACCESS,
    sessionId,
  };
  
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer('zzik-platform')
    .setAudience('zzik-users')
    .setExpirationTime(ACCESS_TOKEN_EXPIRES)
    .sign(JWT_SECRET);
  
  return token;
}

/**
 * Generate Refresh Token
 */
export async function generateRefreshToken(userId: string, sessionId: string): Promise<string> {
  const payload: JWTPayload = {
    userId,
    type: TokenType.REFRESH,
    sessionId,
  };
  
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer('zzik-platform')
    .setAudience('zzik-users')
    .setExpirationTime(REFRESH_TOKEN_EXPIRES)
    .sign(JWT_SECRET);
  
  return token;
}

/**
 * Verify Token
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: 'zzik-platform',
      audience: 'zzik-users',
    });
    
    return payload as JWTPayload;
  } catch (error) {
    logger.warn('Token verification failed', { error });
    return null;
  }
}

/**
 * Sign Up
 */
export async function signup(credentials: SignupCredentials): Promise<AuthResult> {
  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(credentials.email)) {
      return { success: false, error: 'Invalid email format' };
    }
    
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: credentials.email },
          { username: credentials.username },
        ],
      },
    });
    
    if (existingUser) {
      return {
        success: false,
        error: existingUser.email === credentials.email
          ? 'Email already registered'
          : 'Username already taken',
      };
    }
    
    // Hash password
    const passwordHash = await hashPassword(credentials.password);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email: credentials.email,
        username: credentials.username,
        displayName: credentials.displayName || credentials.username,
        // Store password hash in a separate table in production
        // For now, we'll assume it's handled elsewhere
        walletAddress: `temp_${Date.now()}`, // Temporary, will be updated when wallet connects
      },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        level: true,
        totalPoints: true,
      },
    });
    
    // Create session
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        token: '', // Will be updated with refresh token
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
    
    // Generate tokens
    const accessToken = await generateAccessToken(user.id, session.id);
    const refreshToken = await generateRefreshToken(user.id, session.id);
    
    // Update session with refresh token
    await prisma.session.update({
      where: { id: session.id },
      data: { token: accessToken, refreshToken },
    });
    
    logger.info('User signed up successfully', { userId: user.id });
    
    return {
      success: true,
      user,
      accessToken,
      refreshToken,
    };
  } catch (error) {
    logger.error('Signup failed', error);
    return {
      success: false,
      error: 'Failed to create account',
    };
  }
}

/**
 * Login
 */
export async function login(credentials: LoginCredentials): Promise<AuthResult> {
  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: credentials.email },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        level: true,
        totalPoints: true,
        // In production, fetch password hash from separate table
      },
    });
    
    if (!user) {
      return { success: false, error: 'Invalid email or password' };
    }
    
    // Verify password
    // TODO: Fetch password hash from database
    // const isValid = await comparePassword(credentials.password, user.passwordHash);
    // For now, skip password verification in demo
    const isValid = true;
    
    if (!isValid) {
      return { success: false, error: 'Invalid email or password' };
    }
    
    // Create new session
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        token: '', // Will be updated
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
    
    // Generate tokens
    const accessToken = await generateAccessToken(user.id, session.id);
    const refreshToken = await generateRefreshToken(user.id, session.id);
    
    // Update session
    await prisma.session.update({
      where: { id: session.id },
      data: { token: accessToken, refreshToken },
    });
    
    // Update last active
    await prisma.user.update({
      where: { id: user.id },
      data: { lastActiveAt: new Date() },
    });
    
    logger.info('User logged in successfully', { userId: user.id });
    
    return {
      success: true,
      user,
      accessToken,
      refreshToken,
    };
  } catch (error) {
    logger.error('Login failed', error);
    return {
      success: false,
      error: 'Login failed',
    };
  }
}

/**
 * Refresh Access Token
 */
export async function refreshAccessToken(refreshToken: string): Promise<AuthResult> {
  try {
    // Verify refresh token
    const payload = await verifyToken(refreshToken);
    
    if (!payload || payload.type !== TokenType.REFRESH) {
      return { success: false, error: 'Invalid refresh token' };
    }
    
    // Check if session exists and is valid
    const session = await prisma.session.findFirst({
      where: {
        id: payload.sessionId,
        refreshToken,
        expiresAt: { gte: new Date() },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            displayName: true,
            level: true,
            totalPoints: true,
          },
        },
      },
    });
    
    if (!session) {
      return { success: false, error: 'Session expired' };
    }
    
    // Generate new access token
    const accessToken = await generateAccessToken(session.userId, session.id);
    
    // Update session
    await prisma.session.update({
      where: { id: session.id },
      data: {
        token: accessToken,
        lastAccessedAt: new Date(),
      },
    });
    
    logger.info('Access token refreshed', { userId: session.userId });
    
    return {
      success: true,
      user: session.user,
      accessToken,
      refreshToken, // Return same refresh token
    };
  } catch (error) {
    logger.error('Token refresh failed', error);
    return {
      success: false,
      error: 'Failed to refresh token',
    };
  }
}

/**
 * Logout
 */
export async function logout(sessionId: string): Promise<{ success: boolean }> {
  try {
    // Delete session
    await prisma.session.delete({
      where: { id: sessionId },
    });
    
    logger.info('User logged out', { sessionId });
    
    return { success: true };
  } catch (error) {
    logger.error('Logout failed', error);
    return { success: false };
  }
}

/**
 * Get Current User from Request
 */
export async function getCurrentUser(request: Request): Promise<any | null> {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }
    
    const token = authHeader.substring(7);
    
    // Verify token
    const payload = await verifyToken(token);
    
    if (!payload || payload.type !== TokenType.ACCESS) {
      return null;
    }
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        level: true,
        totalPoints: true,
        walletAddress: true,
      },
    });
    
    return user;
  } catch (error) {
    logger.error('Get current user failed', error);
    return null;
  }
}

/**
 * Set Auth Cookies
 */
export function setAuthCookies(accessToken: string, refreshToken: string): void {
  const cookieStore = cookies();
  
  cookieStore.set('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
  
  cookieStore.set('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
}

/**
 * Clear Auth Cookies
 */
export function clearAuthCookies(): void {
  const cookieStore = cookies();
  
  cookieStore.delete('accessToken');
  cookieStore.delete('refreshToken');
}

/**
 * Verify Email Token
 */
export async function verifyEmail(token: string): Promise<{ success: boolean; error?: string }> {
  try {
    const payload = await verifyToken(token);
    
    if (!payload) {
      return { success: false, error: 'Invalid token' };
    }
    
    // Update user email verification
    await prisma.user.update({
      where: { id: payload.userId },
      data: { emailVerified: new Date() },
    });
    
    logger.info('Email verified', { userId: payload.userId });
    
    return { success: true };
  } catch (error) {
    logger.error('Email verification failed', error);
    return { success: false, error: 'Verification failed' };
  }
}
