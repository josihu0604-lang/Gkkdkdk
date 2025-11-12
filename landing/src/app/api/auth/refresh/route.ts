/**
 * Token Refresh API
 * POST /api/auth/refresh - Refresh access token using refresh token
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { refreshAccessToken } from '@/lib/auth-flow';
import { rateLimit } from '@/lib/rate-limit';

// ============================================================================
// Validation Schema
// ============================================================================

const RefreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// ============================================================================
// POST /api/auth/refresh
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 10 refreshes per minute per IP
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = await rateLimit(`auth:refresh:${ip}`, 10, 60 * 1000);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many refresh attempts',
          rateLimit: {
            limit: rateLimitResult.limit,
            remaining: rateLimitResult.remaining,
            reset: new Date(rateLimitResult.reset).toISOString(),
          },
        },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = RefreshSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { refreshToken } = validationResult.data;

    // Attempt token refresh
    const result = await refreshAccessToken(refreshToken);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Token refresh failed',
        },
        { status: 401 }
      );
    }

    // Return new tokens
    return NextResponse.json(
      {
        success: true,
        data: {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        },
      },
      {
        status: 200,
        headers: {
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': new Date(rateLimitResult.reset).toISOString(),
        },
      }
    );
  } catch (error) {
    console.error('[Auth Refresh API] POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
