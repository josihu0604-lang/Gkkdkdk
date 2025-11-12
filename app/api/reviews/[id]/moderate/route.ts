/**
 * Review Moderation API - Admin Operations
 * POST /api/reviews/[id]/moderate - Approve/Reject/Hide review
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/rate-limit';

// ============================================================================
// Validation Schemas
// ============================================================================

const ModerateReviewSchema = z.object({
  action: z.enum(['approve', 'reject', 'hide', 'unhide'], {
    errorMap: () => ({ message: 'Action must be one of: approve, reject, hide, unhide' }),
  }),
  reason: z.string().min(3, 'Reason must be at least 3 characters').max(500, 'Reason must be at most 500 characters').optional(),
  adminId: z.string().min(1, 'Admin ID is required'),
});

// ============================================================================
// POST /api/reviews/[id]/moderate - Moderate Review
// ============================================================================

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Rate limiting: 100 moderation actions per hour (admin operations)
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = await rateLimit(`review:moderate:${ip}`, 100, 60 * 60 * 1000);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many moderation requests',
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
    const validationResult = ModerateReviewSchema.safeParse(body);

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

    const { action, reason, adminId } = validationResult.data;

    // Verify admin exists and has admin role
    const admin = await prisma.user.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          error: 'Admin user not found',
        },
        { status: 404 }
      );
    }

    if (admin.role !== 'ADMIN' && admin.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        {
          success: false,
          error: 'You do not have permission to moderate reviews',
        },
        { status: 403 }
      );
    }

    // Verify review exists
    const existingReview = await prisma.review.findUnique({
      where: { id: params.id },
      include: {
        place: true,
      },
    });

    if (!existingReview) {
      return NextResponse.json(
        {
          success: false,
          error: 'Review not found',
        },
        { status: 404 }
      );
    }

    // Perform moderation action with transaction
    const moderatedReview = await prisma.$transaction(async (tx) => {
      let updateData: any = {
        updatedAt: new Date(),
      };

      switch (action) {
        case 'approve':
          updateData.isApproved = true;
          updateData.moderatedAt = new Date();
          updateData.moderatedBy = adminId;
          updateData.moderationReason = reason || null;
          break;

        case 'reject':
          updateData.isApproved = false;
          updateData.moderatedAt = new Date();
          updateData.moderatedBy = adminId;
          updateData.moderationReason = reason || 'Review rejected by moderator';
          break;

        case 'hide':
          updateData.isApproved = false;
          updateData.moderatedAt = new Date();
          updateData.moderatedBy = adminId;
          updateData.moderationReason = reason || 'Review hidden by moderator';
          break;

        case 'unhide':
          updateData.isApproved = true;
          updateData.moderatedAt = new Date();
          updateData.moderatedBy = adminId;
          updateData.moderationReason = null;
          break;

        default:
          throw new Error('Invalid moderation action');
      }

      // Update review
      const review = await tx.review.update({
        where: { id: params.id },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
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

      // Recalculate place rating (only count approved reviews)
      const approvedReviews = await tx.review.findMany({
        where: {
          placeId: existingReview.placeId,
          deletedAt: null,
          isApproved: true,
        },
        select: { rating: true },
      });

      const totalRating = approvedReviews.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = approvedReviews.length > 0 ? totalRating / approvedReviews.length : 0;

      await tx.place.update({
        where: { id: existingReview.placeId },
        data: {
          averageRating,
          totalReviews: approvedReviews.length,
        },
      });

      return review;
    });

    return NextResponse.json(
      {
        success: true,
        data: moderatedReview,
        message: `Review ${action}d successfully`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Reviews Moderate API] POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
