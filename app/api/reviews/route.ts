/**
 * Reviews API - Create and List Reviews
 * POST /api/reviews - Create a new review (requires check-in)
 * GET /api/reviews - List reviews with filtering
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { rateLimit, RateLimitPresets } from '@/lib/rate-limit';

// ============================================================================
// Validation Schemas
// ============================================================================

const CreateReviewSchema = z.object({
  placeId: z.string().min(1, 'Place ID is required'),
  userId: z.string().min(1, 'User ID is required'),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title must be at most 100 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters').max(2000, 'Content must be at most 2000 characters'),
  images: z.array(z.string().url('Invalid image URL')).max(5, 'Maximum 5 images allowed').optional(),
  visitDate: z.string().datetime().optional(),
});

const ListReviewsSchema = z.object({
  placeId: z.string().optional(),
  userId: z.string().optional(),
  minRating: z.coerce.number().int().min(1).max(5).optional(),
  maxRating: z.coerce.number().int().min(1).max(5).optional(),
  sortBy: z.enum(['recent', 'helpful', 'rating']).optional().default('recent'),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  cursor: z.string().optional(),
});

// ============================================================================
// POST /api/reviews - Create Review
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 10 reviews per hour
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = await rateLimit(`review:create:${ip}`, 10, 60 * 60 * 1000);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many review submissions. Please try again later.',
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
    const validationResult = CreateReviewSchema.safeParse(body);

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

    // Verify place exists
    const place = await prisma.place.findUnique({
      where: { id: data.placeId },
    });

    if (!place) {
      return NextResponse.json(
        {
          success: false,
          error: 'Place not found',
        },
        { status: 404 }
      );
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
        },
        { status: 404 }
      );
    }

    // Verify user has checked in to this place (business rule)
    const hasCheckedIn = await prisma.checkIn.findFirst({
      where: {
        userId: data.userId,
        placeId: data.placeId,
        status: 'APPROVED',
      },
    });

    if (!hasCheckedIn) {
      return NextResponse.json(
        {
          success: false,
          error: 'You must check in to this place before leaving a review',
        },
        { status: 403 }
      );
    }

    // Check for duplicate review (one review per user per place)
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: data.userId,
        placeId: data.placeId,
        deletedAt: null,
      },
    });

    if (existingReview) {
      return NextResponse.json(
        {
          success: false,
          error: 'You have already reviewed this place',
        },
        { status: 409 }
      );
    }

    // Create review with transaction to update place rating
    const review = await prisma.$transaction(async (tx) => {
      // Create review
      const newReview = await tx.review.create({
        data: {
          placeId: data.placeId,
          userId: data.userId,
          rating: data.rating,
          title: data.title,
          content: data.content,
          images: data.images || [],
          visitDate: data.visitDate ? new Date(data.visitDate) : new Date(),
          isApproved: true, // Auto-approve for now (can add moderation later)
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
              level: true,
            },
          },
        },
      });

      // Update place rating statistics
      const allReviews = await tx.review.findMany({
        where: {
          placeId: data.placeId,
          deletedAt: null,
          isApproved: true,
        },
        select: { rating: true },
      });

      const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = allReviews.length > 0 ? totalRating / allReviews.length : 0;

      await tx.place.update({
        where: { id: data.placeId },
        data: {
          averageRating,
          totalReviews: allReviews.length,
        },
      });

      return newReview;
    });

    return NextResponse.json(
      {
        success: true,
        data: review,
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
    console.error('[Reviews API] POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET /api/reviews - List Reviews
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    // Rate limiting: 100 requests per minute
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = await rateLimit(`review:list:${ip}`, 100, 60 * 1000);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many requests',
          rateLimit: {
            limit: rateLimitResult.limit,
            remaining: rateLimitResult.remaining,
            reset: new Date(rateLimitResult.reset).toISOString(),
          },
        },
        { status: 429 }
      );
    }

    // Parse and validate query parameters
    const searchParams = request.nextUrl.searchParams;
    const queryParams = {
      placeId: searchParams.get('placeId') || undefined,
      userId: searchParams.get('userId') || undefined,
      minRating: searchParams.get('minRating') || undefined,
      maxRating: searchParams.get('maxRating') || undefined,
      sortBy: searchParams.get('sortBy') || 'recent',
      limit: searchParams.get('limit') || '20',
      cursor: searchParams.get('cursor') || undefined,
    };

    const validationResult = ListReviewsSchema.safeParse(queryParams);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid query parameters',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { placeId, userId, minRating, maxRating, sortBy, limit, cursor } = validationResult.data;

    // Build where clause
    const where: any = {
      deletedAt: null,
      isApproved: true,
    };

    if (placeId) {
      where.placeId = placeId;
    }

    if (userId) {
      where.userId = userId;
    }

    if (minRating !== undefined || maxRating !== undefined) {
      where.rating = {};
      if (minRating !== undefined) {
        where.rating.gte = minRating;
      }
      if (maxRating !== undefined) {
        where.rating.lte = maxRating;
      }
    }

    // Add cursor-based pagination
    if (cursor) {
      where.id = {
        lt: cursor, // Fetch reviews before this cursor
      };
    }

    // Determine sort order
    let orderBy: any;
    switch (sortBy) {
      case 'helpful':
        orderBy = { helpfulCount: 'desc' };
        break;
      case 'rating':
        orderBy = { rating: 'desc' };
        break;
      case 'recent':
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }

    // Fetch reviews with pagination
    const reviews = await prisma.review.findMany({
      where,
      orderBy,
      take: limit + 1, // Fetch one extra to determine if there are more results
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            level: true,
          },
        },
        place: {
          select: {
            id: true,
            name: true,
            category: true,
            address: true,
          },
        },
      },
    });

    // Determine if there are more results
    const hasMore = reviews.length > limit;
    const results = hasMore ? reviews.slice(0, -1) : reviews;
    const nextCursor = hasMore ? results[results.length - 1].id : null;

    return NextResponse.json(
      {
        success: true,
        data: results,
        pagination: {
          hasMore,
          nextCursor,
          limit,
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
    console.error('[Reviews API] GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
