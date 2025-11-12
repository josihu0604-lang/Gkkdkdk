/**
 * Voucher Redemption API
 * POST /api/vouchers/[id]/redeem - Redeem voucher
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { rateLimit, RateLimitPresets, getClientIp } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

/**
 * POST /api/vouchers/[id]/redeem
 * Redeem a voucher
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now();
  
  try {
    // Rate limiting
    const clientIp = getClientIp(request);
    const rateLimitResult = await rateLimit(
      `voucher-redeem:${clientIp}`,
      RateLimitPresets.STRICT.limit,
      RateLimitPresets.STRICT.windowMs
    );
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }
    
    // TODO: Get authenticated user
    // const authUser = await getCurrentUser(request);
    // if (!authUser) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }
    
    // Get voucher
    const voucher = await prisma.voucher.findUnique({
      where: { id: params.id },
      include: {
        place: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
      },
    });
    
    if (!voucher) {
      return NextResponse.json(
        { error: 'Voucher not found' },
        { status: 404 }
      );
    }
    
    // Verify ownership
    // if (voucher.userId !== authUser.id) {
    //   return NextResponse.json(
    //     { error: 'You do not own this voucher' },
    //     { status: 403 }
    //   );
    // }
    
    // Check if already redeemed
    if (voucher.status === 'REDEEMED') {
      return NextResponse.json(
        { error: 'Voucher already redeemed' },
        { status: 400 }
      );
    }
    
    // Check if expired
    if (new Date() > voucher.expiresAt) {
      // Mark as expired
      await prisma.voucher.update({
        where: { id: params.id },
        data: { status: 'EXPIRED' },
      });
      
      return NextResponse.json(
        { error: 'Voucher has expired' },
        { status: 400 }
      );
    }
    
    // Check if cancelled
    if (voucher.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'Voucher has been cancelled' },
        { status: 400 }
      );
    }
    
    // Redeem voucher
    const redeemedVoucher = await prisma.voucher.update({
      where: { id: params.id },
      data: {
        status: 'REDEEMED',
        redeemedAt: new Date(),
      },
      include: {
        place: {
          select: {
            id: true,
            name: true,
            category: true,
            imageUrl: true,
          },
        },
      },
    });
    
    const duration = Date.now() - startTime;
    logger.info('Voucher redeemed', {
      voucherId: params.id,
      userId: voucher.userId,
      placeId: voucher.placeId,
      duration,
    });
    
    // TODO: Process USDC payment if applicable
    // if (voucher.type === 'POINTS' && voucher.value >= 100) {
    //   await processUSDCPayment(voucher);
    // }
    
    return NextResponse.json({
      success: true,
      data: redeemedVoucher,
      message: 'Voucher redeemed successfully!',
    });
    
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Failed to redeem voucher', error, {
      voucherId: params.id,
      duration,
    });
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
