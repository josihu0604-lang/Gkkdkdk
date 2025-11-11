import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // A list of all locales that are supported
  locales: ['ko', 'zh-CN', 'ja-JP'],

  // Used when no locale matches
  defaultLocale: 'ko',
  
  // Always use locale prefix
  localePrefix: 'always'
});

export const config = {
  // Match only internationalized pathnames
  matcher: [
    // Enable a redirect to a matching locale at the root
    '/',

    // Set a cookie to remember the previous locale for
    // all requests that have a locale prefix
    '/(ko|zh-CN|ja-JP)/:path*',

    // Enable redirects that add missing locales but exclude API routes
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ]
};
