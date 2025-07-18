import type { NextConfig } from 'next';
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const nextConfig: NextConfig = {
  
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        events: false,
      };
    }
    return config;
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.gravatar.com',  
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },

    ],
    // domains: ['res.cloudinary.com'],
  },
  
};

export default nextConfig;
