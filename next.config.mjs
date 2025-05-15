// Re-enabled Sentry with optimized configuration
import {withSentryConfig} from '@sentry/nextjs';
/**
 * @type {import('next').NextConfig}
 * Enhanced configuration for Buildappswith platform with security and performance optimizations
 * Version: 0.1.84
 */

// Import the BundleAnalyzerPlugin for webpack bundle analysis
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import { fileURLToPath } from 'url';
import path from 'path';

// Convert ESM URL to file path
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Define Content Security Policy directives
 * Carefully configured to allow necessary resources while maintaining security
 * Updated for Clerk authentication with custom domain support (v1.0.60)
 */
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://cdnjs.cloudflare.com https://*.clerk.accounts.dev https://flying-troll-12.clerk.accounts.dev https://clerk.io https://*.clerk.com https://npm.clerk.dev https://npm/@clerk https://*.calendly.com https://assets.calendly.com https://clerk.buildappswith.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.clerk.accounts.dev https://*.calendly.com;
  img-src 'self' blob: data: https://*.stripe.com https://api.placeholder.org https://cdn.magicui.design https://randomuser.me https://placehold.co https://*.clerk.com https://img.clerk.com https://images.clerk.dev https://clerk.buildappswith.com https://*.calendly.com https://i.pravatar.cc https://images.unsplash.com;
  font-src 'self' data: https://fonts.gstatic.com https://*.calendly.com;
  frame-src 'self' https://js.stripe.com https://*.stripe.com https://*.clerk.accounts.dev https://calendly.com https://*.calendly.com;
  connect-src 'self' https://api.stripe.com https://*.vercel-insights.com http://localhost:* https://localhost:* https://*.clerk.accounts.dev https://flying-troll-12.clerk.accounts.dev https://clerk.io https://*.clerk.com https://*.sentry.io https://*.ingest.sentry.io https://ingest.sentry.io https://*.calendly.com https://clerk.buildappswith.com;
  worker-src 'self' blob:;
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
  
  // Exclude archived directories from the build
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
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
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: '**.clerk.com',
      },
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
      {
        protocol: 'https',
        hostname: 'images.clerk.dev',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'clerk.buildappswith.com',
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
      // Handle standardized auth routes
      {
        source: '/login',
        destination: '/sign-in',
        permanent: true,
      },
      {
        source: '/signin',
        destination: '/sign-in',
        permanent: true,
      },
      {
        source: '/signup',
        destination: '/sign-up',
        permanent: true,
      },
      {
        source: '/register',
        destination: '/sign-up',
        permanent: true,
      },
      // No redirects for auth paths - only using (auth) route group
      // Following Clerk best practices with a single auth path approach
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

    // Handle Node.js built-in modules for client-side
    if (!isServer) {
      // Path to our mock implementations
      const nodeModuleMocks = path.join(__dirname, 'lib/datadog/mocks/node-modules.js');
      
      // Define module fallbacks
      config.resolve.fallback = {
        ...config.resolve.fallback,
        // Node.js core modules - provide empty mocks
        fs: nodeModuleMocks,
        os: nodeModuleMocks,
        path: nodeModuleMocks,
        crypto: false,
        async_hooks: nodeModuleMocks,
        diagnostics_channel: nodeModuleMocks,
        worker_threads: false,
        perf_hooks: false,
        module: false,
        child_process: false,
        v8: nodeModuleMocks,

        // Additional Node.js modules
        buffer: false,
        util: false,
        stream: false,
        zlib: false,
        https: false,
        http: false,
        events: false,
        assert: false,
        constants: false,
        domain: false,
        dns: false,
        dgram: false,
        net: false,
        tls: false,
        http2: false,
        process: false,
        readline: false,
        string_decoder: false,
        timers: false,
        tty: false,
        url: false,
        vm: false
      };

      // Create aliases for dd-trace and related modules to use our stub implementations
      config.resolve.alias = {
        ...config.resolve.alias,
        'dd-trace': path.join(__dirname, 'lib/datadog/client/empty-tracer.client.js'),
        
        // Add direct aliases for the problematic Node.js modules
        'fs': nodeModuleMocks,
        'os': nodeModuleMocks,
        'path': nodeModuleMocks,
        'v8': nodeModuleMocks,
        'async_hooks': nodeModuleMocks,
        'diagnostics_channel': nodeModuleMocks
      };

      // Add a plugin to handle Node.js module resolution correctly
      config.plugins.push({
        apply(compiler) {
          // For webpack 5, we need to use this hook differently
          compiler.hooks.normalModuleFactory.tap('NodeModulesMock', factory => {
            // Hook into the factory resolver
            factory.hooks.resolve.tap('NodeModulesMock', (data) => {
              // Check for Node.js modules in the request
              const nodeModules = ['fs', 'os', 'path', 'v8', 'async_hooks', 'diagnostics_channel'];
              
              // If this is a Node.js module request coming from node_modules
              if (data && data.request && nodeModules.includes(data.request) && 
                  (data.context && data.context.includes('node_modules'))) {
                // Point to our mock implementation (don't return, modify)
                data.request = nodeModuleMocks;
              }
            });
          });
        }
      });
    }

    return config;
  },
};

// Configure Sentry with optimized settings for App Router and catch-all routes
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

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors
  automaticVercelMonitors: true,

  // Critical configuration for catch-all routes
  transpileClientSDK: true, // Transpile the Sentry client SDK
  hideSourceMaps: false, // Keep source maps available for debugging

  // Optimized webpack configuration for memory usage
  webpack: {
    // Optimize memory usage during source map generation
    devtool: 'source-map',
    // Reduce parallel compilation to avoid memory pressure
    parallel: 2
  }
}, {
  // Runtime configuration
  // This ensures dynamic imports work properly in both client and server components

  // Silent runtime configuration for better performance
  silent: true,

  // Adjust memory usage for better build performance
  memoryLimit: 2048
});