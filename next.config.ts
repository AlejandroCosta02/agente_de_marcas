import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverRuntimeConfig: {
    maxHeaderSize: 32768, // 32KB
  },
  
  // Remove problematic redirects
  // async redirects() {
  //   return [
  //     // Remove trailing slashes for consistency
  //     // {
  //     //   source: '/:path*/',
  //     //   destination: '/:path*',
  //     //   permanent: true,
  //     // },
  //     // Redirect old paths if any (add your specific redirects here)
  //   ];
  // },

  // SEO and security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Accept-Encoding',
            value: 'gzip, deflate, br',
          },
          // Security headers
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // SEO headers
          {
            key: 'X-Robots-Tag',
            value: 'index, follow',
          },
        ],
      },
      // Specific headers for API routes
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow',
          },
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
      // Headers for static assets
      {
        source: '/:path*.(jpg|jpeg|png|gif|svg|ico|css|js)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Image optimization
  images: {
    domains: ['gestionatusmarcas.com'],
    formats: ['image/webp', 'image/avif'],
  },

  // Enable compression
  compress: true,
  
  // Experimental features for better performance
  experimental: {
    optimizeCss: true,
  },
};

export default nextConfig;
