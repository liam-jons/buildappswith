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
 */
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://cdnjs.cloudflare.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' blob: data: https://*.stripe.com https://api.placeholder.org https://cdn.magicui.design;
  font-src 'self' data: https://fonts.gstatic.com;
  frame-src 'self' https://js.stripe.com https://*.stripe.com;
  connect-src 'self' https://api.stripe.com https://*.vercel-insights.com http://localhost:* https://localhost:*;
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
    domains: ['api.placeholder.org', 'localhost', 'cdn.magicui.design'],
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

export default nextConfig;
