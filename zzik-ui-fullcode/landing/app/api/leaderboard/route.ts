/**
 * Leaderboard API
 * GET /api/leaderboard - Get top users by points
 */

import { NextRequest, NextResponse } from 'next/server';
import { getLeaderboard } from '@/lib/db-optimizer';
import { prisma } from '@/lib/prisma';
import { rateLimit, RateLimitPresets, getClientIp } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

/**
 * GET /api/leaderboard
 * Get leaderboard rankings
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Rate limiting
    const clientIp = getClientIp(request);
    const rateLimitResult = await rateLimit(
      `leaderboard:${clientIp}`,
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
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const timeframe = searchParams.get('timeframe') as 'all' | 'month' | 'week' || 'all';
    
    // Get leaderboard
    const leaderboard = await getLeaderboard(prisma, {
      limit,
      offset,
      timeframe,
    });
    
    const duration = Date.now() - startTime;
    logger.info('Leaderboard retrieved', {
      count: leaderboard.length,
      timeframe,
      duration,
    });
    
    return NextResponse.json({
      success: true,
      data: leaderboard,
      pagination: {
        limit,
        offset,
        hasMore: leaderboard.length === limit,
      },
    });
    
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Failed to get leaderboard', error, { duration });
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
