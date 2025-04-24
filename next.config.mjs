import {withSentryConfig} from '@sentry/nextjs';
/**
 * @type {import('next').NextConfig}
 * Enhanced configuration for Buildappswith platform with security and performance optimizations
 * Version: 0.1.78
 */

// Import the BundleAnalyzerPlugin for webpack bundle analysis
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

/**
 * Define Content Security Policy directives
 * Carefully configured to allow necessary resources while maintaining security
 * Updated for Clerk authentication (v1.0.59)
 */
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://cdnjs.cloudflare.com https://*.clerk.accounts.dev https://clerk.io https://*.clerk.com https://npm.clerk.dev https://npm/@clerk;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.clerk.accounts.dev;
  img-src 'self' blob: data: https://*.stripe.com https://api.placeholder.org https://cdn.magicui.design https://randomuser.me https://placehold.co https://*.clerk.com https://img.clerk.com;
  font-src 'self' data: https://fonts.gstatic.com;
  frame-src 'self' https://js.stripe.com https://*.stripe.com https://*.clerk.accounts.dev;
  connect-src 'self' https://api.stripe.com https://*.vercel-insights.com http://localhost:* https://localhost:* https://*.clerk.accounts.dev https://clerk.io https://*.clerk.com https://*.sentry.io https://*.ingest.sentry.io;
  object-src 'none';
`;

/**
 * Configure security headers to protect against common web vulnerabilities
 * Each header serves a specific security purpose
 */
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy.replace(/\s{2,}/g, ' ').trim(),
  },
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
];

const nextConfig = {
  reactStrictMode: true,
  
  // Configure image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    domains: [], // Deprecated but keeping empty array for backward compatibility
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60, // Cache optimized images for at least 60 seconds
    // Use remote patterns for more granular control (can be expanded as needed)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.stripe.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.magicui.design',
      },
      {
        protocol: 'https',
        hostname: 'api.placeholder.org',
      },
      {
        protocol: 'https',
        hostname: 'randomuser.me',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
      }
    ],
  },
  
  // Configure header security
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
  
  // Configure redirects for profile consolidation
  async redirects() {
    return [
      {
        source: '/liam',
        destination: '/builder-profile/liam-jons',
        permanent: true,
      },
      // Ensure URLs with trailing slashes also work
      {
        source: '/liam/',
        destination: '/builder-profile/liam-jons',
        permanent: true,
      },
      // Redirect book/liam to book/liam-jons for consistency
      {
        source: '/book/liam',
        destination: '/book/liam-jons',
        permanent: true,
      },
      // Handle legacy NextAuth routes
      {
        source: '/signin',
        destination: '/login',
        permanent: true,
      },
      {
        source: '/signup',
        destination: '/login',
        permanent: true,
      },
    ];
  },
  
  // Optimize bundles
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Accessibility enhancements
  experimental: {
    // Enable correct scroll restoration
    scrollRestoration: true,
    
    // Disable CSS optimization to avoid critters issues
    optimizeCss: false,
  },
  
  // Enable output exporting for static optimization where possible
  output: process.env.NEXT_OUTPUT || 'standalone',
  
  // Configure build output options
  poweredByHeader: false, // Remove X-Powered-By header
  
  // Configure URL compression for better Core Web Vitals
  compress: true,
  
  // Configure webpack for bundle optimization
  webpack: (config, { dev, isServer }) => {
    // Only add bundle analyzer when explicitly enabled via ANALYZE=true environment variable
    if (process.env.ANALYZE === 'true' && !isServer) {
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'server',
          analyzerPort: 8890,
          openAnalyzer: false,
        })
      );
    }
    
    return config;
  },
};

export default withSentryConfig(nextConfig, {
// For all available options, see:
// https://www.npmjs.com/package/@sentry/webpack-plugin#options

org: "build-apps-with",
project: "javascript-nextjs",

// Only print logs for uploading source maps in CI
silent: !process.env.CI,

// For all available options, see:
// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

// Upload a larger set of source maps for prettier stack traces (increases build time)
widenClientFileUpload: true,

// Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
// This can increase your server load as well as your hosting bill.
// Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
// side errors will fail.
// tunnelRoute: "/monitoring",

// Automatically tree-shake Sentry logger statements to reduce bundle size
disableLogger: true,

// Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
// See the following for more information:
// https://docs.sentry.io/product/crons/
// https://vercel.com/docs/cron-jobs
automaticVercelMonitors: true,
});