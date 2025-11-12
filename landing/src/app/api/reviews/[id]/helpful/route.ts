/**
 * Review Helpful Vote API
 * POST /api/reviews/[id]/helpful - Mark review as helpful
 * DELETE /api/reviews/[id]/helpful - Remove helpful vote
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/rate-limit';

// ============================================================================
// Validation Schemas
// ============================================================================

const HelpfulVoteSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
});

// ============================================================================
// POST /api/reviews/[id]/helpful - Add Helpful Vote
// ============================================================================

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Rate limiting: 50 votes per hour per user
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = await rateLimit(`review:helpful:${ip}`, 50, 60 * 60 * 1000);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many vote requests',
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
    const validationResult = HelpfulVoteSchema.safeParse(body);

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

    const { userId } = validationResult.data;

    // Verify review exists
    const review = await prisma.review.findUnique({
      where: { id: params.id },
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

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
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

    // Prevent users from voting on their own reviews
    if (review.userId === userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'You cannot vote on your own review',
        },
        { status: 403 }
      );
    }

    // Check if user has already voted
    const existingVote = await prisma.reviewHelpfulVote.findUnique({
      where: {
        reviewId_userId: {
          reviewId: params.id,
          userId,
        },
      },
    });

    if (existingVote) {
      return NextResponse.json(
        {
          success: false,
          error: 'You have already marked this review as helpful',
        },
        { status: 409 }
      );
    }

    // Create vote and increment helpful count
    const result = await prisma.$transaction(async (tx) => {
      // Create vote record
      await tx.reviewHelpfulVote.create({
        data: {
          reviewId: params.id,
          userId,
        },
      });

      // Increment helpful count
      const updatedReview = await tx.review.update({
        where: { id: params.id },
        data: {
          helpfulCount: {
            increment: 1,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
        },
      });

      return updatedReview;
    });

    return NextResponse.json(
      {
        success: true,
        data: result,
        message: 'Review marked as helpful',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Review Helpful API] POST error:', error);
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
// DELETE /api/reviews/[id]/helpful - Remove Helpful Vote
// ============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Rate limiting: 50 vote removals per hour
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = await rateLimit(`review:helpful:remove:${ip}`, 50, 60 * 60 * 1000);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many requests',
        },
        { status: 429 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'User ID is required',
        },
        { status: 400 }
      );
    }

    // Verify review exists
    const review = await prisma.review.findUnique({
      where: { id: params.id },
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

    // Check if vote exists
    const existingVote = await prisma.reviewHelpfulVote.findUnique({
      where: {
        reviewId_userId: {
          reviewId: params.id,
          userId,
        },
      },
    });

    if (!existingVote) {
      return NextResponse.json(
        {
          success: false,
          error: 'You have not voted on this review',
        },
        { status: 404 }
      );
    }

    // Remove vote and decrement helpful count
    const result = await prisma.$transaction(async (tx) => {
      // Delete vote record
      await tx.reviewHelpfulVote.delete({
        where: {
          reviewId_userId: {
            reviewId: params.id,
            userId,
          },
        },
      });

      // Decrement helpful count
      const updatedReview = await tx.review.update({
        where: { id: params.id },
        data: {
          helpfulCount: {
            decrement: 1,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
        },
      });

      return updatedReview;
    });

    return NextResponse.json(
      {
        success: true,
        data: result,
        message: 'Helpful vote removed',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Review Helpful API] DELETE error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
