/**
 * JWT Authentication Middleware for Next.js API Routes
 * Validates JWT tokens and attaches user info to request
 * 
 * Usage:
 * ```typescript
 * export async function GET(request: NextRequest) {
 *   const auth = await requireAuth(request);
 *   if (auth.error) {
 *     return NextResponse.json(auth.error, { status: auth.status });
 *   }
 *   
 *   // Access authenticated user
 *   const userId = auth.userId;
 *   const user = auth.user;
 * }
 * ```
 */

import { NextRequest } from 'next/server';
import { verifyJWT } from './jwt';
import { prisma } from './prisma';

// ============================================================================
// Types
// ============================================================================

export interface AuthResult {
  success: boolean;
  userId?: string;
  sessionId?: string;
  user?: {
    id: string;
    email: string;
    username: string;
    role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  };
  error?: {
    success: false;
    error: string;
    code?: string;
  };
  status?: number;
}

export interface OptionalAuthResult {
  userId?: string;
  sessionId?: string;
  user?: {
    id: string;
    email: string;
    username: string;
    role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  };
}

// ============================================================================
// Authentication Functions
// ============================================================================

/**
 * Require authentication - returns error if not authenticated
 */
export async function requireAuth(request: NextRequest): Promise<AuthResult> {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader) {
    return {
      success: false,
      error: {
        success: false,
        error: 'Missing authorization header',
        code: 'MISSING_AUTH_HEADER',
      },
      status: 401,
    };
  }

  if (!authHeader.startsWith('Bearer ')) {
    return {
      success: false,
      error: {
        success: false,
        error: 'Invalid authorization header format',
        code: 'INVALID_AUTH_FORMAT',
      },
      status: 401,
    };
  }

  const token = authHeader.substring(7); // Remove "Bearer " prefix

  try {
    // Verify JWT
    const payload = await verifyJWT(token);
    
    if (!payload || !payload.userId) {
      return {
        success: false,
        error: {
          success: false,
          error: 'Invalid token payload',
          code: 'INVALID_TOKEN_PAYLOAD',
        },
        status: 401,
      };
    }

    // Verify session exists and is not expired
    const session = await prisma.session.findUnique({
      where: { id: payload.sessionId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            role: true,
          },
        },
      },
    });

    if (!session) {
      return {
        success: false,
        error: {
          success: false,
          error: 'Session not found',
          code: 'SESSION_NOT_FOUND',
        },
        status: 401,
      };
    }

    if (session.expiresAt < new Date()) {
      return {
        success: false,
        error: {
          success: false,
          error: 'Session expired',
          code: 'SESSION_EXPIRED',
        },
        status: 401,
      };
    }

    // Update last accessed time
    await prisma.session.update({
      where: { id: session.id },
      data: { lastAccessedAt: new Date() },
    });

    return {
      success: true,
      userId: payload.userId,
      sessionId: payload.sessionId,
      user: {
        id: session.user.id,
        email: session.user.email || '',
        username: session.user.username || '',
        role: session.user.role,
      },
    };
  } catch (error) {
    console.error('[Auth Middleware] Token verification failed:', error);
    return {
      success: false,
      error: {
        success: false,
        error: 'Invalid or expired token',
        code: 'INVALID_TOKEN',
      },
      status: 401,
    };
  }
}

/**
 * Optional authentication - returns user info if authenticated, but doesn't fail if not
 */
export async function optionalAuth(request: NextRequest): Promise<OptionalAuthResult> {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {};
  }

  const token = authHeader.substring(7);

  try {
    const payload = await verifyJWT(token);
    
    if (!payload || !payload.userId) {
      return {};
    }

    const session = await prisma.session.findUnique({
      where: { id: payload.sessionId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            role: true,
          },
        },
      },
    });

    if (!session || session.expiresAt < new Date()) {
      return {};
    }

    // Update last accessed time (fire and forget)
    prisma.session.update({
      where: { id: session.id },
      data: { lastAccessedAt: new Date() },
    }).catch(() => {});

    return {
      userId: payload.userId,
      sessionId: payload.sessionId,
      user: {
        id: session.user.id,
        email: session.user.email || '',
        username: session.user.username || '',
        role: session.user.role,
      },
    };
  } catch (error) {
    return {};
  }
}

/**
 * Require admin role (ADMIN or SUPER_ADMIN)
 */
export async function requireAdmin(request: NextRequest): Promise<AuthResult> {
  const auth = await requireAuth(request);
  
  if (!auth.success) {
    return auth;
  }

  if (auth.user?.role !== 'ADMIN' && auth.user?.role !== 'SUPER_ADMIN') {
    return {
      success: false,
      error: {
        success: false,
        error: 'Insufficient permissions - Admin access required',
        code: 'INSUFFICIENT_PERMISSIONS',
      },
      status: 403,
    };
  }

  return auth;
}

/**
 * Require super admin role
 */
export async function requireSuperAdmin(request: NextRequest): Promise<AuthResult> {
  const auth = await requireAuth(request);
  
  if (!auth.success) {
    return auth;
  }

  if (auth.user?.role !== 'SUPER_ADMIN') {
    return {
      success: false,
      error: {
        success: false,
        error: 'Insufficient permissions - Super Admin access required',
        code: 'INSUFFICIENT_PERMISSIONS',
      },
      status: 403,
    };
  }

  return auth;
}

/**
 * Verify user owns the resource
 */
export async function requireOwnership(
  request: NextRequest,
  resourceUserId: string
): Promise<AuthResult> {
  const auth = await requireAuth(request);
  
  if (!auth.success) {
    return auth;
  }

  // Allow admins to access any resource
  if (auth.user?.role === 'ADMIN' || auth.user?.role === 'SUPER_ADMIN') {
    return auth;
  }

  // Check ownership
  if (auth.userId !== resourceUserId) {
    return {
      success: false,
      error: {
        success: false,
        error: 'You do not have permission to access this resource',
        code: 'FORBIDDEN',
      },
      status: 403,
    };
  }

  return auth;
}

/**
 * Extract user ID from token without full validation
 * Useful for rate limiting keys
 */
export function extractUserId(request: NextRequest): string | null {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    
    // Decode JWT without verification (just extract payload)
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64').toString('utf-8')
    );

    return payload.userId || null;
  } catch (error) {
    return null;
  }
}

/**
 * Get rate limit identifier
 * Uses userId if authenticated, otherwise IP address
 */
export function getRateLimitIdentifier(request: NextRequest): string {
  const userId = extractUserId(request);
  if (userId) {
    return `user:${userId}`;
  }

  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown';
  
  return `ip:${ip}`;
}
