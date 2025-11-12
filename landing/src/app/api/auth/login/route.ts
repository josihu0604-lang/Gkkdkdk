/**
 * Login API
 * POST /api/auth/login - Authenticate user with credentials
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { login } from '@/lib/auth-flow';
import { rateLimit, RateLimitPresets } from '@/lib/rate-limit';

// ============================================================================
// Validation Schema
// ============================================================================

const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// ============================================================================
// POST /api/auth/login
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 attempts per 15 minutes
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = await rateLimit(`auth:login:${ip}`, RateLimitPresets.AUTH.limit, RateLimitPresets.AUTH.windowMs);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many login attempts. Please try again later.',
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
    const validationResult = LoginSchema.safeParse(body);

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

    const { email, password } = validationResult.data;

    // Attempt login
    const result = await login({ email, password });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Login failed',
        },
        { status: 401 }
      );
    }

    // Return success with tokens
    return NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: result.user?.id,
            email: result.user?.email,
            username: result.user?.username,
            displayName: result.user?.displayName,
            avatarUrl: result.user?.avatarUrl,
            level: result.user?.level,
            totalPoints: result.user?.totalPoints,
            role: result.user?.role,
          },
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
    console.error('[Auth Login API] POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
