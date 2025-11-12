/**
 * User API Endpoints
 * GET /api/users/[id] - Get user profile
 * PATCH /api/users/[id] - Update user profile
 * DELETE /api/users/[id] - Delete user account
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserWithStats } from '@/lib/db-optimizer';
import { rateLimit, RateLimitPresets } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';
import { z } from 'zod';

// Validation schemas
const updateUserSchema = z.object({
  username: z.string().min(3).max(30).optional(),
  displayName: z.string().min(1).max(50).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional(),
  email: z.string().email().optional(),
});

/**
 * GET /api/users/[id]
 * Get user profile with stats
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now();
  
  try {
    // Rate limiting
    const clientIp = getClientIp(request);
    const rateLimitResult = await rateLimit(
      `user-get:${clientIp}`,
      RateLimitPresets.STANDARD.limit,
      RateLimitPresets.STANDARD.windowMs
    );
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        {
          status: 429,
          headers: {
            'RateLimit-Limit': rateLimitResult.limit.toString(),
            'RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'Retry-After': Math.ceil(
              (rateLimitResult.reset - Date.now()) / 1000
            ).toString(),
          },
        }
      );
    }
    
    // Get user with stats
    const user = await getUserWithStats(prisma, params.id);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    const duration = Date.now() - startTime;
    logger.info('User retrieved successfully', {
      userId: params.id,
      duration,
    });
    
    return NextResponse.json({
      success: true,
      data: user,
    });
    
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Failed to get user', error, {
      userId: params.id,
      duration,
    });
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/users/[id]
 * Update user profile
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now();
  
  try {
    // Rate limiting - stricter for updates
    const clientIp = getClientIp(request);
    const rateLimitResult = await rateLimit(
      `user-update:${clientIp}`,
      RateLimitPresets.STRICT.limit,
      RateLimitPresets.STRICT.windowMs
    );
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        {
          status: 429,
          headers: {
            'RateLimit-Limit': rateLimitResult.limit.toString(),
            'RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'Retry-After': Math.ceil(
              (rateLimitResult.reset - Date.now()) / 1000
            ).toString(),
          },
        }
      );
    }
    
    // TODO: Add authentication check
    // const authUser = await getAuthUser(request);
    // if (!authUser || authUser.id !== params.id) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }
    
    // Parse and validate request body
    const body = await request.json();
    const validationResult = updateUserSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }
    
    const data = validationResult.data;
    
    // Check if username is already taken
    if (data.username) {
      const existingUser = await prisma.user.findUnique({
        where: { username: data.username },
      });
      
      if (existingUser && existingUser.id !== params.id) {
        return NextResponse.json(
          { error: 'Username already taken' },
          { status: 409 }
        );
      }
    }
    
    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        walletAddress: true,
        username: true,
        email: true,
        displayName: true,
        bio: true,
        avatarUrl: true,
        level: true,
        totalPoints: true,
        updatedAt: true,
      },
    });
    
    const duration = Date.now() - startTime;
    logger.info('User updated successfully', {
      userId: params.id,
      fields: Object.keys(data),
      duration,
    });
    
    return NextResponse.json({
      success: true,
      data: updatedUser,
    });
    
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Failed to update user', error, {
      userId: params.id,
      duration,
    });
    
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'Username or email already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/users/[id]
 * Delete user account (soft delete by marking as inactive)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now();
  
  try {
    // Rate limiting - very strict for deletions
    const clientIp = getClientIp(request);
    const rateLimitResult = await rateLimit(
      `user-delete:${clientIp}`,
      RateLimitPresets.AUTH.limit,
      RateLimitPresets.AUTH.windowMs
    );
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        {
          status: 429,
          headers: {
            'RateLimit-Limit': rateLimitResult.limit.toString(),
            'RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'Retry-After': Math.ceil(
              (rateLimitResult.reset - Date.now()) / 1000
            ).toString(),
          },
        }
      );
    }
    
    // TODO: Add authentication check
    // const authUser = await getAuthUser(request);
    // if (!authUser || authUser.id !== params.id) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: params.id },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Soft delete: anonymize user data instead of hard delete
    await prisma.user.update({
      where: { id: params.id },
      data: {
        username: `deleted_${params.id.slice(0, 8)}`,
        email: null,
        displayName: 'Deleted User',
        bio: null,
        avatarUrl: null,
        updatedAt: new Date(),
      },
    });
    
    const duration = Date.now() - startTime;
    logger.info('User deleted successfully', {
      userId: params.id,
      duration,
    });
    
    return NextResponse.json({
      success: true,
      message: 'User account deleted successfully',
    });
    
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Failed to delete user', error, {
      userId: params.id,
      duration,
    });
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
