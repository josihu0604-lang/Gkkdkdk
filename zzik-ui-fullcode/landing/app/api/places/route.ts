import { NextRequest, NextResponse } from 'next/server';
import { getNearbyPlaces } from '@/lib/db-mock';

// Simple in-memory cache for nearby places
interface CacheEntry {
  data: any;
  expiresAt: number;
}

const placeCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60000; // 1 minute cache

/**
 * GET /api/places - Get nearby places
 * 
 * Query params:
 * - lat: number (required)
 * - lng: number (required)
 * - radius: number (optional, default: 500 meters)
 * - limit: number (optional, default: 20)
 */
/**
 * Generate cache key from query parameters
 */
function getCacheKey(lat: number, lng: number, radius: number, limit: number): string {
  // Round to 4 decimal places (~11m precision) for better cache hit rate
  const roundedLat = Math.round(lat * 10000) / 10000;
  const roundedLng = Math.round(lng * 10000) / 10000;
  return `${roundedLat},${roundedLng},${radius},${limit}`;
}

/**
 * Clean expired cache entries
 */
function cleanExpiredCache() {
  const now = Date.now();
  for (const [key, entry] of placeCache.entries()) {
    if (now > entry.expiresAt) {
      placeCache.delete(key);
    }
  }
}

export async function GET(request: NextRequest) {
  const startTime = performance.now();
  
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse query parameters
    const lat = parseFloat(searchParams.get('lat') || '');
    const lng = parseFloat(searchParams.get('lng') || '');
    const radius = parseInt(searchParams.get('radius') || '500', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    // Validate parameters
    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        {
          error: 'Invalid parameters',
          message: 'lat and lng must be valid numbers',
        },
        { status: 400 }
      );
    }

    if (lat < -90 || lat > 90) {
      return NextResponse.json(
        {
          error: 'Invalid latitude',
          message: 'Latitude must be between -90 and 90',
        },
        { status: 400 }
      );
    }

    if (lng < -180 || lng > 180) {
      return NextResponse.json(
        {
          error: 'Invalid longitude',
          message: 'Longitude must be between -180 and 180',
        },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = getCacheKey(lat, lng, radius, limit);
    const now = Date.now();
    const cachedEntry = placeCache.get(cacheKey);
    
    let places;
    let cacheHit = false;
    
    if (cachedEntry && now < cachedEntry.expiresAt) {
      // Cache hit
      places = cachedEntry.data;
      cacheHit = true;
    } else {
      // Cache miss - fetch from database
      places = getNearbyPlaces(lat, lng, radius, limit);
      
      // Store in cache
      placeCache.set(cacheKey, {
        data: places,
        expiresAt: now + CACHE_TTL_MS,
      });
      
      // Clean expired entries periodically (1% chance)
      if (Math.random() < 0.01) {
        cleanExpiredCache();
      }
    }

    const endTime = performance.now();
    const processingTime = Math.round(endTime - startTime);

    return NextResponse.json(
      {
        success: true,
        data: {
          places,
          count: places.length,
          query: {
            lat,
            lng,
            radius,
            limit,
          },
        },
      },
      {
        headers: {
          'X-Cache': cacheHit ? 'HIT' : 'MISS',
          'X-Processing-Time': `${processingTime}ms`,
          'Cache-Control': 'public, max-age=60, stale-while-revalidate=30',
        },
      }
    );
  } catch (error) {
    // Enhanced error logging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching places:', {
      message: errorMessage,
      timestamp: new Date().toISOString(),
    });
    
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to fetch nearby places. Please try again.',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
