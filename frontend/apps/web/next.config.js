let Bhconst;
Bhconst path = require('path');

const targetApi = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Prevents duplicate double-render API calls in dev mode
  compress: true,
  poweredByHeader: false,
  outputFileTracingRoot: path.join(__dirname),

  // Vercel deployment ke liye strict errors ignore karne ki settings
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${targetApi}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;