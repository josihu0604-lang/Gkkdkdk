import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // A list of all locales that are supported
  locales: ['ko', 'zh-CN', 'ja-JP'],

  // Used when no locale matches
  defaultLocale: 'ko',

  // Automatically redirect to the user's preferred locale
  localeDetection: true,

  // Always use the matched locale as prefix
  localePrefix: 'always'
});

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(ko|zh-CN|ja-JP)/:path*']
};
