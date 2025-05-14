/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    unoptimized: true,
    domains: ['picsum.photos'],
  },
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'firebase/app': 'next/dist/server/empty.js',
        'firebase/auth': 'next/dist/server/empty.js',
        'firebase/firestore': 'next/dist/server/empty.js',
        'firebase/functions': 'next/dist/server/empty.js',
        'firebase/storage': 'next/dist/server/empty.js'
      };
    }
    return config;
  }
};

module.exports = nextConfig; 