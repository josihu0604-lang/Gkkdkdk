const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    // Turbopack enabled for faster dev builds
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  images: {
    domains: ['cdn.zzik.com'],
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.zzik.com',
        pathname: '/**',
      },
    ],
  },
  // Enable React Server Components optimizations
  reactStrictMode: true,
  swcMinify: true,
  
  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Vercel-specific optimizations
  ...(process.env.VERCEL && {
    async headers() {
      return [
        {
          source: '/:all*(svg|jpg|png|webp|avif)',
          locale: false,
          headers: [
            {
              key: 'Cache-Control',
              value: 'public, max-age=31536000, immutable',
            }
          ],
        },
      ]
    },
  }),
};

module.exports = withNextIntl(nextConfig);
