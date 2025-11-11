import { NextResponse } from 'next/server';

/**
 * GET /api/health - Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'ZZIK API',
    version: '1.0.0',
    endpoints: {
      places: '/api/places?lat=37.4979&lng=127.0276',
      checkIn: '/api/check-in (POST)',
      health: '/api/health',
    },
  });
}
