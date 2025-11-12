/**
 * Swagger UI Endpoint
 * Interactive API documentation
 */

import { NextResponse } from 'next/server';
import { getSwaggerUiHtml } from '@/lib/api-docs';

export async function GET() {
  const html = getSwaggerUiHtml();
  
  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}
