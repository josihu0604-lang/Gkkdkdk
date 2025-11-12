/**
 * Vouchers API
 * GET /api/vouchers - List user vouchers
 * POST /api/vouchers - Issue voucher
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { rateLimit, RateLimitPresets, getClientIp } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';
import { z } from 'zod';

// Validation schema
const issueVoucherSchema = z.object({
  userId: z.string(),
  placeId: z.string(),
  checkInId: z.string(),
  type: z.enum(['PERCENTAGE', 'FIXED', 'POINTS']),
  value: z.number().min(0),
  description: z.string().min(1).max(500),
  expiresInDays: z.number().min(1).max(90).default(30),
});

/**
 * GET /api/vouchers
 * List vouchers with filters
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Rate limiting
    const clientIp = getClientIp(request);
    const rateLimitResult = await rateLimit(
      `vouchers-list:${clientIp}`,
      RateLimitPresets.STANDARD.limit,
      RateLimitPresets.STANDARD.windowMs
    );
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }
    
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    const where: any = {};
    if (userId) {
      where.userId = userId;
    }
    if (status) {
      where.status = status;
    }
    
    // Only show non-expired vouchers by default
    if (!status) {
      where.status = { in: ['ACTIVE', 'REDEEMED'] };
      where.expiresAt = { gte: new Date() };
    }
    
    const [vouchers, total] = await Promise.all([
      prisma.voucher.findMany({
        where,
        include: {
          place: {
            select: {
              id: true,
              name: true,
              category: true,
              addressFull: true,
              imageUrl: true,
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
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.voucher.count({ where }),
    ]);
    
    const duration = Date.now() - startTime;
    logger.info('Vouchers retrieved', {
      count: vouchers.length,
      total,
      duration,
    });
    
    return NextResponse.json({
      success: true,
      data: vouchers,
      pagination: {
        limit,
        offset,
        total,
        hasMore: offset + vouchers.length < total,
      },
    });
    
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Failed to get vouchers', error, { duration });
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/vouchers
 * Issue new voucher
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Rate limiting
    const clientIp = getClientIp(request);
    const rateLimitResult = await rateLimit(
      `voucher-issue:${clientIp}`,
      RateLimitPresets.STRICT.limit,
      RateLimitPresets.STRICT.windowMs
    );
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }
    
    // TODO: Add admin authentication
    
    // Parse and validate
    const body = await request.json();
    const validationResult = issueVoucherSchema.safeParse(body);
    
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
    
    // Verify check-in exists and is approved
    const checkIn = await prisma.checkIn.findUnique({
      where: { id: data.checkInId },
    });
    
    if (!checkIn) {
      return NextResponse.json(
        { error: 'Check-in not found' },
        { status: 404 }
      );
    }
    
    if (checkIn.status !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Check-in must be approved to issue voucher' },
        { status: 400 }
      );
    }
    
    // Check if voucher already issued for this check-in
    const existingVoucher = await prisma.voucher.findUnique({
      where: { checkInId: data.checkInId },
    });
    
    if (existingVoucher) {
      return NextResponse.json(
        { error: 'Voucher already issued for this check-in' },
        { status: 409 }
      );
    }
    
    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + data.expiresInDays);
    
    // Create voucher
    const voucher = await prisma.voucher.create({
      data: {
        userId: data.userId,
        placeId: data.placeId,
        checkInId: data.checkInId,
        type: data.type as any,
        value: data.value,
        description: data.description,
        status: 'ACTIVE',
        expiresAt,
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
    logger.info('Voucher issued', {
      voucherId: voucher.id,
      userId: data.userId,
      type: data.type,
      value: data.value,
      duration,
    });
    
    // TODO: Send email notification
    // await sendVoucherIssuedEmail(user.email, {
    //   username: user.displayName,
    //   placeName: voucher.place.name,
    //   voucherType: data.type,
    //   voucherValue: formatValue(data.type, data.value),
    //   expiresAt: expiresAt.toLocaleDateString(),
    //   redeemUrl: `${process.env.NEXT_PUBLIC_APP_URL}/vouchers/${voucher.id}`,
    // });
    
    return NextResponse.json(
      {
        success: true,
        data: voucher,
      },
      { status: 201 }
    );
    
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Failed to issue voucher', error, { duration });
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
