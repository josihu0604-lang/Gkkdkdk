/**
 * Register API
 * POST /api/auth/register - Create new user account
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { register } from '@/lib/auth-flow';
import { rateLimit } from '@/lib/rate-limit';

// ============================================================================
// Validation Schema
// ============================================================================

const RegisterSchema = z.object({
  walletAddress: z.string().min(42, 'Invalid wallet address').max(42, 'Invalid wallet address'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(30, 'Username must be at most 30 characters').optional(),
  displayName: z.string().min(2, 'Display name must be at least 2 characters').max(50, 'Display name must be at most 50 characters').optional(),
});

// ============================================================================
// POST /api/auth/register
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 3 registrations per hour per IP
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = await rateLimit(`auth:register:${ip}`, 3, 60 * 60 * 1000);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many registration attempts. Please try again later.',
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
    const validationResult = RegisterSchema.safeParse(body);

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

    const data = validationResult.data;

    // Attempt registration
    const result = await register({
      walletAddress: data.walletAddress,
      email: data.email,
      password: data.password,
      username: data.username,
      displayName: data.displayName,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Registration failed',
        },
        { status: 400 }
      );
    }

    // Return success with tokens
    return NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: result.user?.id,
            walletAddress: result.user?.walletAddress,
            email: result.user?.email,
            username: result.user?.username,
            displayName: result.user?.displayName,
            level: result.user?.level,
            totalPoints: result.user?.totalPoints,
            role: result.user?.role,
          },
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        },
      },
      {
        status: 201,
        headers: {
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': new Date(rateLimitResult.reset).toISOString(),
        },
      }
    );
  } catch (error) {
    console.error('[Auth Register API] POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
