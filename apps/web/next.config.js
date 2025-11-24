// apps/web/next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ['@mathquest/database'],
  experimental: {
    // Enable experimental features as needed
  },
};

module.exports = nextConfig;
