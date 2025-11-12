/**
 * Places API Endpoint
 * 
 * GET /api/places - Get nearby places or list all places
 * GET /api/places?id=place-id - Get single place by ID
 * GET /api/places?category=cafe - Filter by category
 * GET /api/places?bounds={...} - Filter by bounding box
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger, PerformanceTimer } from '@/lib/logger';
import { Category } from '@prisma/client';

// Cache configuration
interface CacheEntry {
  data: any;
  expiresAt: number;
}

const placeCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60000; // 1 minute cache

/**
 * GET /api/places - Get places with various filters
 */
export async function GET(request: NextRequest) {
  const timer = new PerformanceTimer('places-api');
  
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Check for single place query by ID
    const placeId = searchParams.get('id');
    if (placeId) {
      return await getSinglePlace(placeId, timer);
    }
    
    // Check for category filter
    const category = searchParams.get('category');
    
    // Check for bounds filter
    const boundsParam = searchParams.get('bounds');
    
    // Check cache first
    const cacheKey = `places:${category || 'all'}:${boundsParam || 'no-bounds'}`;
    const now = Date.now();
    const cachedEntry = placeCache.get(cacheKey);
    
    let places;
    let cacheHit = false;
    
    if (cachedEntry && now < cachedEntry.expiresAt) {
      places = cachedEntry.data;
      cacheHit = true;
      logger.info('Places cache hit', { cacheKey });
    } else {
      // Build where clause
      const where: any = { isActive: true };
      
      // Add category filter
      if (category) {
        const categoryUpper = category.toUpperCase();
        if (Object.values(Category).includes(categoryUpper as Category)) {
          where.category = categoryUpper;
        } else {
          return NextResponse.json(
            {
              success: false,
              error: 'Invalid category',
              message: `Category must be one of: ${Object.values(Category).join(', ')}`,
            },
            { status: 400 }
          );
        }
      }
      
      // Add bounds filter
      if (boundsParam) {
        try {
          const bounds = JSON.parse(boundsParam);
          where.latitude = {
            gte: bounds.south,
            lte: bounds.north,
          };
          where.longitude = {
            gte: bounds.west,
            lte: bounds.east,
          };
        } catch (error) {
          return NextResponse.json(
            {
              success: false,
              error: 'Invalid bounds parameter',
              message: 'bounds must be valid JSON with north, south, east, west properties',
            },
            { status: 400 }
          );
        }
      }
      
      // Fetch from database
      places = await prisma.place.findMany({
        where,
        select: {
          id: true,
          name: true,
          category: true,
          latitude: true,
          longitude: true,
          addressFull: true,
          addressCity: true,
          addressDistrict: true,
          addressCountry: true,
          wifiSsids: true,
          description: true,
          imageUrl: true,
          websiteUrl: true,
          phoneNumber: true,
          operatingHours: true,
          totalCheckIns: true,
          averageRating: true,
          isVerified: true,
          createdAt: true,
        },
        orderBy: [
          { isVerified: 'desc' },
          { averageRating: 'desc' },
          { totalCheckIns: 'desc' },
        ],
        take: 100, // Limit to 100 places
      });
      
      // Format response
      places = places.map(place => ({
        id: place.id,
        name: place.name,
        category: place.category.toLowerCase(),
        location: {
          latitude: Number(place.latitude),
          longitude: Number(place.longitude),
        },
        address: {
          full: place.addressFull,
          city: place.addressCity,
          district: place.addressDistrict,
          country: place.addressCountry,
        },
        wifi: {
          ssids: place.wifiSsids,
        },
        description: place.description,
        imageUrl: place.imageUrl,
        websiteUrl: place.websiteUrl,
        phoneNumber: place.phoneNumber,
        operatingHours: place.operatingHours,
        stats: {
          totalCheckIns: place.totalCheckIns,
          averageRating: Number(place.averageRating),
        },
        isVerified: place.isVerified,
        createdAt: place.createdAt.toISOString(),
      }));
      
      // Store in cache
      placeCache.set(cacheKey, {
        data: places,
        expiresAt: now + CACHE_TTL_MS,
      });
      
      logger.info('Places fetched from database', { count: places.length, category, bounds: boundsParam });
    }
    
    timer.end();
    
    return NextResponse.json(
      {
        success: true,
        data: {
          places,
          count: places.length,
          timestamp: new Date().toISOString(),
        },
      },
      {
        headers: {
          'X-Cache': cacheHit ? 'HIT' : 'MISS',
          'Cache-Control': 'public, max-age=60, stale-while-revalidate=30',
        },
      }
    );
  } catch (error) {
    logger.error('Places API error', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'Failed to fetch places. Please try again.',
      },
      { status: 500 }
    );
  }
}

/**
 * Get single place by ID
 */
async function getSinglePlace(placeId: string, timer: PerformanceTimer) {
  try {
    const place = await prisma.place.findUnique({
      where: { id: placeId, isActive: true },
      include: {
        reviews: {
          where: { isApproved: true, isHidden: false },
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            rating: true,
            title: true,
            content: true,
            imageUrls: true,
            videoUrl: true,
            helpfulCount: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
              },
            },
          },
        },
        _count: {
          select: {
            checkIns: true,
            reviews: true,
          },
        },
      },
    });
    
    if (!place) {
      return NextResponse.json(
        {
          success: false,
          error: 'Place not found',
          message: `No place found with ID: ${placeId}`,
        },
        { status: 404 }
      );
    }
    
    // Format response
    const formattedPlace = {
      id: place.id,
      name: place.name,
      category: place.category.toLowerCase(),
      location: {
        latitude: Number(place.latitude),
        longitude: Number(place.longitude),
      },
      address: {
        full: place.addressFull,
        city: place.addressCity,
        district: place.addressDistrict,
        country: place.addressCountry,
      },
      wifi: {
        ssids: place.wifiSsids,
      },
      description: place.description,
      imageUrl: place.imageUrl,
      websiteUrl: place.websiteUrl,
      phoneNumber: place.phoneNumber,
      operatingHours: place.operatingHours,
      stats: {
        totalCheckIns: place.totalCheckIns,
        averageRating: Number(place.averageRating),
        totalReviews: place._count.reviews,
      },
      isVerified: place.isVerified,
      reviews: place.reviews.map(review => ({
        id: review.id,
        rating: review.rating,
        title: review.title,
        content: review.content,
        imageUrls: review.imageUrls,
        videoUrl: review.videoUrl,
        helpfulCount: review.helpfulCount,
        createdAt: review.createdAt.toISOString(),
        user: {
          id: review.user.id,
          username: review.user.username,
          displayName: review.user.displayName,
          avatarUrl: review.user.avatarUrl,
        },
      })),
      createdAt: place.createdAt.toISOString(),
      updatedAt: place.updatedAt.toISOString(),
    };
    
    timer.end();
    
    return NextResponse.json(
      {
        success: true,
        data: {
          place: formattedPlace,
        },
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
        },
      }
    );
  } catch (error) {
    logger.error('Single place fetch error', error, { placeId });
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'Failed to fetch place. Please try again.',
      },
      { status: 500 }
    );
  }
}

/**
 * Clean expired cache entries periodically
 */
function cleanExpiredCache() {
  const now = Date.now();
  for (const [key, entry] of placeCache.entries()) {
    if (now > entry.expiresAt) {
      placeCache.delete(key);
    }
  }
}

// Clean cache every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanExpiredCache, 5 * 60 * 1000);
}
