/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure webpack with unique cache names
  webpack: (config, { name }) => {
    // Use the compiler name in the cache name to make it unique
    config.cache = {
      ...config.cache,
      name: `${name}-cache-${Date.now()}`
    };
    return config;
  },
};

export default nextConfig;
