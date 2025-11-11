import { NextRequest, NextResponse } from 'next/server';
import { getNearbyPlaces } from '@/lib/db-mock';

/**
 * GET /api/places - Get nearby places
 * 
 * Query params:
 * - lat: number (required)
 * - lng: number (required)
 * - radius: number (optional, default: 500 meters)
 * - limit: number (optional, default: 20)
 */
export async function GET(request: NextRequest) {
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

    // Get nearby places
    const places = getNearbyPlaces(lat, lng, radius, limit);

    return NextResponse.json({
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
    });
  } catch (error) {
    console.error('Error fetching places:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to fetch nearby places',
      },
      { status: 500 }
    );
  }
}
