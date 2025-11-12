import { NextRequest, NextResponse } from 'next/server';

interface WebVital {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  id: string;
  navigationType?: string;
}

interface VitalsPayload {
  url: string;
  vitals: WebVital[];
  userAgent: string;
  timestamp: number;
}

/**
 * Web Vitals API Endpoint
 * 
 * Collects Core Web Vitals metrics from the client:
 * - FCP (First Contentful Paint)
 * - LCP (Largest Contentful Paint)
 * - CLS (Cumulative Layout Shift)
 * - FID (First Input Delay) / INP (Interaction to Next Paint)
 * - TTFB (Time to First Byte)
 */
export async function POST(request: NextRequest) {
  try {
    const payload: VitalsPayload = await request.json();
    
    // Validate payload
    if (!payload.url || !Array.isArray(payload.vitals)) {
      return NextResponse.json(
        { error: 'Invalid payload' },
        { status: 400 }
      );
    }
    
    // Log to console (in production, send to analytics service)
    console.log('[Web Vitals]', {
      url: payload.url,
      vitals: payload.vitals,
      userAgent: payload.userAgent,
      timestamp: new Date(payload.timestamp).toISOString(),
    });
    
    // In production, send to analytics service:
    // - Google Analytics 4
    // - Vercel Analytics
    // - Custom analytics database
    // - Sentry Performance Monitoring
    
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to external analytics
      // await sendToAnalytics(payload);
      
      // Check for poor performance and alert
      const poorVitals = payload.vitals.filter(v => v.rating === 'poor');
      if (poorVitals.length > 0) {
        console.warn('[Performance Alert]', {
          url: payload.url,
          poorMetrics: poorVitals.map(v => `${v.name}: ${v.value}`),
        });
      }
    }
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('[Web Vitals API Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Rate limiting: Only allow vitals reporting
export const runtime = 'edge';
export const dynamic = 'force-dynamic';
