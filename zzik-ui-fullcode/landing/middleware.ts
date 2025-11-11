import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

// Create i18n middleware
const intlMiddleware = createMiddleware({
  // A list of all locales that are supported
  locales: ['ko', 'zh-CN', 'ja-JP'],

  // Used when no locale matches
  defaultLocale: 'ko',
  
  // Always use locale prefix
  localePrefix: 'always'
});

export default function middleware(request: NextRequest) {
  // Apply i18n middleware first
  const response = intlMiddleware(request);

  // Add security headers to all responses
  const headers = new Headers(response.headers);
  
  // CORS headers for API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    const origin = request.headers.get('origin') || '';
    const allowedOrigins = [
      'http://localhost:8081',  // Expo web
      'http://localhost:3000',  // Next.js dev
      'exp://localhost:8081',   // Expo mobile
    ];
    
    // In production, add your production domains
    if (process.env.NODE_ENV === 'production') {
      // Add production origins here
      // allowedOrigins.push('https://zzik.app', 'https://www.zzik.app');
    }
    
    // Check if origin is allowed
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
      headers.set('Access-Control-Allow-Origin', origin || '*');
      headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
      headers.set('Access-Control-Max-Age', '86400'); // 24 hours
    }
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 200, headers });
    }
  }
  
  // Security headers (applied to all routes)
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('X-XSS-Protection', '1; mode=block');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');
  
  // Content Security Policy (CSP)
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js requires unsafe-eval in dev
    "style-src 'self' 'unsafe-inline'", // Tailwind requires unsafe-inline
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' http://localhost:* https:",
    "frame-ancestors 'none'",
  ];
  headers.set('Content-Security-Policy', cspDirectives.join('; '));
  
  // Strict Transport Security (only in production with HTTPS)
  if (process.env.NODE_ENV === 'production') {
    headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  return new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export const config = {
  // Match all routes including API routes
  matcher: [
    // Enable a redirect to a matching locale at the root
    '/',

    // Set a cookie to remember the previous locale for
    // all requests that have a locale prefix
    '/(ko|zh-CN|ja-JP)/:path*',

    // Enable redirects that add missing locales but exclude static files
    '/((?!_next|_vercel|.*\\..*).*)',
    
    // Include API routes for CORS
    '/api/:path*'
  ]
};
