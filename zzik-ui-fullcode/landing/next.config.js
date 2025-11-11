const createNextIntlPlugin = require('next-intl/plugin');
const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Output configuration
  output: 'standalone',
  
  // Compression (gzip enabled by default, brotli for production)
  compress: true,
  
  // Image optimization
  images: {
    domains: ['cdn.zzik.com'],
    formats: ['image/avif', 'image/webp'], // Modern formats first
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60, // Cache optimized images for 60 seconds
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Compiler optimizations
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  
  // SWC minification (faster than Terser)
  swcMinify: true,
  
  // React strict mode for better error detection
  reactStrictMode: true,
  
  // Experimental features for performance
  experimental: {
    // Optimize package imports
    optimizePackageImports: ['lucide-react', '@headlessui/react'],
    
    // Optimize CSS
    optimizeCss: true,
    
    // Enable PPR (Partial Prerendering) when stable
    // ppr: true,
  },
  
  // Headers for performance and security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Cache static assets aggressively
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          // API responses shouldn't be cached by default
          {
            key: 'Cache-Control',
            value: 'no-cache, must-revalidate',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          // Static assets can be cached forever
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  
  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Production optimizations
    if (!dev) {
      // Tree shaking
      config.optimization.usedExports = true;
      
      // Code splitting optimization
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // Vendor chunk
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/,
            priority: 20,
          },
          // Common chunk
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
            enforce: true,
          },
          // Framework chunk (React, Next.js)
          framework: {
            name: 'framework',
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler|next)[\\/]/,
            priority: 40,
            chunks: 'all',
          },
          // next-intl chunk
          i18n: {
            name: 'i18n',
            test: /[\\/]node_modules[\\/](next-intl)[\\/]/,
            priority: 30,
            chunks: 'all',
          },
        },
      };
    }
    
    // Client-side bundle analysis (development only)
    if (!isServer && dev) {
      config.optimization.concatenateModules = true;
    }
    
    return config;
  },
  
  // PoweredBy header removal for security
  poweredByHeader: false,
  
  // Enable production source maps for better debugging (optional)
  productionBrowserSourceMaps: false, // Set to true if needed for debugging
  
  // Optimize fonts
  optimizeFonts: true,
};

module.exports = withNextIntl(nextConfig);
