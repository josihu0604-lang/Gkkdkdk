/**
 * Places API - List and Create
 * GET /api/places - List places with filters
 * POST /api/places - Create new place
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getPlacesNearby } from '@/lib/db-optimizer';
import { rateLimit, RateLimitPresets, getClientIp } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';
import { z } from 'zod';

// Validation schema for place creation
const createPlaceSchema = z.object({
  name: z.string().min(1).max(200),
  category: z.enum(['CAFE', 'RESTAURANT', 'RETAIL', 'ENTERTAINMENT', 'OTHER']),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  addressFull: z.string().min(1),
  addressCity: z.string().optional(),
  addressDistrict: z.string().optional(),
  wifiSsids: z.array(z.string()).optional(),
  description: z.string().max(1000).optional(),
  imageUrl: z.string().url().optional(),
  websiteUrl: z.string().url().optional(),
  phoneNumber: z.string().optional(),
  operatingHours: z.record(z.string()).optional(),
});

/**
 * GET /api/places
 * List places with optional filters
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Rate limiting
    const clientIp = getClientIp(request);
    const rateLimitResult = await rateLimit(
      `places-list:${clientIp}`,
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
    
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radius = searchParams.get('radius');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // If lat/lng provided, use spatial search
    if (lat && lng) {
      const places = await getPlacesNearby(
        prisma,
        parseFloat(lat),
        parseFloat(lng),
        radius ? parseFloat(radius) : 5,
        {
          category: category || undefined,
          limit,
          offset,
        }
      );
      
      const duration = Date.now() - startTime;
      logger.info('Places retrieved (spatial)', {
        count: places.length,
        lat,
        lng,
        radius,
        duration,
      });
      
      return NextResponse.json({
        success: true,
        data: places,
        pagination: {
          limit,
          offset,
          total: places.length,
        },
      });
    }
    
    // Otherwise, use standard query
    const where: any = { isActive: true };
    if (category) {
      where.category = category;
    }
    
    const [places, total] = await Promise.all([
      prisma.place.findMany({
        where,
        select: {
          id: true,
          name: true,
          category: true,
          latitude: true,
          longitude: true,
          addressFull: true,
          addressCity: true,
          imageUrl: true,
          averageRating: true,
          totalCheckIns: true,
          isActive: true,
          isVerified: true,
        },
        take: limit,
        skip: offset,
        orderBy: { totalCheckIns: 'desc' },
      }),
      prisma.place.count({ where }),
    ]);
    
    const duration = Date.now() - startTime;
    logger.info('Places retrieved (list)', {
      count: places.length,
      total,
      duration,
    });
    
    return NextResponse.json({
      success: true,
      data: places,
      pagination: {
        limit,
        offset,
        total,
        hasMore: offset + places.length < total,
      },
    });
    
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Failed to get places', error, { duration });
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/places
 * Create new place
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Rate limiting - strict for creation
    const clientIp = getClientIp(request);
    const rateLimitResult = await rateLimit(
      `places-create:${clientIp}`,
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
    // const authUser = await getCurrentUser(request);
    // if (!authUser) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }
    
    // Parse and validate request body
    const body = await request.json();
    const validationResult = createPlaceSchema.safeParse(body);
    
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
    
    // Check for duplicate place (same name + location)
    const existingPlace = await prisma.place.findFirst({
      where: {
        name: data.name,
        latitude: { gte: data.latitude - 0.001, lte: data.latitude + 0.001 },
        longitude: { gte: data.longitude - 0.001, lte: data.longitude + 0.001 },
      },
    });
    
    if (existingPlace) {
      return NextResponse.json(
        { error: 'Place already exists at this location' },
        { status: 409 }
      );
    }
    
    // Create place
    const place = await prisma.place.create({
      data: {
        name: data.name,
        category: data.category as any,
        latitude: data.latitude,
        longitude: data.longitude,
        addressFull: data.addressFull,
        addressCity: data.addressCity,
        addressDistrict: data.addressDistrict,
        wifiSsids: data.wifiSsids || [],
        description: data.description,
        imageUrl: data.imageUrl,
        websiteUrl: data.websiteUrl,
        phoneNumber: data.phoneNumber,
        operatingHours: data.operatingHours,
        isActive: true,
        isVerified: false, // Requires manual verification
      },
      select: {
        id: true,
        name: true,
        category: true,
        latitude: true,
        longitude: true,
        addressFull: true,
        imageUrl: true,
        createdAt: true,
      },
    });
    
    const duration = Date.now() - startTime;
    logger.info('Place created successfully', {
      placeId: place.id,
      name: place.name,
      duration,
    });
    
    return NextResponse.json(
      {
        success: true,
        data: place,
      },
      { status: 201 }
    );
    
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Failed to create place', error, { duration });
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
