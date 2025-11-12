/**
 * API Documentation Endpoint
 * 
 * Serves OpenAPI 3.0 specification and Swagger UI
 * 
 * GET /api/docs - Swagger UI (HTML)
 * GET /api/docs?format=json - OpenAPI JSON spec
 */

import { NextRequest, NextResponse } from 'next/server';
import { getOpenApiJson, getSwaggerUI } from '@/lib/openapi';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format');

  // Return JSON spec if requested
  if (format === 'json') {
    return new NextResponse(getOpenApiJson(), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  }

  // Return Swagger UI HTML by default
  return new NextResponse(getSwaggerUI(), {
    status: 200,
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
