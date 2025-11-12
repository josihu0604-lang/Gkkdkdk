/**
 * Review Detail API - Get, Update, Delete Review
 * GET /api/reviews/[id] - Get review by ID
 * PATCH /api/reviews/[id] - Update review
 * DELETE /api/reviews/[id] - Soft delete review
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/rate-limit';

// ============================================================================
// Validation Schemas
// ============================================================================

const UpdateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  title: z.string().min(3).max(100).optional(),
  content: z.string().min(10).max(2000).optional(),
  images: z.array(z.string().url()).max(5).optional(),
});

// ============================================================================
// GET /api/reviews/[id] - Get Review
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Rate limiting: 100 requests per minute
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = await rateLimit(`review:get:${ip}`, 100, 60 * 1000);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many requests',
        },
        { status: 429 }
      );
    }

    const review = await prisma.review.findUnique({
      where: { id: params.id },
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
            images: true,
          },
        },
      },
    });

    if (!review || review.deletedAt !== null) {
      return NextResponse.json(
        {
          success: false,
          error: 'Review not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: review,
    });
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

// ============================================================================
// PATCH /api/reviews/[id] - Update Review
// ============================================================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Rate limiting: 10 updates per hour
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = await rateLimit(`review:update:${ip}`, 10, 60 * 60 * 1000);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many update requests',
        },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = UpdateReviewSchema.safeParse(body);

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
    const userId = body.userId; // In production, get from JWT token

    // Verify review exists and user owns it
    const existingReview = await prisma.review.findUnique({
      where: { id: params.id },
    });

    if (!existingReview || existingReview.deletedAt !== null) {
      return NextResponse.json(
        {
          success: false,
          error: 'Review not found',
        },
        { status: 404 }
      );
    }

    if (existingReview.userId !== userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'You do not have permission to update this review',
        },
        { status: 403 }
      );
    }

    // Update review with transaction to recalculate place rating if rating changed
    const updatedReview = await prisma.$transaction(async (tx) => {
      const review = await tx.review.update({
        where: { id: params.id },
        data: {
          ...data,
          updatedAt: new Date(),
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
          place: {
            select: {
              id: true,
              name: true,
              category: true,
            },
          },
        },
      });

      // If rating changed, recalculate place average rating
      if (data.rating !== undefined && data.rating !== existingReview.rating) {
        const allReviews = await tx.review.findMany({
          where: {
            placeId: existingReview.placeId,
            deletedAt: null,
            isApproved: true,
          },
          select: { rating: true },
        });

        const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
        const averageRating = allReviews.length > 0 ? totalRating / allReviews.length : 0;

        await tx.place.update({
          where: { id: existingReview.placeId },
          data: { averageRating },
        });
      }

      return review;
    });

    return NextResponse.json({
      success: true,
      data: updatedReview,
    });
  } catch (error) {
    console.error('[Reviews API] PATCH error:', error);
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
// DELETE /api/reviews/[id] - Soft Delete Review
// ============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Rate limiting: 10 deletes per hour
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = await rateLimit(`review:delete:${ip}`, 10, 60 * 60 * 1000);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many delete requests',
        },
        { status: 429 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId'); // In production, get from JWT token

    // Verify review exists and user owns it
    const existingReview = await prisma.review.findUnique({
      where: { id: params.id },
    });

    if (!existingReview || existingReview.deletedAt !== null) {
      return NextResponse.json(
        {
          success: false,
          error: 'Review not found',
        },
        { status: 404 }
      );
    }

    if (existingReview.userId !== userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'You do not have permission to delete this review',
        },
        { status: 403 }
      );
    }

    // Soft delete review and recalculate place rating
    await prisma.$transaction(async (tx) => {
      // Soft delete
      await tx.review.update({
        where: { id: params.id },
        data: { deletedAt: new Date() },
      });

      // Recalculate place rating without deleted review
      const allReviews = await tx.review.findMany({
        where: {
          placeId: existingReview.placeId,
          deletedAt: null,
          isApproved: true,
        },
        select: { rating: true },
      });

      const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = allReviews.length > 0 ? totalRating / allReviews.length : 0;

      await tx.place.update({
        where: { id: existingReview.placeId },
        data: {
          averageRating,
          totalReviews: allReviews.length,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    console.error('[Reviews API] DELETE error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
