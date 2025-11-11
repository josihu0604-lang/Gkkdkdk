import { NextRequest, NextResponse } from 'next/server';
import {
  getPlaceById,
  getOrCreateUser,
  storeCheckIn,
  CheckIn,
} from '@/lib/db-mock';
import {
  verifyGPSIntegrity,
  validateCheckInRequest,
  generateIdempotencyKey,
  GPSIntegrityData,
} from '@/lib/gps-integrity';

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10; // 10 requests per minute
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

/**
 * POST /api/check-in - Submit check-in with GPS verification
 * 
 * Body:
 * {
 *   user_id: string,
 *   place_id: string,
 *   location: { latitude: number, longitude: number, accuracy: number },
 *   wifi?: { ssids: string[] },
 *   timestamp: string (ISO 8601),
 *   motion?: { x: number, y: number, z: number }
 * }
 */
/**
 * Rate limiting middleware
 */
function checkRateLimit(clientId: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const clientData = rateLimitMap.get(clientId);

  if (!clientData || now > clientData.resetAt) {
    // Reset or initialize
    rateLimitMap.set(clientId, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return { allowed: true };
  }

  if (clientData.count >= RATE_LIMIT_MAX_REQUESTS) {
    const retryAfter = Math.ceil((clientData.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }

  clientData.count++;
  return { allowed: true };
}

export async function POST(request: NextRequest) {
  const startTime = performance.now();
  
  try {
    // Rate limiting
    const clientId = request.headers.get('x-forwarded-for') || request.ip || 'anonymous';
    const rateLimitResult = checkRateLimit(clientId);
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later.',
          retryAfter: rateLimitResult.retryAfter,
        },
        { 
          status: 429,
          headers: {
            'Retry-After': String(rateLimitResult.retryAfter),
            'X-RateLimit-Limit': String(RATE_LIMIT_MAX_REQUESTS),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.floor(Date.now() / 1000) + (rateLimitResult.retryAfter || 60)),
          },
        }
      );
    }

    // Parse and validate request body
    let body: any;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        {
          error: 'Invalid JSON',
          message: 'Request body must be valid JSON',
        },
        { status: 400 }
      );
    }

    // Validate request schema
    const validation = validateCheckInRequest(body);
    if (!validation.valid) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          message: validation.errors.join(', '),
        },
        { status: 400 }
      );
    }

    // Extract data
    const {
      user_id = 'user-anonymous',
      place_id,
      location,
      wifi,
      timestamp,
      motion,
    } = body;

    // Get place data
    const place = getPlaceById(place_id);
    if (!place) {
      return NextResponse.json(
        {
          error: 'Place not found',
          message: `Place with ID ${place_id} does not exist`,
        },
        { status: 404 }
      );
    }

    // Prepare GPS data
    const gpsData: GPSIntegrityData = {
      location,
      wifi,
      timestamp,
      motion,
    };

    // Verify GPS integrity
    const serverTime = new Date();
    const integrityResult = verifyGPSIntegrity(gpsData, place, serverTime);

    // Generate idempotency key (now async)
    const idempotencyKey = await generateIdempotencyKey(user_id, place_id, timestamp);

    // Create check-in record
    const checkIn: CheckIn = {
      id: idempotencyKey,
      user_id,
      place_id,
      integrity_score: integrityResult.score,
      score_distance: integrityResult.breakdown.distance,
      score_wifi: integrityResult.breakdown.wifi,
      score_time: integrityResult.breakdown.time,
      score_accuracy: integrityResult.breakdown.accuracy,
      score_speed: integrityResult.breakdown.speed,
      status: integrityResult.valid ? 'approved' : 'rejected',
      created_at: serverTime.toISOString(),
    };

    // Store check-in
    storeCheckIn(checkIn);

    // Update user stats if approved
    if (integrityResult.valid) {
      const user = getOrCreateUser(user_id);
      user.total_check_ins += 1;
      user.xp += 10; // Award XP for successful check-in

      // Level up logic (every 100 XP = 1 level)
      const newLevel = Math.floor(user.xp / 100) + 1;
      if (newLevel > user.level) {
        user.level = newLevel;
      }
    }

    // Calculate performance metrics
    const endTime = performance.now();
    const processingTime = Math.round(endTime - startTime);

    // Return result with performance headers
    return NextResponse.json(
      {
        success: integrityResult.valid,
        data: {
          check_in: checkIn,
          integrity: {
            score: integrityResult.score,
            breakdown: integrityResult.breakdown,
            details: integrityResult.details,
            threshold: 60,
          },
          place: {
            id: place.id,
            name: place.business_name,
            category: place.category,
          },
          voucher: integrityResult.valid
            ? {
                type: place.voucher_type,
                value: place.voucher_value,
                description: place.voucher_description,
              }
            : null,
        },
      },
      {
        headers: {
          'X-Processing-Time': `${processingTime}ms`,
          'X-Request-ID': checkIn.id,
          'Cache-Control': 'no-store, must-revalidate',
        },
      }
    );
  } catch (error) {
    // Enhanced error logging with context
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('Error processing check-in:', {
      message: errorMessage,
      stack: errorStack,
      timestamp: new Date().toISOString(),
    });
    
    // Don't expose internal error details to client
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to process check-in. Please try again.',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/check-in - Get user's check-in history
 * 
 * Query params:
 * - user_id: string (required)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json(
        {
          error: 'Missing user_id',
          message: 'user_id query parameter is required',
        },
        { status: 400 }
      );
    }

    // This would query the database in production
    // For now, return empty array
    return NextResponse.json({
      success: true,
      data: {
        check_ins: [],
        count: 0,
      },
    });
  } catch (error) {
    console.error('Error fetching check-ins:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to fetch check-ins',
      },
      { status: 500 }
    );
  }
}
