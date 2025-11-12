/**
 * Logout API
 * POST /api/auth/logout - Invalidate session and tokens
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-middleware';
import { logout } from '@/lib/auth-flow';
import { rateLimit } from '@/lib/rate-limit';

// ============================================================================
// POST /api/auth/logout
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 10 logouts per minute
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = await rateLimit(`auth:logout:${ip}`, 10, 60 * 1000);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many requests',
        },
        { status: 429 }
      );
    }

    // Require authentication
    const auth = await requireAuth(request);
    if (!auth.success) {
      return NextResponse.json(auth.error, { status: auth.status });
    }

    // Logout (invalidate session)
    const result = await logout(auth.sessionId!);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Logout failed',
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Logged out successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Auth Logout API] POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
