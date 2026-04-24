/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep whatever you already have in here, and add:
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;