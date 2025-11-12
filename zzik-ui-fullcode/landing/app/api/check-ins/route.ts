/**
 * Check-ins API
 * GET /api/check-ins - List user check-ins
 * POST /api/check-ins - Create new check-in
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { rateLimit, RateLimitPresets, getClientIp } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';
import { z } from 'zod';
import { calculateGPSIntegrity, WifiNetwork } from '@/lib/gps-integrity';

// Validation schema
const createCheckInSchema = z.object({
  placeId: z.string(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().min(0),
  wifiNetworks: z.array(
    z.object({
      ssid: z.string(),
      bssid: z.string().optional(),
      signalStrength: z.number(),
    })
  ).optional(),
});

/**
 * GET /api/check-ins
 * List check-ins with filters
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Rate limiting
    const clientIp = getClientIp(request);
    const rateLimitResult = await rateLimit(
      `checkins-list:${clientIp}`,
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
    
    const [checkIns, total] = await Promise.all([
      prisma.checkIn.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
              level: true,
            },
          },
          place: {
            select: {
              id: true,
              name: true,
              category: true,
              addressFull: true,
              imageUrl: true,
            },
          },
        },
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.checkIn.count({ where }),
    ]);
    
    const duration = Date.now() - startTime;
    logger.info('Check-ins retrieved', {
      count: checkIns.length,
      total,
      duration,
    });
    
    return NextResponse.json({
      success: true,
      data: checkIns,
      pagination: {
        limit,
        offset,
        total,
        hasMore: offset + checkIns.length < total,
      },
    });
    
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Failed to get check-ins', error, { duration });
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/check-ins
 * Create new check-in with GPS validation
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Rate limiting - stricter for check-ins
    const clientIp = getClientIp(request);
    const rateLimitResult = await rateLimit(
      `checkin-create:${clientIp}`,
      5, // 5 check-ins per minute
      60 * 1000
    );
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many check-ins. Please wait before trying again.' },
        { status: 429 }
      );
    }
    
    // Parse and validate
    const body = await request.json();
    const validationResult = createCheckInSchema.safeParse(body);
    
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
    
    // Get place details
    const place = await prisma.place.findUnique({
      where: { id: data.placeId },
    });
    
    if (!place) {
      return NextResponse.json(
        { error: 'Place not found' },
        { status: 404 }
      );
    }
    
    // Calculate GPS integrity
    const wifiNetworks: WifiNetwork[] = data.wifiNetworks || [];
    const integrity = calculateGPSIntegrity(
      {
        latitude: data.latitude,
        longitude: data.longitude,
        accuracy: data.accuracy,
      },
      {
        latitude: Number(place.latitude),
        longitude: Number(place.longitude),
        wifiSsids: place.wifiSsids,
      },
      wifiNetworks
    );
    
    // Determine status based on integrity
    let status: 'PENDING' | 'APPROVED' | 'REJECTED' = 'PENDING';
    if (integrity.totalScore >= 80) {
      status = 'APPROVED';
    } else if (integrity.totalScore < 50) {
      status = 'REJECTED';
    }
    
    // TODO: Get userId from auth
    const userId = 'user_demo'; // Placeholder
    
    // Create check-in
    const checkIn = await prisma.checkIn.create({
      data: {
        userId,
        placeId: data.placeId,
        status,
        latitude: data.latitude,
        longitude: data.longitude,
        accuracy: data.accuracy,
        integrityScore: integrity.totalScore,
        distanceScore: integrity.distanceScore,
        wifiScore: integrity.wifiScore,
        timeScore: integrity.timeScore || 100,
        accuracyScore: integrity.accuracyScore,
        speedScore: integrity.speedScore || 100,
        distanceMeters: integrity.distanceMeters,
        wifiData: wifiNetworks.length > 0 ? { networks: wifiNetworks } : undefined,
        approvedAt: status === 'APPROVED' ? new Date() : undefined,
        rejectedAt: status === 'REJECTED' ? new Date() : undefined,
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
    
    // If approved, award points and create voucher
    if (status === 'APPROVED') {
      const points = 10; // Base points
      
      // Update user points (TODO: use transaction)
      // await prisma.user.update({
      //   where: { id: userId },
      //   data: {
      //     totalPoints: { increment: points },
      //   },
      // });
      
      // Create voucher
      // await prisma.voucher.create({
      //   data: {
      //     userId,
      //     placeId: data.placeId,
      //     checkInId: checkIn.id,
      //     type: 'PERCENTAGE',
      //     value: 10,
      //     description: '10% off your next visit',
      //     status: 'ACTIVE',
      //     expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      //   },
      // });
    }
    
    const duration = Date.now() - startTime;
    logger.info('Check-in created', {
      checkInId: checkIn.id,
      status,
      integrityScore: integrity.totalScore,
      duration,
    });
    
    return NextResponse.json(
      {
        success: true,
        data: {
          checkIn,
          integrity,
          message:
            status === 'APPROVED'
              ? 'Check-in approved! Points awarded.'
              : status === 'REJECTED'
              ? 'Check-in rejected due to low integrity score.'
              : 'Check-in pending review.',
        },
      },
      { status: 201 }
    );
    
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Failed to create check-in', error, { duration });
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
