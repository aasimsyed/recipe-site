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
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn', 'info'],
    } : false,
  },
  transpilePackages: [
    'next-auth',
    '@next-auth/prisma-adapter',
    'next-cloudinary'
  ],
  webpack: (config, { dev, isServer }) => {
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
      
      // Add polyfill for 'self' in server environment
      config.plugins.push(
        new webpack.DefinePlugin({
          'self': 'global',
        })
      )
    }

    // Production optimizations
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
        splitChunks: {
          cacheGroups: {
            vendor: {
              name: 'vendors',
              test: /[\\/]node_modules[\\/]/,
              chunks: (chunk) => {
                // Exclude chunks that might use browser-only globals
                return !(chunk.name && /api|middleware/.test(chunk.name));
              },
              priority: 10,
            },
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            },
          },
        },
      }
    }

    // Development optimizations
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: ['**/node_modules', '**/.git'],
        aggregateTimeout: 300,
      }
    }

    return config
  },
}

module.exports = nextConfig 