/**
 * Places API - Detail Operations
 * GET /api/places/[id] - Get place details
 * PATCH /api/places/[id] - Update place
 * DELETE /api/places/[id] - Delete place
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { rateLimit, RateLimitPresets, getClientIp } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';
import { z } from 'zod';

// Validation schema for place update
const updatePlaceSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  imageUrl: z.string().url().optional(),
  websiteUrl: z.string().url().optional(),
  phoneNumber: z.string().optional(),
  operatingHours: z.record(z.string()).optional(),
  isActive: z.boolean().optional(),
});

/**
 * GET /api/places/[id]
 * Get place details with stats
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
      `place-get:${clientIp}`,
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
    
    // Get place with related data
    const place = await prisma.place.findUnique({
      where: { id: params.id },
      include: {
        reviews: {
          where: { isApproved: true, isHidden: false },
          select: {
            id: true,
            rating: true,
            title: true,
            content: true,
            imageUrls: true,
            helpfulCount: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
                level: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
    
    if (!place) {
      return NextResponse.json(
        { error: 'Place not found' },
        { status: 404 }
      );
    }
    
    const duration = Date.now() - startTime;
    logger.info('Place retrieved successfully', {
      placeId: params.id,
      duration,
    });
    
    return NextResponse.json({
      success: true,
      data: place,
    });
    
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Failed to get place', error, {
      placeId: params.id,
      duration,
    });
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/places/[id]
 * Update place information
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now();
  
  try {
    // Rate limiting
    const clientIp = getClientIp(request);
    const rateLimitResult = await rateLimit(
      `place-update:${clientIp}`,
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
    
    // TODO: Add admin authentication check
    // const authUser = await getCurrentUser(request);
    // if (!authUser || !authUser.isAdmin) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }
    
    // Parse and validate request body
    const body = await request.json();
    const validationResult = updatePlaceSchema.safeParse(body);
    
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
    
    // Update place
    const place = await prisma.place.update({
      where: { id: params.id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        category: true,
        description: true,
        imageUrl: true,
        updatedAt: true,
      },
    });
    
    const duration = Date.now() - startTime;
    logger.info('Place updated successfully', {
      placeId: params.id,
      fields: Object.keys(data),
      duration,
    });
    
    return NextResponse.json({
      success: true,
      data: place,
    });
    
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Failed to update place', error, {
      placeId: params.id,
      duration,
    });
    
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json(
        { error: 'Place not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/places/[id]
 * Soft delete place (mark as inactive)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now();
  
  try {
    // Rate limiting
    const clientIp = getClientIp(request);
    const rateLimitResult = await rateLimit(
      `place-delete:${clientIp}`,
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
    
    // TODO: Add admin authentication check
    // const authUser = await getCurrentUser(request);
    // if (!authUser || !authUser.isAdmin) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }
    
    // Soft delete: mark as inactive
    await prisma.place.update({
      where: { id: params.id },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });
    
    const duration = Date.now() - startTime;
    logger.info('Place deleted successfully', {
      placeId: params.id,
      duration,
    });
    
    return NextResponse.json({
      success: true,
      message: 'Place deleted successfully',
    });
    
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Failed to delete place', error, {
      placeId: params.id,
      duration,
    });
    
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json(
        { error: 'Place not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
