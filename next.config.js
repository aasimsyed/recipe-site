/** @type {import('next').NextConfig} */
const webpack = require('webpack');

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      }
    ],
    unoptimized: false,
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
  env: {
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  },
  optimizeFonts: true,
  experimental: {
    optimizeCss: false,
    scrollRestoration: true,
    serverComponentsExternalPackages: ['@prisma/client']
  },
  webpack: (config, { dev, isServer }) => {
    // Add polyfill for global in middleware
    config.plugins.push(
      new webpack.DefinePlugin({
        'global': 'globalThis',
      })
    )

    // Common configuration for both client and server
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve?.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        'crypto-browserify': require.resolve('crypto-browserify'),
      }
    }

    // Server-specific configuration
    if (isServer) {
      config.externals = [...(config.externals || []), 'encoding']
    }

    return config
  },
  staticPageGenerationTimeout: 120,
  typescript: {
    ignoreBuildErrors: false,
  },
}

module.exports = nextConfig 