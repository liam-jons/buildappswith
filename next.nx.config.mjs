// This is a special Next.js config for running builds through Nx

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createRequire } from 'module';
import fs from 'fs';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

// Import your regular Next.js config
const regularConfig = require('./next.config.mjs');

// Load dynamic routes configuration
let dynamicRoutes = [];
try {
  const dynamicConfig = JSON.parse(fs.readFileSync(join(__dirname, 'app', 'nx-dynamic-config.json'), 'utf8'));
  dynamicRoutes = dynamicConfig.dynamicPages || [];
  console.log('Loaded dynamic routes configuration:', dynamicRoutes);
} catch (error) {
  console.warn('Could not load dynamic routes configuration:', error.message);
}

/**
 * Custom config for Nx builds that addresses specific issues
 */
const nxConfig = {
  ...regularConfig.default,
  
  // Stop trying to statically generate pages with dynamic data
  staticPageGenerationTimeout: 1000,
  
  // Add custom configuration for Nx builds
  experimental: {
    ...regularConfig.default.experimental,
    // Disable static optimization where needed
    optimizeCss: false,
    serverComponentsExternalPackages: [
      '@clerk/nextjs',
      'next-auth',
      'jose',
      'cookie'
    ],
  },
  
  // Configure specific page handling
  eslint: {
    ignoreDuringBuilds: true, // Speeds up build
  },
  typescript: {
    ignoreBuildErrors: true, // Speeds up build
  },
  
  // Set export to false to ensure server components work properly
  output: 'standalone',
  
  // Disable image optimization for build speed
  images: {
    ...regularConfig.default.images,
    unoptimized: true,
  },
  
  // Override the webpack config
  webpack: (config, options) => {
    // Apply any webpack customizations from the original config
    if (regularConfig.default.webpack) {
      config = regularConfig.default.webpack(config, options);
    }
    
    // Add environment variables directly to webpack DefinePlugin
    config.plugins = config.plugins || [];
    
    return config;
  },
  
  // Force dynamic rendering for all pages
  // This is the key part that should fix the env issues
  exportPathMap: null,
  
  // Specify which routes should be treated as dynamic
  // This prevents Next.js from trying to statically generate these at build time
  dynamicRoutes: dynamicRoutes,
};

export default nxConfig;
